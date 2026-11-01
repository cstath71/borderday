import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import EmbeddedPostgres from 'embedded-postgres';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LANGS } from '../src/i18n';
import { companyCanEmailInvites } from '../supabase/functions/_shared/invite';

/**
 * RLS against a real PostgreSQL server, with every file in supabase/migrations applied in
 * order. Each statement runs as the Supabase `authenticated` role with auth.uid() set.
 */
const root = resolve(__dirname, '..');
const migrationsDir = join(root, 'supabase/migrations');

let server: EmbeddedPostgres;
let db: pg.Client;
let dataDir: string;

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = createServer();
    s.on('error', rej);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address() as { port: number };
      s.close(() => res(port));
    });
  });
}

type Row = Record<string, any>;

/** Run one statement as `authenticated` (or `anon`) in a rolled-back-on-error transaction. */
async function as(userId: string | null, sql: string, params: unknown[] = []): Promise<pg.QueryResult<Row>> {
  await db.query('begin');
  try {
    await db.query(`select set_config('request.jwt.claim.sub', $1, true)`, [userId ?? '']);
    await db.query(`set local role ${userId ? 'authenticated' : 'anon'}`);
    const res = await db.query(sql, params);
    await db.query('commit');
    return res;
  } catch (e) {
    await db.query('rollback');
    throw e;
  }
}

async function newUser(email: string, confirmed = true): Promise<string> {
  const id = randomUUID();
  await db.query(`insert into auth.users (id, email, email_confirmed_at) values ($1, $2, $3)`, [
    id,
    email,
    confirmed ? new Date() : null,
  ]);
  return id;
}

async function newCompany(ownerId: string, name = 'Acme', paid = true): Promise<string> {
  const { rows } = await as(ownerId, `select public.bd_create_company($1) as id`, [name]);
  if (paid) await db.query(`update public.bd_companies set subscription_status = 'active' where id = $1`, [rows[0].id]);
  return rows[0].id;
}

async function invite(by: string, companyId: string, email: string, role = 'employee'): Promise<string> {
  const { rows } = await as(
    by,
    `insert into public.bd_invitations (company_id, email, role, invited_by)
     values ($1, $2, $3, $4) returning token`,
    [companyId, email, role, by],
  );
  return rows[0].token;
}

async function accept(userId: string, token: string): Promise<string> {
  const { rows } = await as(userId, `select public.bd_accept_invite($1, 'v1', 'en') as id`, [token]);
  return rows[0].id;
}

async function addMember(owner: string, companyId: string, role = 'employee'): Promise<string> {
  const email = `${randomUUID()}@example.com`;
  const id = await newUser(email);
  await accept(id, await invite(owner, companyId, email, role));
  return id;
}

async function roleOf(companyId: string, userId: string): Promise<string | undefined> {
  const { rows } = await db.query(
    `select role from public.bd_company_members where company_id = $1 and user_id = $2`,
    [companyId, userId],
  );
  return rows[0]?.role;
}

async function logDay(userId: string, companyId: string, date: string, note: string | null = null) {
  return as(
    userId,
    `insert into public.bd_day_logs (company_id, employee_user_id, work_date, day_type, note)
     values ($1, $2, $3, 'telework', $4)`,
    [companyId, userId, date, note],
  );
}

beforeAll(async () => {
  dataDir = mkdtempSync(join(tmpdir(), 'bd-rls-pg-'));
  const port = await freePort();
  const password = randomUUID();
  server = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'postgres',
    password,
    port,
    persistent: false,
    onLog: () => {},
    onError: () => {},
  });
  await server.initialise();
  await server.start();
  db = new pg.Client({ host: '127.0.0.1', port, user: 'postgres', password, database: 'postgres' });
  await db.connect();

  await db.query(readFileSync(join(root, 'tests/helpers/supabaseStub.sql'), 'utf8'));
  for (const file of readdirSync(migrationsDir).sort()) {
    await db.query(readFileSync(join(migrationsDir, file), 'utf8'));
  }
}, 120_000);

afterAll(async () => {
  await db?.end();
  await server?.stop();
  rmSync(dataDir, { recursive: true, force: true });
}, 30_000);

describe('real Postgres: harness', () => {
  it('runs on PostgreSQL 15+ with RLS enforced for the authenticated role', async () => {
    const { rows } = await db.query(`show server_version_num`);
    expect(Number(rows[0].server_version_num)).toBeGreaterThanOrEqual(150000);
    const owner = await newUser('harness@example.com');
    const company = await newCompany(owner);
    const stranger = await newUser('harness-stranger@example.com');
    // The harness must be able to see a denial: the owner sees the company, a stranger does not.
    expect((await as(owner, `select id from public.bd_companies where id = $1`, [company])).rowCount).toBe(1);
    expect((await as(stranger, `select id from public.bd_companies where id = $1`, [company])).rowCount).toBe(0);
  });
});

describe('real Postgres: membership (H1)', () => {
  it('cannot self-insert as owner into another company', async () => {
    const owner = await newUser('o1@example.com');
    const attacker = await newUser('a1@example.com');
    const company = await newCompany(owner);
    await expect(
      as(attacker, `insert into public.bd_company_members (company_id, user_id, role) values ($1, $2, 'owner')`, [
        company,
        attacker,
      ]),
    ).rejects.toThrow(/permission denied|row-level security/);
    expect(await roleOf(company, attacker)).toBeUndefined();
  });

  it('owner membership only comes from bd_create_company', async () => {
    const owner = await newUser('o2@example.com');
    const company = await newCompany(owner);
    expect(await roleOf(company, owner)).toBe('owner');
  });

  it('employee cannot promote self to owner by table update', async () => {
    const owner = await newUser('o3@example.com');
    const company = await newCompany(owner);
    const emp = await addMember(owner, company);
    const res = await as(
      emp,
      `update public.bd_company_members set role = 'owner' where company_id = $1 and user_id = $2`,
      [company, emp],
    );
    expect(res.rowCount).toBe(0);
    expect(await roleOf(company, emp)).toBe('employee');
  });

  it('employee cannot change their own member row directly, only through the RPC', async () => {
    const owner = await newUser('o4@example.com');
    const company = await newCompany(owner);
    const emp = await addMember(owner, company);
    const direct = await as(
      emp,
      `update public.bd_company_members set border_pack_id = 'geneva_fr' where company_id = $1 and user_id = $2`,
      [company, emp],
    );
    expect(direct.rowCount).toBe(0);

    await as(emp, `select public.bd_update_member_self($1, 'geneva_fr', 220)`, [company]);
    const { rows } = await db.query(
      `select role, border_pack_id, annual_working_days from public.bd_company_members where company_id = $1 and user_id = $2`,
      [company, emp],
    );
    expect(rows[0]).toEqual({ role: 'employee', border_pack_id: 'geneva_fr', annual_working_days: 220 });
  });

  it('bd_update_member_self rejects non-members and malformed packs', async () => {
    const owner = await newUser('o5@example.com');
    const company = await newCompany(owner);
    const stranger = await newUser('s5@example.com');
    await expect(as(stranger, `select public.bd_update_member_self($1, 'geneva_fr', 220)`, [company])).rejects.toThrow(
      /not a member/,
    );
    await expect(as(owner, `select public.bd_update_member_self($1, 'x'';--', 220)`, [company])).rejects.toThrow(
      /invalid border pack/,
    );
  });

  it('member cannot move their row to another company or user', async () => {
    const owner = await newUser('o6@example.com');
    const other = await newUser('o6b@example.com');
    const company = await newCompany(owner);
    const victim = await newCompany(other, 'Victim');
    await expect(
      as(owner, `update public.bd_company_members set company_id = $1 where company_id = $2 and user_id = $3`, [
        victim,
        company,
        owner,
      ]),
    ).rejects.toThrow(/permission denied/);
  });
});

