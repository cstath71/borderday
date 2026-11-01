import { beforeEach, describe, expect, it, vi } from 'vitest';

type Call = { table?: string; rpc?: string; args?: unknown; ops: Array<[string, unknown[]]> };

const state = vi.hoisted(() => ({
  calls: [] as any[],
  respond: (_call: any): { data: unknown; error: unknown } => ({ data: null, error: null }),
  invoke: vi.fn(),
}));

/** Chainable stand-in for a PostgREST builder: records every call, resolves through state.respond. */
function builder(call: Call): any {
  const proxy: any = new Proxy(
    {},
    {
      get(_t, prop: string) {
        if (prop === 'then') {
          return (ok: (v: unknown) => unknown, fail: (e: unknown) => unknown) =>
            Promise.resolve(state.respond(call)).then(ok, fail);
        }
        return (...args: unknown[]) => {
          call.ops.push([prop, args]);
          return proxy;
        };
      },
    },
  );
  return proxy;
}

vi.mock('../src/lib/supabase', () => {
  const start = (partial: Partial<Call>) => {
    const call: Call = { ops: [], ...partial };
    state.calls.push(call);
    return builder(call);
  };
  return {
    supabaseConfigured: true,
    supabase: {
      auth: { getUser: async () => ({ data: { user: { id: 'me' } } }) },
      from: (table: string) => start({ table }),
      rpc: (rpc: string, args: unknown) => start({ rpc, args }),
      functions: { invoke: state.invoke },
    },
  };
});

import * as api from '../src/lib/companyApi';

const op = (call: Call, name: string) => call.ops.filter(([n]) => n === name).map(([, a]) => a);

const company = (over: Partial<api.MyCompany> = {}): api.MyCompany => ({
  id: 'c1',
  name: 'Acme',
  role: 'employee',
  subscription_status: 'active',
  trial_ends_at: null,
  seat_count: 1,
  borderPackId: null,
  annualWorkingDays: null,
  profile: { employmentPercent: null, a1InPlace: false, a1ValidUntil: null },
  ...over,
});

beforeEach(() => {
  state.calls.length = 0;
  state.respond = () => ({ data: null, error: null });
  state.invoke.mockReset();
  state.invoke.mockResolvedValue({ data: { sent: false, dryRun: true }, error: null });
});

