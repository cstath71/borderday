import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import EmbeddedPostgres from 'embedded-postgres';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

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
    ).rejects.toThrow(/row-level security/);
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

  it('a lapsed company blocks new logs but keeps the employee able to read and delete their own', async () => {
    const owner = await newUser('o25@example.com');
    const company = await newCompany(owner);
    const emp = await addMember(owner, company);
    await logDay(emp, company, '2026-04-02');
    await db.query(`update public.bd_companies set subscription_status = 'canceled' where id = $1`, [company]);
    await expect(logDay(emp, company, '2026-04-03')).rejects.toThrow(/row-level security/);
    expect((await as(emp, `select * from public.bd_list_day_types($1, $2)`, [company, emp])).rowCount).toBe(1);
    expect((await as(emp, `delete from public.bd_day_logs where employee_user_id = $1`, [emp])).rowCount).toBe(1);
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