describe('real Postgres: HR cannot escalate', () => {
  it('HR viewer cannot set anyone to owner, or edit owners or themselves', async () => {
    const owner = await newUser('o7@example.com');
    const company = await newCompany(owner);
    const hr = await addMember(owner, company, 'hr_viewer');
    const emp = await addMember(owner, company);

    expect(
      (
        await as(hr, `update public.bd_company_members set role = 'owner' where company_id = $1 and user_id = $2`, [
          company,
          hr,
        ])
      ).rowCount,
    ).toBe(0);
    await expect(
      as(hr, `update public.bd_company_members set role = 'owner' where company_id = $1 and user_id = $2`, [
        company,
        emp,
      ]),
    ).rejects.toThrow(/row-level security/);
    expect(
      (
        await as(hr, `update public.bd_company_members set role = 'employee' where company_id = $1 and user_id = $2`, [
          company,
          owner,
        ])
      ).rowCount,
    ).toBe(0);
    expect(await roleOf(company, owner)).toBe('owner');
    expect(await roleOf(company, hr)).toBe('hr_viewer');
    expect(await roleOf(company, emp)).toBe('employee');
  });

  it('HR viewer can deactivate an employee, and owner can change roles', async () => {
    const owner = await newUser('o8@example.com');
    const company = await newCompany(owner);
    const hr = await addMember(owner, company, 'hr_viewer');
    const emp = await addMember(owner, company);
    expect(
      (
        await as(hr, `update public.bd_company_members set active = false where company_id = $1 and user_id = $2`, [
          company,
          emp,
        ])
      ).rowCount,
    ).toBe(1);
    await as(owner, `update public.bd_company_members set role = 'owner' where company_id = $1 and user_id = $2`, [
      company,
      hr,
    ]);
    expect(await roleOf(company, hr)).toBe('owner');
  });

  it('A3-04: deactivating an employee drops the seat, the member loses access, and a re-invite restores it', async () => {
    const owner = await newUser('a304a@example.com');
    const company = await newCompany(owner);
    const hr = await addMember(owner, company, 'hr_viewer');
    const email = 'a304b@example.com';
    const emp = await newUser(email);
    await accept(emp, await invite(owner, company, email));
    const seats = async () =>
      (await db.query(`select seat_count from public.bd_companies where id = $1`, [company])).rows[0].seat_count;
    expect(await seats()).toBe(1);

    const res = await as(hr, `update public.bd_company_members set active = false where company_id = $1 and user_id = $2 and role <> 'owner' returning id`, [company, emp]);
    expect(res.rowCount).toBe(1);
    expect(await seats()).toBe(0);

    await expect(
      as(emp, `insert into public.bd_day_logs (company_id, employee_user_id, work_date, day_type) values ($1, $2, '2026-03-02', 'telework')`, [company, emp]),
    ).rejects.toThrow(/row-level security/);
    expect((await as(emp, `select id from public.bd_companies where id = $1`, [company])).rowCount).toBe(0);

    await accept(emp, await invite(owner, company, email));
    expect(await seats()).toBe(1);
  });

  it('RC-01/F32: deactivate via active-only update stamps removed_at; writing removed_at is denied', async () => {
    const owner = await newUser('rc01-owner@example.com');
    const company = await newCompany(owner);
    const emp = await addMember(owner, company);
    // Exact client payload before the fix must fail: authenticated has no UPDATE on removed_at.
    await expect(
      as(
        owner,
        `update public.bd_company_members set active = false, removed_at = now()
         where company_id = $1 and user_id = $2 and role <> 'owner'`,
        [company, emp],
      ),
    ).rejects.toThrow(/permission denied|42501/i);
    // Fixed client payload: only active. Trigger stamps removed_at.
    const res = await as(
      owner,
      `update public.bd_company_members set active = false
       where company_id = $1 and user_id = $2 and role <> 'owner'
       returning id, active, removed_at`,
      [company, emp],
    );
    expect(res.rowCount).toBe(1);
    expect(res.rows[0].active).toBe(false);
    expect(res.rows[0].removed_at).toBeTruthy();
    // Reactivate clears the stamp (trigger).
    const back = await as(
      owner,
      `update public.bd_company_members set active = true
       where company_id = $1 and user_id = $2
       returning active, removed_at`,
      [company, emp],
    );
    expect(back.rows[0]).toMatchObject({ active: true, removed_at: null });
  });

  it('A3-04: HR cannot deactivate an owner or themselves; an employee cannot deactivate anyone', async () => {
    const owner = await newUser('a304c@example.com');
    const company = await newCompany(owner);
    const hr = await addMember(owner, company, 'hr_viewer');
    const emp = await addMember(owner, company);
    const update = (by: string, target: string) =>
      as(by, `update public.bd_company_members set active = false where company_id = $1 and user_id = $2`, [company, target]);
    expect((await update(hr, owner)).rowCount).toBe(0);
    expect((await update(hr, hr)).rowCount).toBe(0);
    expect((await update(emp, hr)).rowCount).toBe(0);
    expect((await update(emp, emp)).rowCount).toBe(0);
  });

  it('A3-04: HR revokes a pending invite, and the link stops working', async () => {
    const owner = await newUser('a304d@example.com');
    const company = await newCompany(owner);
    const hr = await addMember(owner, company, 'hr_viewer');
    const email = 'a304e@example.com';
    const token = await invite(hr, company, email);
    const res = await as(hr, `update public.bd_invitations set status = 'revoked' where token = $1 and status = 'pending' returning id`, [token]);
    expect(res.rowCount).toBe(1);
    const person = await newUser(email);
    await expect(accept(person, token)).rejects.toThrow(/not found or expired/);
  });

  it('HR viewer cannot create an owner invite or rewrite an existing one', async () => {
    const owner = await newUser('o9@example.com');
    const company = await newCompany(owner);
    const hr = await addMember(owner, company, 'hr_viewer');
    await expect(invite(hr, company, 'hr-alt@example.com', 'owner')).rejects.toThrow(/row-level security/);

    await invite(owner, company, 'cofounder@example.com', 'owner');
    await expect(
      as(hr, `update public.bd_invitations set email = 'hr-alt@example.com' where company_id = $1`, [company]),
    ).rejects.toThrow(/permission denied/);
  });

  it('accepted or revoked invite cannot be revived', async () => {
    const owner = await newUser('o10@example.com');
    const company = await newCompany(owner);
    const token = await invite(owner, company, 'revive@example.com');
    await as(owner, `update public.bd_invitations set status = 'revoked' where token = $1`, [token]);
    await expect(
      as(owner, `update public.bd_invitations set status = 'pending' where token = $1`, [token]),
    ).rejects.toThrow(/row-level security/);
  });

  it('HR viewer can create employee invites', async () => {
    const owner = await newUser('o11@example.com');
    const company = await newCompany(owner);
    const hr = await addMember(owner, company, 'hr_viewer');
    expect(await invite(hr, company, 'hire@example.com')).toMatch(/^[0-9a-f]{48}$/);
  });
});