describe('companyApi', () => {
  it('listMyCompanies only returns the caller row: HR can see every member row of a company', async () => {
    state.respond = () => ({
      data: [
        {
          role: 'owner',
          border_pack_id: null,
          annual_working_days: null,
          bd_companies: { id: 'c1', name: 'Acme', subscription_status: 'active', trial_ends_at: null, seat_count: 3 },
        },
      ],
      error: null,
    });
    const list = await api.listMyCompanies();
    expect(op(state.calls[0], 'eq')).toContainEqual(['user_id', 'me']);
    expect(list).toEqual([expect.objectContaining({ id: 'c1', role: 'owner', seat_count: 3 })]);
  });

  it('getCompany never selects stripe_customer_id', async () => {
    await api.getCompany('c1');
    const [columns] = op(state.calls[0], 'select')[0] as [string];
    expect(columns).not.toMatch(/stripe|\*/);
  });

  it('listDayLogs goes through the RPC, pages past the 1000-row cap, and returns no note', async () => {
    const row = (i: number) => ({ employee_user_id: 'e1', work_date: `d${i}`, day_type: 'telework', note: 'secret' });
    state.respond = (call) => {
      const [[from]] = op(call, 'range') as [[number, number]];
      return { data: from === 0 ? Array.from({ length: 1000 }, (_, i) => row(i)) : [row(1000)], error: null };
    };
    const logs = await api.listDayLogs('c1', 'e1');
    expect(state.calls.map((c) => c.rpc)).toEqual(['bd_list_day_records', 'bd_list_day_records']);
    expect(state.calls[0].args).toEqual({ cid: 'c1', employee: 'e1' });
    expect(op(state.calls[1], 'range')[0]).toEqual([1000, 1999]);
    expect(logs).toHaveLength(1001);
    expect(logs[0]).toEqual({ employeeUserId: 'e1', workDate: 'd0', dayType: 'telework', overnightAway: false, dayShare: 1, voidedAt: null, priorDayType: null, correctedAt: null, employeeLabel: null });
    expect(JSON.stringify(logs)).not.toContain('secret');
  });

  describe('A3-04 offboarding', () => {
    const update = (call: Call) => op(call, 'update')[0]?.[0];

    it('deactivateMember sets active false, never on an owner row, then syncs billing', async () => {
      state.respond = () => ({ data: [{ id: 'm1' }], error: null });
      state.invoke.mockResolvedValueOnce({ data: { available: true, synced: true }, error: null });
      await expect(api.deactivateMember('c1', 'e1')).resolves.toEqual({ billingSynced: true });
      const [call] = state.calls;
      expect(call.table).toBe('bd_company_members');
      expect(update(call)).toMatchObject({ active: false });
      // RC-01: client must not write removed_at — authenticated has no column UPDATE grant; trigger stamps it.
      expect(update(call)).not.toHaveProperty('removed_at');
      expect(op(call, 'eq')).toEqual(expect.arrayContaining([['company_id', 'c1'], ['user_id', 'e1']]));
      expect(op(call, 'neq')).toContainEqual(['role', 'owner']);
      expect(state.invoke).toHaveBeenCalledWith('bd-sync-company-billing', { body: { companyId: 'c1' } });
    });

    it('a row RLS hid is a refusal, and billing is not touched', async () => {
      state.respond = () => ({ data: [], error: null });
      await expect(api.deactivateMember('c1', 'e1')).rejects.toThrow('deactivation denied');
      expect(state.invoke).not.toHaveBeenCalled();
    });

    it('reports an unconfirmed billing sync, without undoing the removal', async () => {
      state.respond = () => ({ data: [{ id: 'm1' }], error: null });
      state.invoke.mockResolvedValueOnce({ data: { available: false, message: 'Forbidden' }, error: null });
      await expect(api.deactivateMember('c1', 'e1')).resolves.toEqual({ billingSynced: false });
      state.invoke.mockResolvedValueOnce({ data: null, error: new Error('500') });
      await expect(api.deactivateMember('c1', 'e1')).resolves.toEqual({ billingSynced: false });
      state.invoke.mockResolvedValueOnce({ data: { available: true, synced: false, reason: 'no_subscription' }, error: null });
      await expect(api.deactivateMember('c1', 'e1')).resolves.toEqual({ billingSynced: true });
    });

    it('canDeactivateMember: owners only, never an owner or yourself, never HR or employee actors', () => {
      const can = (actor: 'owner' | 'hr_viewer' | 'employee', target: 'owner' | 'hr_viewer' | 'employee', self = false) =>
        api.canDeactivateMember({ userId: 'a', role: actor }, { userId: self ? 'a' : 'b', role: target });
      expect(can('owner', 'employee')).toBe(true);
      expect(can('owner', 'hr_viewer')).toBe(true);
      expect(can('hr_viewer', 'employee')).toBe(false);
      expect(can('hr_viewer', 'hr_viewer')).toBe(false);
      expect(can('owner', 'owner')).toBe(false);
      expect(can('hr_viewer', 'owner')).toBe(false);
      expect(can('employee', 'employee')).toBe(false);
      expect(can('owner', 'employee', true)).toBe(false);
    });

    it('revokeInvite touches only a pending invite of this company, and reports a refusal', async () => {
      state.respond = () => ({ data: [{ id: 'i1' }], error: null });
      await api.revokeInvite('c1', 'i1');
      const [call] = state.calls;
      expect(call.table).toBe('bd_invitations');
      expect(update(call)).toEqual({ status: 'revoked' });
      expect(op(call, 'eq')).toEqual(expect.arrayContaining([['id', 'i1'], ['company_id', 'c1'], ['status', 'pending']]));
      state.respond = () => ({ data: [], error: null });
      await expect(api.revokeInvite('c1', 'i1')).rejects.toThrow('revoke denied');
    });
  });

  describe('Phase 2 schema not live yet (site deployed before the migration)', () => {
    const missingFn = { data: null, error: { code: 'PGRST202', message: 'function not found' } };
    const missingCol = { data: null, error: { code: '42703', message: 'column does not exist' } };
    const missingWriteCol = { data: null, error: { code: 'PGRST204', message: 'column not in schema cache' } };

    it('listDayLogs falls back to bd_list_day_types and reports no flags', async () => {
      state.respond = (call) =>
        call.rpc === 'bd_list_day_records'
          ? missingFn
          : { data: [{ employee_user_id: 'e1', work_date: '2026-01-05', day_type: 'telework' }], error: null };
      const logs = await api.listDayLogs('c1');
      expect(state.calls.map((c) => c.rpc)).toEqual(['bd_list_day_records', 'bd_list_day_types']);
      expect(logs).toEqual([{ employeeUserId: 'e1', workDate: '2026-01-05', dayType: 'telework', overnightAway: false, dayShare: 1, voidedAt: null, priorDayType: null, correctedAt: null, employeeLabel: null }]);
    });

    it('listDayLogs still throws on a real error', async () => {
      state.respond = () => ({ data: null, error: { code: '42501', message: 'denied' } });
      await expect(api.listDayLogs('c1')).rejects.toMatchObject({ code: '42501' });
      expect(state.calls).toHaveLength(1);
    });

    it('a set contract-days figure fails visibly before the migration; clearing it does not', async () => {
      const profile = { employmentPercent: 40, a1InPlace: false, a1ValidUntil: null };
      state.respond = (call) => (call.rpc === 'bd_update_member_contract_days' ? missingFn : { data: null, error: null });
      await expect(api.updateMyProfile('c1', { ...profile, contractDaysPerYear: 100 })).rejects.toMatchObject({ code: 'PGRST202' });
      await expect(api.updateMyProfile('c1', { ...profile, contractDaysPerYear: null })).resolves.toBeUndefined();
    });

    it('HR saving a cleared contract-days figure retries without the column; a set one fails visibly', async () => {
      const profile = { employmentPercent: 40, a1InPlace: false, a1ValidUntil: null };
      const update = (call: Call) => op(call, 'update')[0]?.[0] as Record<string, unknown>;
      state.respond = (call) =>
        'contract_days_per_year' in update(call) ? missingWriteCol : { data: [{ id: 'm1' }], error: null };
      await expect(api.updateEmployeeProfile('c1', 'e1', { ...profile, contractDaysPerYear: null })).resolves.toBeUndefined();
      await expect(api.updateEmployeeProfile('c1', 'e1', { ...profile, contractDaysPerYear: 100 })).rejects.toMatchObject({ code: 'PGRST204' });
    });

    it('listMembers and listMyCompanies retry without the new columns', async () => {
      const selected = (call: Call) => String(op(call, 'select')[0]?.[0]);
      state.respond = (call) =>
        selected(call).includes('employment_percent')
          ? missingCol
          : {
              data: [
                {
                  id: 'm1',
                  role: 'employee',
                  border_pack_id: 'luxembourg_fr',
                  annual_working_days: 220,
                  user_id: 'e1',
                  active: true,
                  bd_profiles: { email: 'e@x.test', display_name: 'E' },
                  bd_companies: { id: 'c1', name: 'Acme', subscription_status: 'active', trial_ends_at: null, seat_count: 1 },
                },
              ],
              error: null,
            };
      const [member] = await api.listMembers('c1');
      expect(member).toMatchObject({ userId: 'e1', employmentPercent: null, a1InPlace: false, a1ValidUntil: null });
      const [mine] = await api.listMyCompanies();
      expect(mine.profile).toEqual({ employmentPercent: null, contractDaysPerYear: null, a1InPlace: false, a1ValidUntil: null, frontierBefore2012: false });
    });

    it('logging a plain day still works: the unset flag is dropped', async () => {
      state.respond = (call) => {
        const row = op(call, 'upsert')[0]?.[0] as Record<string, unknown>;
        // Phase 3: first write includes day_share; Phase 2: overnight. Both lag until bare row.
        return 'day_share' in row || 'overnight_away_for_work' in row
          ? missingWriteCol
          : { data: null, error: null };
      };
      await api.upsertDayLog({ companyId: 'c1', workDate: '2026-01-05', dayType: 'onsite', overnightAway: false });
      expect(state.calls).toHaveLength(3);
    });

    it('a set flag fails visibly: a counted day must not vanish silently', async () => {
      state.respond = () => missingWriteCol;
      await expect(
        api.upsertDayLog({ companyId: 'c1', workDate: '2026-01-05', dayType: 'onsite', overnightAway: true }),
      ).rejects.toMatchObject({ code: 'PGRST204' });
      // First try includes day_share; second drops share but keeps overnight; then throw.
      expect(state.calls).toHaveLength(2);
    });

    it('a set half-day fails visibly when day_share is missing', async () => {
      state.respond = () => missingWriteCol;
      await expect(
        api.upsertDayLog({ companyId: 'c1', workDate: '2026-01-05', dayType: 'telework', dayShare: 0.5 }),
      ).rejects.toMatchObject({ code: 'PGRST204' });
      expect(state.calls).toHaveLength(1);
    });

    it('personal logs behave the same way', async () => {
      state.respond = (call) => {
        if (op(call, 'upsert').length) return { data: null, error: null };
        return String(op(call, 'select')[0]?.[0]).includes('overnight')
          ? missingCol
          : { data: [{ work_date: '2026-01-05', day_type: 'onsite', border_pack_id: 'ticino_it' }], error: null };
      };
      const rows = await api.listPersonalDayLogs();
      expect(rows).toEqual([{ date: '2026-01-05', type: 'onsite', borderPackId: 'ticino_it', overnightAway: false, dayShare: 1 }]);
    });
  });

  it('writes and reads the overnight flag once the column exists', async () => {
    await api.upsertDayLog({ companyId: 'c1', workDate: '2026-01-05', dayType: 'onsite', overnightAway: true });
    expect(op(state.calls[0], 'upsert')[0][0]).toMatchObject({ overnight_away_for_work: true });
    state.calls.length = 0;
    state.respond = () => ({
      data: [{ employee_user_id: 'e1', work_date: '2026-01-05', day_type: 'onsite', overnight_away_for_work: true }],
      error: null,
    });
    expect((await api.listDayLogs('c1'))[0].overnightAway).toBe(true);
  });

  it('updateMyProfile uses the RPC and carries no role', async () => {
    await api.updateMyProfile('c1', { employmentPercent: 80, a1InPlace: true, a1ValidUntil: '2027-06-30' });
    expect(state.calls[0].rpc).toBe('bd_update_member_profile');
    expect(state.calls[0].args).toEqual({
      p_company_id: 'c1',
      p_employment_percent: 80,
      p_a1_in_place: true,
      p_a1_valid_until: '2027-06-30',
      p_frontier_before_2012: false,
    });
  });

  it('updateEmployeeProfile scopes to the employee and treats "no row updated" as a refusal', async () => {
    state.respond = () => ({ data: [{ id: 'm1' }], error: null });
    const profile = { employmentPercent: 50, a1InPlace: false, a1ValidUntil: null };
    await api.updateEmployeeProfile('c1', 'e1', profile);
    expect(op(state.calls[0], 'eq')).toEqual([
      ['company_id', 'c1'],
      ['user_id', 'e1'],
    ]);
    expect(Object.keys(op(state.calls[0], 'update')[0][0] as object).sort()).toEqual([
      'a1_in_place',
      'a1_valid_until',
      'employment_percent',
      'frontier_before_2012',
    ]);
    state.respond = () => ({ data: [], error: null });
    await expect(api.updateEmployeeProfile('c1', 'e1', profile)).rejects.toThrow(/denied/);
  });

  describe('E15 notes, E22 names, E10 resend, E24 former companies', () => {
    const upserted = (call: any) => op(call, 'upsert')[0][0];

    it('a day write leaves a note alone unless one is given, and an empty one clears it', async () => {
      await api.upsertDayLog({ companyId: 'c1', workDate: '2026-01-05', dayType: 'telework' });
      expect(upserted(state.calls.at(-1))).not.toHaveProperty('note');
      await api.upsertDayLog({ companyId: 'c1', workDate: '2026-01-05', dayType: 'telework', note: ' mine ' });
      expect(upserted(state.calls.at(-1)).note).toBe('mine');
      await api.upsertPersonalDayLog({ workDate: '2026-01-05', dayType: 'telework', borderPackId: null, note: '   ' });
      expect(upserted(state.calls.at(-1)).note).toBeNull();
    });

    it('listMyDayNotes reads only the caller’s rows that have a note', async () => {
      state.respond = () => ({ data: [{ work_date: '2026-01-05', note: 'mine' }], error: null });
      const notes = await api.listMyDayNotes('c1');
      expect(notes.get('2026-01-05')).toBe('mine');
      const call = state.calls.at(-1);
      expect(call.table).toBe('bd_day_logs');
      expect(op(call, 'eq').map((a: unknown[]) => a[0])).toEqual(['company_id', 'employee_user_id']);
    });

    it('the HR read still returns no note', async () => {
      state.respond = () => ({
        data: [{ employee_user_id: 'e1', work_date: '2026-01-05', day_type: 'telework', note: 'leak' }],
        error: null,
      });
      expect((await api.listDayLogs('c1'))[0]).not.toHaveProperty('note');
    });

    it('updateMyDisplayName trims', async () => {
      await api.updateMyDisplayName('  Ann  ');
      expect(op(state.calls.at(-1), 'update')[0][0]).toEqual({ display_name: 'Ann' });
    });

    it('listFormerCompanies keeps companies left, and tolerates the function not being deployed yet', async () => {
      state.respond = () => ({
        data: [
          { company_id: 'a', company_name: 'Now', active: true, day_count: 3, first_date: '2026-01-01', last_date: '2026-01-02' },
          { company_id: 'b', company_name: 'Left', active: false, day_count: '2', first_date: '2026-02-01', last_date: '2026-02-02' },
        ],
        error: null,
      });
      expect(await api.listFormerCompanies()).toEqual([
        { companyId: 'b', company: 'Left', dayCount: 2, firstDate: '2026-02-01', lastDate: '2026-02-02' },
      ]);
      state.respond = () => ({ data: null, error: { code: 'PGRST202' } });
      expect(await api.listFormerCompanies()).toEqual([]);
      state.respond = () => ({ data: null, error: { code: '42501' } });
      await expect(api.listFormerCompanies()).rejects.toMatchObject({ code: '42501' });
    });

    it('resendInvite calls the send function for the existing invite and writes no new row', async () => {
      state.invoke.mockResolvedValue({ data: { sent: true }, error: null });
      const before = state.calls.length;
      expect(await api.resendInvite('c1', 'i1', 'fr')).toEqual({ emailed: true, emailBlock: null });
      expect(state.invoke).toHaveBeenCalledWith('bd-send-invite', { body: { invitationId: 'i1', companyId: 'c1', lang: 'fr' } });
      expect(state.calls.length).toBe(before);
      state.invoke.mockResolvedValue({ data: null, error: { context: { status: 429 } } });
      expect(await api.resendInvite('c1', 'i1')).toEqual({ emailed: false, emailBlock: 'rate_limited' });
      state.invoke.mockResolvedValue({ data: null, error: { context: { status: 402 } } });
      expect(await api.resendInvite('c1', 'i1')).toEqual({ emailed: false, emailBlock: 'no_access' });
    });
  });

  it('updateMemberSelf uses the RPC and cannot send a role', async () => {
    await api.updateMemberSelf('c1', { borderPackId: 'geneva_fr', annualWorkingDays: 220 });
    expect(state.calls[0].rpc).toBe('bd_update_member_self');
    expect(state.calls[0].args).toEqual({
      p_company_id: 'c1',
      p_border_pack_id: 'geneva_fr',
      p_annual_working_days: 220,
    });
  });

  /** F8/F10: listMembers then listInvites then insert — empty members/pending by default. */
  function inviteRespond(insertRow: Record<string, unknown>) {
    state.respond = (call) => {
      if (call.table === 'bd_company_members') return { data: [], error: null };
      if (call.table === 'bd_invitations' && !call.ops.some(([n]) => n === 'insert')) {
        return { data: [], error: null };
      }
      return { data: insertRow, error: null };
    };
  }

  it('createInvite normalises the email and reports a dry run as not emailed', async () => {
    inviteRespond({ id: 'i1', company_id: 'c1', email: 'x@y.com', role: 'employee', token: 't', status: 'pending' });
    const { invite, emailed } = await api.createInvite('c1', '  X@Y.com ');
    const insertCall = state.calls.find((c) => c.table === 'bd_invitations' && c.ops.some(([n]) => n === 'insert'));
    expect(op(insertCall!, 'insert')[0][0]).toEqual({
      company_id: 'c1',
      email: 'x@y.com',
      role: 'employee',
      invited_by: 'me',
    });
    expect(state.invoke).toHaveBeenCalledWith('bd-send-invite', { body: { invitationId: 'i1', companyId: 'c1', lang: 'en' } });
    expect(invite.token).toBe('t');
    expect(emailed).toBe(false);
  });

  it('createInvite reports a real send as emailed, and survives a failed send', async () => {
    inviteRespond({ id: 'i1', token: 't', email: 'a@b.com', role: 'employee', status: 'pending', company_id: 'c1' });
    state.invoke.mockResolvedValueOnce({ data: { sent: true }, error: null });
    expect((await api.createInvite('c1', 'a@b.com')).emailed).toBe(true);
    inviteRespond({ id: 'i2', token: 't2', email: 'a@b.com', role: 'employee', status: 'pending', company_id: 'c1' });
    state.invoke.mockResolvedValueOnce({ data: null, error: new Error('403') });
    expect((await api.createInvite('c1', 'a@b.com')).emailed).toBe(false);
  });

  it('createInvite says why the function refused to email', async () => {
    inviteRespond({ id: 'i1', token: 't', email: 'a@b.com', role: 'employee', status: 'pending', company_id: 'c1' });
    const refused = (status: number) => Object.assign(new Error('refused'), { context: { status } });
    state.invoke.mockResolvedValueOnce({ data: null, error: refused(402) });
    expect(await api.createInvite('c1', 'a@b.com')).toMatchObject({ emailed: false, emailBlock: 'no_access' });
    inviteRespond({ id: 'i2', token: 't', email: 'a@b.com', role: 'employee', status: 'pending', company_id: 'c1' });
    state.invoke.mockResolvedValueOnce({ data: null, error: refused(429) });
    expect(await api.createInvite('c1', 'a@b.com')).toMatchObject({ emailed: false, emailBlock: 'rate_limited' });
    inviteRespond({ id: 'i3', token: 't', email: 'a@b.com', role: 'employee', status: 'pending', company_id: 'c1' });
    state.invoke.mockResolvedValueOnce({ data: { sent: true }, error: null });
    expect(await api.createInvite('c1', 'a@b.com')).toMatchObject({ emailed: true, emailBlock: null });
  });

  it('F8: createInvite refuses an active member email', async () => {
    state.respond = (call) => {
      if (call.table === 'bd_company_members') {
        return {
          data: [{
            id: 'm1', role: 'employee', active: true, removed_at: null, user_id: 'u1', joined_at: 'x',
            border_pack_id: null, annual_working_days: null,
            bd_profiles: { email: 'Owner@Acme.test', display_name: 'Owner' },
          }],
          error: null,
        };
      }
      return { data: [], error: null };
    };
    await expect(api.createInvite('c1', ' owner@acme.test ')).rejects.toMatchObject({ code: 'already_member' });
    expect(state.invoke).not.toHaveBeenCalled();
  });

  it('F10: createInvite reuses a pending invite instead of inserting again', async () => {
    state.respond = (call) => {
      if (call.table === 'bd_company_members') return { data: [], error: null };
      if (call.table === 'bd_invitations') {
        return {
          data: [{
            id: 'i-old', company_id: 'c1', email: 'new@acme.test', role: 'employee', token: 'same-tok',
            status: 'pending', invited_by: 'me', created_at: 'x', expires_at: 'y',
          }],
          error: null,
        };
      }
      return { data: null, error: null };
    };
    state.invoke.mockResolvedValueOnce({ data: { sent: true }, error: null });
    const result = await api.createInvite('c1', 'new@acme.test', 'employee', 'fr');
    expect(result).toMatchObject({ reused: true, emailed: true, invite: { id: 'i-old', token: 'same-tok' } });
    expect(state.calls.some((c) => c.ops.some(([n]) => n === 'insert'))).toBe(false);
    expect(state.invoke).toHaveBeenCalledWith('bd-send-invite', {
      body: { invitationId: 'i-old', companyId: 'c1', lang: 'fr' },
    });
  });

  it('F26/A2-01: deleteMyDayLog soft-voids that work_date via RPC', async () => {
    state.respond = () => ({ data: null, error: null });
    await api.deleteMyDayLog('c1', '2026-03-15');
    const call = state.calls.find((c) => c.rpc === 'bd_void_my_day_log');
    expect(call?.args).toEqual({ p_company_id: 'c1', p_work_date: '2026-03-15' });
  });

  it('A2-01: deleteMyDayLogs refuses bulk wipe for an active member', async () => {
    state.respond = () => ({ data: { active: true }, error: null });
    await expect(api.deleteMyDayLogs('c1')).rejects.toThrow('bulk_clear_not_allowed');
  });

  it('F32/RC-01: deactivateMember sets active false only; trigger owns removed_at', async () => {
    state.respond = () => ({ data: [{ id: 'm1' }], error: null });
    state.invoke.mockResolvedValueOnce({ data: { available: true }, error: null });
    const result = await api.deactivateMember('c1', 'emp1');
    expect(result.billingSynced).toBe(true);
    const call = state.calls.find((c) => c.table === 'bd_company_members' && c.ops.some(([n]) => n === 'update'));
    const [payload] = op(call!, 'update')[0] as [Record<string, unknown>];
    expect(payload.active).toBe(false);
    expect(payload).not.toHaveProperty('removed_at');
  });

  it('listInvites maps bd_invitations rows', async () => {
    state.respond = () => ({
      data: [
        { id: 'i1', company_id: 'c1', email: 'a@b.com', role: 'hr_viewer', token: 't', status: 'pending', invited_by: 'me', created_at: 'x', expires_at: 'y' },
      ],
      error: null,
    });
    const invites = await api.listInvites('c1', 'pending');
    expect(op(state.calls[0], 'eq')).toContainEqual(['status', 'pending']);
    expect(invites[0]).toMatchObject({ companyId: 'c1', invitedBy: 'me', expiresAt: 'y' });
  });

  it('acceptInvite surfaces the RPC error and does not sync billing', async () => {
    state.respond = () => ({ data: null, error: new Error('invite email mismatch') });
    await expect(api.acceptInvite('t', 'v1', 'en')).rejects.toThrow(/mismatch/);
    expect(state.invoke).not.toHaveBeenCalled();
  });

  it('isInviteOpen requires pending and unexpired; sameEmail ignores case and spaces', () => {
    const now = Date.parse('2026-10-31T00:00:00Z');
    expect(api.isInviteOpen({ status: 'pending', expiresAt: '2026-11-01T00:00:00Z' }, now)).toBe(true);
    expect(api.isInviteOpen({ status: 'pending', expiresAt: '2026-10-01T00:00:00Z' }, now)).toBe(false);
    expect(api.isInviteOpen({ status: 'accepted', expiresAt: '2026-11-01T00:00:00Z' }, now)).toBe(false);
    expect(api.sameEmail(' A@b.com', 'a@B.com ')).toBe(true);
    expect(api.sameEmail('a@b.com', 'c@b.com')).toBe(false);
    expect(api.sameEmail(undefined, undefined)).toBe(false);
  });
});