describe('real Postgres: bd_accept_invite email match (H2)', () => {
  it('rejects a mismatched signed-in email and leaves no membership', async () => {
    const owner = await newUser('o12@example.com');
    const company = await newCompany(owner);
    const token = await invite(owner, company, 'intended@example.com', 'owner');
    const wrong = await newUser('wrong@example.com');
    await expect(accept(wrong, token)).rejects.toThrow(/invite email mismatch/);
    expect(await roleOf(company, wrong)).toBeUndefined();
    const { rows } = await db.query(`select status from public.bd_invitations where token = $1`, [token]);
    expect(rows[0].status).toBe('pending');
  });

  it('checks auth.users, so editing bd_profiles.email does not help', async () => {
    const owner = await newUser('o13@example.com');
    const company = await newCompany(owner);
    const token = await invite(owner, company, 'spoof-target@example.com');
    const attacker = await newUser('spoofer@example.com');
    await as(attacker, `select public.bd_create_company('Own co')`);
    await expect(
      as(attacker, `update public.bd_profiles set email = 'spoof-target@example.com' where id = $1`, [attacker]),
    ).rejects.toThrow(/permission denied/);
    await expect(accept(attacker, token)).rejects.toThrow(/invite email mismatch/);
  });

  it('rejects an unconfirmed email', async () => {
    const owner = await newUser('o14@example.com');
    const company = await newCompany(owner);
    const token = await invite(owner, company, 'unconfirmed@example.com');
    const user = await newUser('unconfirmed@example.com', false);
    await expect(accept(user, token)).rejects.toThrow(/email not confirmed/);
  });

  it.each(LANGS)('A3-02: accepts an invite on a %s page and records that language', async (lang) => {
    const owner = await newUser(`o-lang-${lang}@example.com`);
    const company = await newCompany(owner);
    const email = `lang-${lang}@example.com`;
    const token = await invite(owner, company, email);
    const user = await newUser(email);
    await as(user, `select public.bd_accept_invite($1, 'v1', $2)`, [token, lang]);
    const { rows } = await db.query(`select text_lang from public.bd_consents where user_id = $1`, [user]);
    expect(rows).toEqual([{ text_lang: lang }]);
  });

  it('A3-03: bd_company_has_access agrees with the helper the send function uses', async () => {
    const owner = await newUser('o-access@example.com');
    const company = await newCompany(owner, 'Access', false);
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const past = new Date(Date.now() - 86_400_000).toISOString();
    for (const status of ['none', 'trialing', 'active', 'past_due', 'canceled', 'incomplete']) {
      for (const trial of [null, future, past]) {
        await db.query(`update public.bd_companies set subscription_status = $2, trial_ends_at = $3 where id = $1`, [company, status, trial]);
        // As a member: A3-28 answers false to anyone else.
        const { rows } = await as(owner, `select public.bd_company_has_access($1) as ok`, [company]);
        expect(rows[0].ok, `${status} / ${trial}`).toBe(companyCanEmailInvites(status, trial));
      }
    }
  });

  it('A3-03: clients cannot set email_sent_at to reset the send limit', async () => {
    const owner = await newUser('o-sent@example.com');
    const company = await newCompany(owner);
    await invite(owner, company, 'sent@example.com');
    await expect(
      as(owner, `update public.bd_invitations set email_sent_at = null where company_id = $1`, [company]),
    ).rejects.toThrow(/permission denied/);
    await expect(
      as(owner, `insert into public.bd_invitations (company_id, email, invited_by, email_sent_at) values ($1, 'x@example.com', $2, now())`, [company, owner]),
    ).rejects.toThrow(/permission denied/);
  });

  it('A3-03: company names are capped at 120 characters on create and rename', async () => {
    const owner = await newUser('o-name@example.com');
    const company = await newCompany(owner, 'x'.repeat(120));
    await expect(newCompany(owner, 'x'.repeat(121))).rejects.toThrow(/bd_companies_name_length/);
    await expect(as(owner, `update public.bd_companies set name = $2 where id = $1`, [company, 'y'.repeat(121)])).rejects.toThrow(
      /bd_companies_name_length/,
    );
  });

  it('A3-02: the constraint allows exactly the site languages', async () => {
    const { rows } = await db.query(
      `select pg_get_constraintdef(oid) as def from pg_constraint where conname = 'bd_consents_text_lang_check'`,
    );
    const allowed = [...rows[0].def.matchAll(/'([a-z]{2})'/g)].map((m: RegExpMatchArray) => m[1]);
    expect(allowed.sort()).toEqual([...LANGS].sort());
  });

  it('accepts a case-insensitive match, records consent, and creates a missing profile', async () => {
    const owner = await newUser('o15@example.com');
    const company = await newCompany(owner);
    const token = await invite(owner, company, 'Mixed.Case@Example.com');
    const user = await newUser('mixed.case@example.COM');
    await db.query(`delete from public.bd_profiles where id = $1`, [user]);
    expect(await accept(user, token)).toBe(company);
    expect(await roleOf(company, user)).toBe('employee');
    const consent = await db.query(`select consent_version, text_lang from public.bd_consents where user_id = $1`, [user]);
    expect(consent.rows).toEqual([{ consent_version: 'v1', text_lang: 'en' }]);
    const { rows } = await db.query(`select status from public.bd_invitations where token = $1`, [token]);
    expect(rows[0].status).toBe('accepted');
    await expect(accept(user, token)).rejects.toThrow(/not found or expired/);
  });

  it('rejects expired invites and anonymous callers', async () => {
    const owner = await newUser('o16@example.com');
    const company = await newCompany(owner);
    const token = await invite(owner, company, 'late@example.com');
    await db.query(`update public.bd_invitations set expires_at = now() - interval '1 day' where token = $1`, [token]);
    const user = await newUser('late@example.com');
    await expect(accept(user, token)).rejects.toThrow(/not found or expired/);
    await expect(as(null, `select public.bd_accept_invite($1, 'v1', 'en')`, [token])).rejects.toThrow(/permission denied/);
  });

  it('a later employee invite does not demote an existing owner', async () => {
    const owner = await newUser('o17@example.com');
    const company = await newCompany(owner);
    await accept(owner, await invite(owner, company, 'o17@example.com', 'employee'));
    expect(await roleOf(company, owner)).toBe('owner');
  });

  it('invite peek works for anon and returns no token', async () => {
    const owner = await newUser('o18@example.com');
    const company = await newCompany(owner, 'Peek Co');
    const token = await invite(owner, company, 'peek@example.com');
    const { rows } = await as(null, `select * from public.bd_get_invite_by_token($1)`, [token]);
    expect(rows[0].company_name).toBe('Peek Co');
    expect(rows[0].email).toBe('peek@example.com');
    expect(rows[0]).not.toHaveProperty('token');
  });

  it('anon cannot read invitations or companies directly', async () => {
    await expect(as(null, `select token from public.bd_invitations`)).rejects.toThrow(/permission denied/);
    await expect(as(null, `select id from public.bd_companies`)).rejects.toThrow(/permission denied/);
  });
});

describe('real Postgres: purge of unaccepted invites (A3-09)', () => {
  it('deletes never-accepted invites 30 days after expiry, and nothing else', async () => {
    const owner = await newUser('a309@example.com');
    const company = await newCompany(owner);
    const add = async (email: string, status: string, daysAgo: number) => {
      const { rows } = await db.query(
        `insert into public.bd_invitations (company_id, email, role, invited_by, status, expires_at)
         values ($1, $2, 'employee', $3, $4, now() - make_interval(days => $5)) returning id`,
        [company, email, owner, status, daysAgo],
      );
      return rows[0].id as string;
    };
    const oldExpired = await add('a@example.com', 'expired', 31);
    const oldRevoked = await add('b@example.com', 'revoked', 31);
    const oldPending = await add('c@example.com', 'pending', 31);
    const recentExpired = await add('d@example.com', 'expired', 29);
    const recentRevoked = await add('e@example.com', 'revoked', 29);
    const recentPending = await add('f@example.com', 'pending', 1);
    const oldAccepted = await add('g@example.com', 'accepted', 400);
    const live = await add('h@example.com', 'pending', -5);

    const { rows } = await db.query(`select public.bd_purge_expired_data() as result`);
    expect(rows[0].result.invites_deleted).toBeGreaterThanOrEqual(3);
    const left = (await db.query(`select id, status from public.bd_invitations where company_id = $1`, [company])).rows;
    const status = Object.fromEntries(left.map((r) => [r.id, r.status]));
    for (const gone of [oldExpired, oldRevoked, oldPending]) expect(status[gone]).toBeUndefined();
    expect(status[recentExpired]).toBe('expired');
    expect(status[recentRevoked]).toBe('revoked');
    expect(status[recentPending]).toBe('expired');
    expect(status[oldAccepted]).toBe('accepted');
    expect(status[live]).toBe('pending');
  });

  it('clients still cannot run the purge', async () => {
    const user = await newUser('a309b@example.com');
    await expect(as(user, `select public.bd_purge_expired_data()`)).rejects.toThrow(/permission denied/);
    await expect(as(null, `select public.bd_purge_expired_data()`)).rejects.toThrow(/permission denied/);
  });
});

describe('real Postgres: contract requests (A3-08)', () => {
  it('only the service role can touch them: clients can neither read nor write', async () => {
    const insert = `insert into public.bd_contract_requests (kind, name, email) values ('withdrawal', 'Ana', 'a@example.com')`;
    const user = await newUser('a308@example.com');
    await expect(as(user, insert)).rejects.toThrow(/permission denied/);
    await expect(as(null, insert)).rejects.toThrow(/permission denied/);
    await db.query(insert);
    await expect(as(user, `select * from public.bd_contract_requests`)).rejects.toThrow(/permission denied/);
    await expect(as(null, `select * from public.bd_contract_requests`)).rejects.toThrow(/permission denied/);
    const { rows } = await db.query(`select received_at, handled_at from public.bd_contract_requests where email = 'a@example.com'`);
    expect(rows[0].received_at).toBeInstanceOf(Date);
    expect(rows[0].handled_at).toBeNull();
  });

  it('rejects an unknown kind or language, and over-long fields', async () => {
    const row = (kind: string, name: string, lang: string) =>
      db.query(`insert into public.bd_contract_requests (kind, name, email, lang) values ($1, $2, 'b@example.com', $3)`, [kind, name, lang]);
    await expect(row('refund', 'Ana', 'en')).rejects.toThrow(/check/);
    await expect(row('withdrawal', 'x'.repeat(201), 'en')).rejects.toThrow(/check/);
    await expect(row('withdrawal', 'Ana', 'xx')).rejects.toThrow(/check/);
  });
});

describe('real Postgres: DPA version on company creation (A3-13)', () => {
  it('stores version, server time and creator atomically with the company', async () => {
    const owner = await newUser('a313@example.com');
    const before = Date.now();
    const { rows } = await as(owner, `select public.bd_create_company_with_dpa('Acme', '2026-11-01') as id`);
    const stored = await db.query(`select dpa_accepted_version, dpa_accepted_at, dpa_accepted_by from public.bd_companies where id = $1`, [rows[0].id]);
    expect(stored.rows[0].dpa_accepted_version).toBe('2026-11-01');
    expect(stored.rows[0].dpa_accepted_by).toBe(owner);
    expect(stored.rows[0].dpa_accepted_at.getTime()).toBeGreaterThan(before - 60_000);
    const member = await db.query(`select role from public.bd_company_members where company_id = $1 and user_id = $2`, [rows[0].id, owner]);
    expect(member.rows[0].role).toBe('owner');
  });

  it('refuses a missing or malformed version, leaving no company behind', async () => {
    const owner = await newUser('a313b@example.com');
    const count = async () => (await db.query(`select count(*)::int as n from public.bd_companies where name = 'No version'`)).rows[0].n;
    await expect(as(owner, `select public.bd_create_company_with_dpa('No version', null)`)).rejects.toThrow(/dpa version required/);
    await expect(as(owner, `select public.bd_create_company_with_dpa('No version', 'latest')`)).rejects.toThrow(/dpa version required/);
    expect(await count()).toBe(0);
  });

  it('anon cannot call it, and clients can neither read nor forge the record', async () => {
    const owner = await newUser('a313c@example.com');
    await expect(as(null, `select public.bd_create_company_with_dpa('Anon', '2026-11-01')`)).rejects.toThrow(/permission denied/);
    const { rows } = await as(owner, `select public.bd_create_company_with_dpa('Mine', '2026-11-01') as id`);
    await expect(as(owner, `select dpa_accepted_at from public.bd_companies where id = '${rows[0].id}'`)).rejects.toThrow(/permission denied/);
    await expect(as(owner, `update public.bd_companies set dpa_accepted_version = '2020-01-01' where id = '${rows[0].id}'`)).rejects.toThrow(/permission denied/);
  });

  it('the old function keeps working during deployment, with an empty record', async () => {
    const owner = await newUser('a313d@example.com');
    const { rows } = await as(owner, `select public.bd_create_company('Old path') as id`);
    const stored = await db.query(`select dpa_accepted_version from public.bd_companies where id = $1`, [rows[0].id]);
    expect(stored.rows[0].dpa_accepted_version).toBeNull();
  });
});

describe('real Postgres: Stripe events (A3-16)', () => {
  it('only the service role can touch them', async () => {
    const insert = `insert into public.bd_stripe_events (event_id, event_type, event_created_at) values ('evt_x', 'invoice.upcoming', now())`;
    const user = await newUser('a316@example.com');
    await expect(as(user, insert)).rejects.toThrow(/permission denied/);
    await expect(as(null, insert)).rejects.toThrow(/permission denied/);
    await db.query(insert);
    await expect(as(user, `select * from public.bd_stripe_events`)).rejects.toThrow(/permission denied/);
    await expect(as(null, `select * from public.bd_stripe_events`)).rejects.toThrow(/permission denied/);
    const { rows } = await db.query(`select processed_at from public.bd_stripe_events where event_id = 'evt_x'`);
    expect(rows[0].processed_at).toBeNull();
  });
});