describe('pickAppAccess (individual gate, C8)', () => {
  it('no plan and no company is preview', () => {
    expect(api.pickAppAccess([], false)).toEqual({ mode: 'preview', unpaidCompany: null });
  });

  it('an active individual subscription unlocks', () => {
    expect(api.pickAppAccess([], true)).toEqual({ mode: 'individual' });
  });

  it('membership of a paid or trialing company unlocks', () => {
    expect(api.pickAppAccess([company()], false).mode).toBe('company');
    expect(api.pickAppAccess([company({ subscription_status: 'trialing' })], false).mode).toBe('company');
  });

  it('a free self-created company does not unlock the product', () => {
    expect(api.pickAppAccess([company({ role: 'owner', subscription_status: 'none' })], false)).toEqual({
      mode: 'preview',
      unpaidCompany: 'Acme',
    });
  });

  it('past_due and canceled do not unlock', () => {
    expect(api.pickAppAccess([company({ subscription_status: 'past_due' })], false).mode).toBe('preview');
    expect(api.pickAppAccess([company({ subscription_status: 'canceled' })], false).mode).toBe('preview');
  });

  it('an individual plan still works when the company is unpaid', () => {
    expect(api.pickAppAccess([company({ subscription_status: 'none' })], true).mode).toBe('individual');
  });

  it('prefers an employee membership over an HR one', () => {
    const access = api.pickAppAccess([company({ id: 'hr', role: 'owner' }), company({ id: 'emp' })], false);
    expect(access).toMatchObject({ mode: 'company', company: { id: 'emp' } });
  });
});