describe('real Postgres: day logs', () => {
  it('employee cannot read another employee day logs by table or RPC', async () => {
    const owner = await newUser('o19@example.com');
    const company = await newCompany(owner);
    const e1 = await addMember(owner, company);
    const e2 = await addMember(owner, company);
    await logDay(e1, company, '2026-03-02');

    expect((await as(e2, `select * from public.bd_day_logs where employee_user_id = $1`, [e1])).rowCount).toBe(0);
    await expect(as(e2, `select * from public.bd_list_day_types($1, $2)`, [company, e1])).rejects.toThrow(
      /day log access denied/,
    );
    expect((await as(e2, `select * from public.bd_list_day_types($1)`, [company])).rowCount).toBe(0);
    expect((await as(e1, `select * from public.bd_list_day_types($1, $2)`, [company, e1])).rowCount).toBe(1);
  });

  it('HR reads day types and dates through the RPC, never the note', async () => {
    const owner = await newUser('o20@example.com');
    const company = await newCompany(owner);
    const hr = await addMember(owner, company, 'hr_viewer');
    const emp = await addMember(owner, company);
    await logDay(emp, company, '2026-03-03', 'dentist appointment');

    const { rows } = await as(hr, `select * from public.bd_list_day_types($1, $2)`, [company, emp]);
    expect(rows).toHaveLength(1);
    expect(rows[0].day_type).toBe('telework');
    expect(Object.keys(rows[0]).sort()).toEqual(['day_type', 'employee_user_id', 'work_date']);
    expect(JSON.stringify(rows)).not.toContain('dentist');

    expect((await as(hr, `select note from public.bd_day_logs where employee_user_id = $1`, [emp])).rowCount).toBe(0);
    expect((await as(owner, `select note from public.bd_day_logs where employee_user_id = $1`, [emp])).rowCount).toBe(0);
    const own = await as(emp, `select note from public.bd_day_logs where employee_user_id = $1`, [emp]);
    expect(own.rows[0].note).toBe('dentist appointment');
  });

  it('Phase 2: HR sees the overnight flag through bd_list_day_records, never the note', async () => {
    const owner = await newUser('p2a@example.com');
    const company = await newCompany(owner);
    const hr = await addMember(owner, company, 'hr_viewer');
    const emp = await addMember(owner, company);
    await as(
      emp,
      `insert into public.bd_day_logs (company_id, employee_user_id, work_date, day_type, note, overnight_away_for_work)
       values ($1, $2, '2026-03-03', 'onsite', 'hotel in Lugano', true)`,
      [company, emp],
    );
    const { rows } = await as(hr, `select * from public.bd_list_day_records($1, $2)`, [company, emp]);
    expect(Object.keys(rows[0]).sort()).toEqual(['corrected_at', 'day_share', 'day_type', 'employee_user_id', 'overnight_away_for_work', 'prior_day_type', 'voided_at', 'work_date']);
    expect(rows[0].overnight_away_for_work).toBe(true);
    expect(JSON.stringify(rows)).not.toContain('Lugano');
    const self = await as(emp, `select * from public.bd_list_day_records($1)`, [company]);
    expect(self.rowCount).toBe(1);
    // The old RPC keeps working for installed PWAs and keeps its old shape.
    const old = await as(hr, `select * from public.bd_list_day_types($1, $2)`, [company, emp]);
    expect(Object.keys(old.rows[0]).sort()).toEqual(['day_type', 'employee_user_id', 'work_date']);
  });

  it('Phase 2: bd_list_day_records keeps other employees and other companies out', async () => {
    const owner = await newUser('p2b@example.com');
    const company = await newCompany(owner);
    const e1 = await addMember(owner, company);
    const e2 = await addMember(owner, company);
    await logDay(e1, company, '2026-03-04');
    await expect(as(e2, `select * from public.bd_list_day_records($1, $2)`, [company, e1])).rejects.toThrow(/denied/);
    expect((await as(e2, `select * from public.bd_list_day_records($1)`, [company])).rowCount).toBe(0);
    const stranger = await newUser('p2c@example.com');
    await newCompany(stranger, 'Other');
    expect((await as(stranger, `select * from public.bd_list_day_records($1)`, [company])).rowCount).toBe(0);
    await expect(as(null, `select * from public.bd_list_day_records($1)`, [company])).rejects.toThrow();
  });

  it('Phase 2: employees set their own employment % and A1 through the RPC only', async () => {
    const owner = await newUser('p2d@example.com');
    const company = await newCompany(owner);
    const emp = await addMember(owner, company);
    await as(emp, `select public.bd_update_member_profile($1, 80, true, '2027-06-30')`, [company]);
    const { rows } = await db.query(
      `select role, employment_percent, a1_in_place, a1_valid_until::text from public.bd_company_members
       where company_id = $1 and user_id = $2`,
      [company, emp],
    );
    expect(rows[0]).toEqual({ role: 'employee', employment_percent: 80, a1_in_place: true, a1_valid_until: '2027-06-30' });

    const direct = await as(
      emp,
      `update public.bd_company_members set employment_percent = 10 where company_id = $1 and user_id = $2`,
      [company, emp],
    );
    expect(direct.rowCount).toBe(0);
    await expect(as(emp, `select public.bd_update_member_profile($1, 150, false, null)`, [company])).rejects.toThrow(/check/);
    const stranger = await newUser('p2e@example.com');
    await expect(as(stranger, `select public.bd_update_member_profile($1, 80, false, null)`, [company])).rejects.toThrow(
      /not a member/,
    );
    await expect(as(null, `select public.bd_update_member_profile($1, 80, false, null)`, [company])).rejects.toThrow();
  });

  it('H3: employees set contract days through the RPC only; HR can record them; range is enforced', async () => {
    const owner = await newUser('h3a@example.com');
    const company = await newCompany(owner);
    const emp = await addMember(owner, company);
    const days = async () =>
      (await db.query(`select contract_days_per_year as d from public.bd_company_members where company_id = $1 and user_id = $2`, [company, emp]))
        .rows[0].d;

    await as(emp, `select public.bd_update_member_contract_days($1, 100)`, [company]);
    expect(await days()).toBe(100);
    const direct = await as(emp, `update public.bd_company_members set contract_days_per_year = 5 where company_id = $1 and user_id = $2`, [company, emp]);
    expect(direct.rowCount).toBe(0);
    await expect(as(emp, `select public.bd_update_member_contract_days($1, 400)`, [company])).rejects.toThrow(/check/);
    const stranger = await newUser('h3b@example.com');
    await expect(as(stranger, `select public.bd_update_member_contract_days($1, 100)`, [company])).rejects.toThrow(/not a member/);
    await expect(as(null, `select public.bd_update_member_contract_days($1, 100)`, [company])).rejects.toThrow();

    await as(owner, `update public.bd_company_members set contract_days_per_year = 120, annual_working_days = 120 where company_id = $1 and user_id = $2`, [company, emp]);
    expect(await days()).toBe(120);
  });

  it('Phase 2: HR records an employee A1, but HR of another company cannot', async () => {
    const owner = await newUser('p2f@example.com');
    const company = await newCompany(owner);
    const hr = await addMember(owner, company, 'hr_viewer');
    const emp = await addMember(owner, company);
    const ok = await as(
      hr,
      `update public.bd_company_members set a1_in_place = true, a1_valid_until = '2028-01-01', employment_percent = 60
       where company_id = $1 and user_id = $2 returning id`,
      [company, emp],
    );
    expect(ok.rowCount).toBe(1);

    const otherOwner = await newUser('p2g@example.com');
    await newCompany(otherOwner, 'Other');
    const denied = await as(
      otherOwner,
      `update public.bd_company_members set a1_in_place = false where company_id = $1 and user_id = $2 returning id`,
      [company, emp],
    );
    expect(denied.rowCount).toBe(0);

    const peer = await addMember(owner, company);
    const peerTry = await as(
      peer,
      `update public.bd_company_members set a1_in_place = false where company_id = $1 and user_id = $2 returning id`,
      [company, emp],
    );
    expect(peerTry.rowCount).toBe(0);
  });

  it('Phase 2: the personal log keeps the flag and stays self-only', async () => {
    const me = await newUser('p2h@example.com');
    await db.query(
      `insert into public.bd_subscriptions (user_id, plan_kind, status) values ($1, 'individual', 'active')`,
      [me],
    );
    await as(
      me,
      `insert into public.bd_personal_day_logs (user_id, work_date, day_type, overnight_away_for_work)
       values ($1, '2026-03-05', 'onsite', true)`,
      [me],
    );
    const mine = await as(me, `select overnight_away_for_work from public.bd_personal_day_logs where user_id = $1`, [me]);
    expect(mine.rows[0].overnight_away_for_work).toBe(true);
    const other = await newUser('p2i@example.com');
    expect((await as(other, `select 1 from public.bd_personal_day_logs where user_id = $1`, [me])).rowCount).toBe(0);
  });

  it('HR of another company reads nothing', async () => {
    const ownerA = await newUser('o21@example.com');
    const ownerB = await newUser('o21b@example.com');
    const a = await newCompany(ownerA);
    await newCompany(ownerB, 'B');
    const emp = await addMember(ownerA, a);
    await logDay(emp, a, '2026-03-04');
    await expect(as(ownerB, `select * from public.bd_list_day_types($1, $2)`, [a, emp])).rejects.toThrow(
      /day log access denied/,
    );
    expect((await as(ownerB, `select * from public.bd_list_day_types($1)`, [a])).rowCount).toBe(0);
  });

  it('deactivated HR loses read access', async () => {
    const owner = await newUser('o22@example.com');
    const company = await newCompany(owner);
    const hr = await addMember(owner, company, 'hr_viewer');
    const emp = await addMember(owner, company);
    await logDay(emp, company, '2026-03-05');
    await db.query(`update public.bd_company_members set active = false where user_id = $1`, [hr]);
    await expect(as(hr, `select * from public.bd_list_day_types($1, $2)`, [company, emp])).rejects.toThrow(
      /day log access denied/,
    );
  });

  it('employee cannot log for someone else, or move a log to a company they are not in', async () => {
    const owner = await newUser('o23@example.com');
    const other = await newUser('o23b@example.com');
    const company = await newCompany(owner);
    const elsewhere = await newCompany(other, 'Elsewhere');
    const e1 = await addMember(owner, company);
    const e2 = await addMember(owner, company);
    await expect(
      as(
        e1,
        `insert into public.bd_day_logs (company_id, employee_user_id, work_date, day_type) values ($1, $2, '2026-03-06', 'onsite')`,
        [company, e2],
      ),
    ).rejects.toThrow(/row-level security/);
    await logDay(e1, company, '2026-03-07');
    await expect(
      as(e1, `update public.bd_day_logs set company_id = $1 where employee_user_id = $2`, [elsewhere, e1]),
    ).rejects.toThrow(/another company/); // A3-30: the trigger refuses before RLS is checked.
  });
});

describe('real Postgres: E15 private notes', () => {
  it('the employee reads and clears their own note; HR gets it through no route', async () => {
    const owner = await newUser('n1o@example.com');
    const company = await newCompany(owner);
    const hr = await addMember(owner, company, 'hr_viewer');
    const emp = await addMember(owner, company);
    await logDay(emp, company, '2026-05-04', 'secret');
    const own = await as(emp, `select note from public.bd_day_logs where employee_user_id = $1`, [emp]);
    expect(own.rows[0].note).toBe('secret');

    for (const reader of [owner, hr]) {
      expect((await as(reader, `select note from public.bd_day_logs where company_id = $1`, [company])).rowCount).toBe(0);
      const records = await as(reader, `select * from public.bd_list_day_records($1, $2)`, [company, emp]);
      expect(records.rowCount).toBe(1);
      expect(records.rows[0]).not.toHaveProperty('note');
      expect(JSON.stringify(records.rows[0])).not.toContain('secret');
      const types = await as(reader, `select * from public.bd_list_day_types($1, $2)`, [company, emp]);
      expect(JSON.stringify(types.rows[0])).not.toContain('secret');
      // No write route either: HR cannot blank or overwrite it.
      expect((await as(reader, `update public.bd_day_logs set note = 'x' where company_id = $1`, [company])).rowCount).toBe(0);
    }
    await as(emp, `update public.bd_day_logs set note = null where employee_user_id = $1`, [emp]);
    expect((await as(emp, `select note from public.bd_day_logs where employee_user_id = $1`, [emp])).rows[0].note).toBeNull();
  });

  it('notes are capped at 500 characters on both tables', async () => {
    const owner = await newUser('n2o@example.com');
    const company = await newCompany(owner);
    const emp = await addMember(owner, company);
    await logDay(emp, company, '2026-05-05', 'x'.repeat(500));
    await expect(logDay(emp, company, '2026-05-06', 'x'.repeat(501))).rejects.toThrow(/bd_day_logs_note_length/);
    await db.query(`insert into public.bd_subscriptions (user_id, plan_kind, status) values ($1, 'individual', 'active')`, [emp]);
    await expect(
      as(emp, `insert into public.bd_personal_day_logs (user_id, work_date, day_type, note) values ($1, '2026-05-07', 'telework', $2)`, [emp, 'x'.repeat(501)]),
    ).rejects.toThrow(/bd_personal_day_logs_note_length/);
  });
});

describe('real Postgres: E24 removed member keeps their own days', () => {
  it('sees the company name and their days, with the note; can clear own copy; cannot add more', async () => {
    const owner = await newUser('r1o@example.com');
    const company = await newCompany(owner, 'Left Co');
    const emp = await addMember(owner, company);
    await logDay(emp, company, '2026-10-01', 'mine');
    await logDay(emp, company, '2026-10-02');
    const before = await as(emp, `select * from public.bd_my_day_log_companies()`);
    expect(before.rows[0]).toMatchObject({ company_id: company, company_name: 'Left Co', active: true });
    await as(owner, `update public.bd_company_members set active = false where company_id = $1 and user_id = $2`, [company, emp]);

    const { rows } = await as(emp, `select * from public.bd_my_day_log_companies()`);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ company_id: company, company_name: 'Left Co', active: false });
    expect(Number(rows[0].day_count)).toBe(2);
    expect((await as(emp, `select id from public.bd_companies where id = $1`, [company])).rowCount).toBe(0);
    const own = await as(emp, `select note from public.bd_day_logs where company_id = $1 and employee_user_id = $2 order by work_date`, [company, emp]);
    expect(own.rows.map((r) => r.note)).toEqual(['mine', null]);

    await expect(logDay(emp, company, '2026-10-03')).rejects.toThrow(/row-level security/);
    await expect(as(emp, `update public.bd_day_logs set note = 'x' where employee_user_id = $1`, [emp])).rejects.toThrow(/row-level security/);
    // Inactive leavers cannot hard-delete; soft-clear hides their copy and wipes notes. Company rows remain.
    expect((await as(emp, `delete from public.bd_day_logs where company_id = $1 and employee_user_id = $2`, [company, emp])).rowCount).toBe(0);
    await as(emp, `select public.bd_clear_my_day_log_copy($1)`, [company]);
    expect((await as(emp, `select * from public.bd_my_day_log_companies()`)).rowCount).toBe(0);
    // HR cannot SELECT the table; company retention is verified as postgres (bypass RLS).
    const kept = await db.query(
      `select note, employee_cleared_at is not null as cleared from public.bd_day_logs where company_id = $1 order by work_date`,
      [company],
    );
    expect(kept.rowCount).toBe(2);
    expect(kept.rows.every((r) => r.cleared && r.note === null)).toBe(true);
    const hr = await as(owner, `select * from public.bd_list_day_records($1)`, [company]);
    expect(hr.rowCount).toBe(2);
  });

  it('shows a stranger nothing, and anon cannot call it', async () => {
    const owner = await newUser('r2o@example.com');
    const company = await newCompany(owner);
    const emp = await addMember(owner, company);
    await logDay(emp, company, '2026-10-01');
    const stranger = await newUser('r2s@example.com');
    expect((await as(stranger, `select * from public.bd_my_day_log_companies()`)).rowCount).toBe(0);
    expect((await as(owner, `select * from public.bd_my_day_log_companies()`)).rowCount).toBe(0);
    await expect(as(null, `select * from public.bd_my_day_log_companies()`)).rejects.toThrow(/permission denied/);
  });
});

describe('real Postgres: paid access (C8)', () => {
  it('employee of an unpaid company cannot log, and can once it subscribes', async () => {
    const owner = await newUser('o24@example.com');
    const company = await newCompany(owner, 'Unpaid', false);
    const emp = await addMember(owner, company);
    await expect(logDay(emp, company, '2026-04-01')).rejects.toThrow(/row-level security/);
    await db.query(`update public.bd_companies set subscription_status = 'trialing' where id = $1`, [company]);
    await expect(logDay(emp, company, '2026-04-01')).resolves.toMatchObject({ rowCount: 1 });
  });

  it('a lapsed company blocks new logs but keeps the employee able to read and soft-void their own', async () => {
    const owner = await newUser('o25@example.com');
    const company = await newCompany(owner);
    const emp = await addMember(owner, company);
    await logDay(emp, company, '2026-04-02');
    await db.query(`update public.bd_companies set subscription_status = 'canceled' where id = $1`, [company]);
    await expect(logDay(emp, company, '2026-04-03')).rejects.toThrow(/row-level security/);
    expect((await as(emp, `select * from public.bd_list_day_types($1, $2)`, [company, emp])).rowCount).toBe(1);
    // A2-01: hard DELETE is denied; soft-void keeps the employer row.
    expect((await as(emp, `delete from public.bd_day_logs where employee_user_id = $1`, [emp])).rowCount).toBe(0);
    await expect(as(emp, `select public.bd_void_my_day_log($1, '2026-04-02'::date)`, [company])).resolves.toMatchObject({ rowCount: 1 });
    expect((await as(emp, `select * from public.bd_list_day_records($1)`, [company])).rowCount).toBe(0);
    const hrView = await as(owner, `select voided_at, prior_day_type from public.bd_list_day_records($1, $2)`, [company, emp]);
    expect(hrView.rowCount).toBe(1);
    expect(hrView.rows[0].voided_at).toBeTruthy();
    expect(hrView.rows[0].prior_day_type).toBeTruthy();
  });

  it('owner cannot grant themselves a paid status or point at another Stripe customer', async () => {
    const owner = await newUser('o26@example.com');
    const company = await newCompany(owner, 'Free rider', false);
    await expect(
      as(owner, `update public.bd_companies set subscription_status = 'active' where id = $1`, [company]),
    ).rejects.toThrow(/permission denied/);
    await expect(
      as(owner, `update public.bd_companies set trial_ends_at = now() + interval '1 year' where id = $1`, [company]),
    ).rejects.toThrow(/permission denied/);
    await expect(
      as(owner, `update public.bd_companies set stripe_customer_id = 'cus_victim' where id = $1`, [company]),
    ).rejects.toThrow(/permission denied/);
    expect((await as(owner, `update public.bd_companies set name = 'Renamed' where id = $1`, [company])).rowCount).toBe(1);
  });

  it('members cannot read the Stripe customer id', async () => {
    const owner = await newUser('o27@example.com');
    const company = await newCompany(owner);
    await expect(as(owner, `select stripe_customer_id from public.bd_companies where id = $1`, [company])).rejects.toThrow(
      /permission denied/,
    );
  });

  it('personal cloud logs require an active or trialing individual subscription', async () => {
    const user = await newUser('solo@example.com');
    await as(user, `select public.bd_create_company('Own co')`);
    const write = () =>
      as(
        user,
        `insert into public.bd_personal_day_logs (user_id, work_date, day_type) values ($1, '2026-05-01', 'telework')`,
        [user],
      );
    await expect(write()).rejects.toThrow(/row-level security/);
    await db.query(
      `insert into public.bd_subscriptions (user_id, plan_kind, status, stripe_subscription_id)
       values ($1, 'individual', 'past_due', $2)`,
      [user, `sub_${user}`],
    );
    await expect(write()).rejects.toThrow(/row-level security/);
    await db.query(`update public.bd_subscriptions set status = 'trialing' where user_id = $1`, [user]);
    await expect(write()).resolves.toMatchObject({ rowCount: 1 });
  });

  it('users cannot write their own subscription row', async () => {
    const user = await newUser('forge@example.com');
    await expect(
      as(user, `insert into public.bd_subscriptions (user_id, plan_kind, status) values ($1, 'individual', 'active')`, [
        user,
      ]),
    ).rejects.toThrow(/permission denied/);
  });

  it('seat count still follows members through the definer trigger', async () => {
    const owner = await newUser('o28@example.com');
    const company = await newCompany(owner);
    const emp = await addMember(owner, company);
    await addMember(owner, company);
    const seats = async () =>
      (await db.query(`select seat_count from public.bd_companies where id = $1`, [company])).rows[0].seat_count;
    expect(await seats()).toBe(2);
    await as(owner, `update public.bd_company_members set active = false where company_id = $1 and user_id = $2`, [
      company,
      emp,
    ]);
    expect(await seats()).toBe(1);
  });
});

describe('real Postgres: audit-2 low hardening', () => {
  const tables = [
    'bd_profiles', 'bd_companies', 'bd_company_members', 'bd_invitations', 'bd_day_logs',
    'bd_consents', 'bd_personal_day_logs', 'bd_subscriptions', 'bd_contract_requests', 'bd_stripe_events',
  ];

  it('A3-23: anon holds no privilege on any bd_ table', async () => {
    const { rows } = await db.query(
      `select tablename from pg_tables where schemaname = 'public' and tablename like 'bd\\_%'`,
    );
    // A new table must be added to the migration, not missed silently.
    expect(rows.map((r) => r.tablename).sort()).toEqual([...tables].sort());
    for (const table of tables) {
      const grants = await db.query(
        `select privilege_type from information_schema.role_table_grants
         where grantee = 'anon' and table_schema = 'public' and table_name = $1`,
        [table],
      );
      expect(grants.rows, table).toEqual([]);
    }
    await expect(as(null, `select id from public.bd_day_logs limit 1`)).rejects.toMatchObject({ code: '42501' });
  });

  it('A3-23: the invite lookup still works signed out', async () => {
    const owner = await newUser(`${randomUUID()}@example.com`);
    const company = await newCompany(owner);
    const token = await invite(owner, company, `${randomUUID()}@example.com`);
    const { rows } = await as(null, `select company_id from public.bd_get_invite_by_token($1)`, [token]);
    expect(rows[0].company_id).toBe(company);
  });

  it('A3-23: a member still reads and writes through RLS', async () => {
    const owner = await newUser(`${randomUUID()}@example.com`);
    const company = await newCompany(owner);
    const employee = await addMember(owner, company);
    await logDay(employee, company, '2026-03-02');
    expect((await as(employee, `select id from public.bd_day_logs where employee_user_id = $1`, [employee])).rowCount).toBe(1);
    expect((await as(owner, `select id from public.bd_companies where id = $1`, [company])).rowCount).toBe(1);
  });

  it('A3-26: the last active owner cannot be removed, deactivated or demoted', async () => {
    const owner = await newUser(`${randomUUID()}@example.com`);
    const company = await newCompany(owner);
    const del = `delete from public.bd_company_members where company_id = $1 and user_id = $2`;
    const code = { code: 'BD002' };
    await expect(as(owner, del, [company, owner])).rejects.toMatchObject(code);
    await expect(
      as(owner, `update public.bd_company_members set active = false where company_id = $1 and user_id = $2`, [company, owner]),
    ).rejects.toMatchObject(code);
    await expect(
      as(owner, `update public.bd_company_members set role = 'employee' where company_id = $1 and user_id = $2`, [company, owner]),
    ).rejects.toMatchObject(code);
    expect(await roleOf(company, owner)).toBe('owner');
  });

  it('A3-26: an owner can go once a second active owner exists, and other rows are unaffected', async () => {
    const owner = await newUser(`${randomUUID()}@example.com`);
    const company = await newCompany(owner);
    const second = await addMember(owner, company, 'owner');
    const employee = await addMember(owner, company);
    await as(owner, `update public.bd_company_members set active = false where company_id = $1 and user_id = $2`, [company, employee]);
    await as(owner, `update public.bd_company_members set active = true where company_id = $1 and user_id = $2`, [company, employee]);
    await as(owner, `delete from public.bd_company_members where company_id = $1 and user_id = $2`, [company, second]);
    expect(await roleOf(company, second)).toBeUndefined();
    // Back to one owner, so the rule applies again.
    await expect(
      as(owner, `delete from public.bd_company_members where company_id = $1 and user_id = $2`, [company, owner]),
    ).rejects.toMatchObject({ code: 'BD002' });
  });

  it('A3-26: deleting the company or the person still cascades', async () => {
    const owner = await newUser(`${randomUUID()}@example.com`);
    const company = await newCompany(owner);
    await db.query(`delete from public.bd_companies where id = $1`, [company]);
    expect(await roleOf(company, owner)).toBeUndefined();
    const leaver = await newUser(`${randomUUID()}@example.com`);
    const other = await newCompany(leaver);
    await db.query(`delete from public.bd_profiles where id = $1`, [leaver]);
    expect(await roleOf(other, leaver)).toBeUndefined();
  });

  it('A3-27: an employee cannot insert a notice record directly', async () => {
    const owner = await newUser(`${randomUUID()}@example.com`);
    const company = await newCompany(owner);
    const employee = await addMember(owner, company);
    await expect(
      as(
        employee,
        `insert into public.bd_consents (user_id, company_id, consent_version, text_lang, accepted_at)
         values ($1, $2, 'backdated', 'en', '2000-01-01')`,
        [employee, company],
      ),
    ).rejects.toMatchObject({ code: '42501' });
    const { rows } = await db.query(`select consent_version from public.bd_consents where user_id = $1`, [employee]);
    expect(rows.map((r) => r.consent_version)).toEqual(['v1']);
  });

  it('A3-27: the server sets log timestamps, whatever the client sends', async () => {
    const owner = await newUser(`${randomUUID()}@example.com`);
    const company = await newCompany(owner);
    const employee = await addMember(owner, company);
    await as(
      employee,
      `insert into public.bd_day_logs (company_id, employee_user_id, work_date, day_type, created_at, updated_at)
       values ($1, $2, '2026-03-03', 'onsite', '2000-01-01', '2000-01-01')`,
      [company, employee],
    );
    const read = () =>
      db.query(`select created_at, updated_at from public.bd_day_logs where employee_user_id = $1`, [employee]);
    const first = (await read()).rows[0];
    expect(new Date(first.created_at).getFullYear()).toBeGreaterThan(2000);
    expect(new Date(first.updated_at).getFullYear()).toBeGreaterThan(2000);
    await as(
      employee,
      `update public.bd_day_logs set created_at = '2000-01-01', updated_at = '2000-01-01', day_type = 'telework'
       where employee_user_id = $1`,
      [employee],
    );
    const second = (await read()).rows[0];
    expect(second.created_at).toEqual(first.created_at);
    expect(new Date(second.updated_at).getFullYear()).toBeGreaterThan(2000);
  });

  it('A3-28: a stranger learns nothing about another company’s access, a member still can log', async () => {
    const owner = await newUser(`${randomUUID()}@example.com`);
    const company = await newCompany(owner);
    const stranger = await newUser(`${randomUUID()}@example.com`);
    const ask = `select public.bd_company_has_access($1) as ok`;
    expect((await as(stranger, ask, [company])).rows[0].ok).toBe(false);
    expect((await as(owner, ask, [company])).rows[0].ok).toBe(true);
    await logDay(owner, company, '2026-03-04');
  });

  it('A3-29: the profile email follows the auth email, and no profile is created for other users', async () => {
    const email = `${randomUUID()}@example.com`;
    const user = await newUser(email);
    const company = await newCompany(user);
    expect(company).toBeTruthy();
    const moved = `${randomUUID()}@example.com`;
    await db.query(`update auth.users set email = $1 where id = $2`, [moved, user]);
    const { rows } = await db.query(`select email from public.bd_profiles where id = $1`, [user]);
    expect(rows[0].email).toBe(moved);
    const other = await newUser(`${randomUUID()}@example.com`);
    await db.query(`delete from public.bd_profiles where id = $1`, [other]);
    await db.query(`update auth.users set email = $1 where id = $2`, [`${randomUUID()}@example.com`, other]);
    expect((await db.query(`select 1 from public.bd_profiles where id = $1`, [other])).rowCount).toBe(0);
  });

  it('A3-30: logging a date held by another company fails clearly and leaves the first record', async () => {
    const ownerA = await newUser(`${randomUUID()}@example.com`);
    const ownerB = await newUser(`${randomUUID()}@example.com`);
    const a = await newCompany(ownerA, 'A');
    const b = await newCompany(ownerB, 'B');
    const email = `${randomUUID()}@example.com`;
    const person = await newUser(email);
    await accept(person, await invite(ownerA, a, email));
    await accept(person, await invite(ownerB, b, email));
    await logDay(person, a, '2026-03-05');
    // The client's upsert, as PostgREST runs it.
    await expect(
      as(
        person,
        `insert into public.bd_day_logs (company_id, employee_user_id, work_date, day_type)
         values ($1, $2, '2026-03-05', 'onsite')
         on conflict (employee_user_id, work_date)
         do update set company_id = excluded.company_id, day_type = excluded.day_type`,
        [b, person],
      ),
    ).rejects.toMatchObject({ code: 'BD001' });
    const { rows } = await db.query(
      `select company_id, day_type from public.bd_day_logs where employee_user_id = $1 and work_date = '2026-03-05'`,
      [person],
    );
    expect(rows[0]).toEqual({ company_id: a, day_type: 'telework' });
    // The same company can still change its own day.
    await as(
      person,
      `insert into public.bd_day_logs (company_id, employee_user_id, work_date, day_type)
       values ($1, $2, '2026-03-05', 'onsite')
       on conflict (employee_user_id, work_date)
       do update set company_id = excluded.company_id, day_type = excluded.day_type`,
      [a, person],
    );
    // A different date under the second company is fine.
    await logDay(person, b, '2026-03-06');
  });

  it('A3-32: the legacy migration refuses to run once the bd_ schema exists', async () => {
    const legacy = readFileSync(join(migrationsDir, '20261031120000_employer_first.sql'), 'utf8');
    // The harness has already applied it to the empty database, so its tables exist: test the guard alone.
    const guard = legacy.slice(0, legacy.indexOf('$guard$;') + '$guard$;'.length);
    await expect(db.query(guard)).rejects.toThrow(/migration repair --status applied 20261031120000/);
  });
});

describe('real Postgres: A3-34 account export reads', () => {
  it('a member reads their own name, notice records and subscription, and nobody else’s', async () => {
    const owner = await newUser(`${randomUUID()}@example.com`);
    const company = await newCompany(owner);
    const employee = await addMember(owner, company);
    const other = await addMember(owner, company);
    await db.query(`insert into public.bd_subscriptions (user_id, plan_kind, status) values ($1, 'individual', 'active')`, [employee]);
    await db.query(`insert into public.bd_subscriptions (user_id, plan_kind, status) values ($1, 'individual', 'active')`, [other]);
    const profile = await as(employee, `select display_name from public.bd_profiles where id = $1`, [employee]);
    expect(profile.rowCount).toBe(1);
    const notices = await as(employee, `select company_id, consent_version, text_lang, accepted_at from public.bd_consents where user_id = $1`, [employee]);
    expect(notices.rows[0]).toMatchObject({ company_id: company, consent_version: 'v1', text_lang: 'en' });
    const subs = await as(
      employee,
      `select plan_kind, status, current_period_end, trial_ends_at, stripe_customer_id, stripe_subscription_id
       from public.bd_subscriptions where user_id = $1`,
      [employee],
    );
    expect(subs.rows[0]).toMatchObject({ plan_kind: 'individual', status: 'active' });
    expect((await as(employee, `select id from public.bd_subscriptions where user_id = $1`, [other])).rowCount).toBe(0);
    expect((await as(employee, `select id from public.bd_consents where user_id = $1`, [other])).rowCount).toBe(0);
  });
});
