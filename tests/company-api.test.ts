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
    expect(logs[0]).toEqual({ employeeUserId: 'e1', workDate: 'd0', dayType: 'telework', overnightAway: false });
    expect(JSON.stringify(logs)).not.toContain('secret');
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
      expect(logs).toEqual([{ employeeUserId: 'e1', workDate: '2026-01-05', dayType: 'telework', overnightAway: false }]);
    });

    it('listDayLogs still throws on a real error', async () => {
      state.respond = () => ({ data: null, error: { code: '42501', message: 'denied' } });
      await expect(api.listDayLogs('c1')).rejects.toMatchObject({ code: '42501' });
      expect(state.calls).toHaveLength(1);
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
      expect(mine.profile).toEqual({ employmentPercent: null, a1InPlace: false, a1ValidUntil: null });
    });

    it('logging a plain day still works: the unset flag is dropped', async () => {
      state.respond = (call) => {
        const row = op(call, 'upsert')[0]?.[0] as Record<string, unknown>;
        return 'overnight_away_for_work' in row ? missingWriteCol : { data: null, error: null };
      };
      await api.upsertDayLog({ companyId: 'c1', workDate: '2026-01-05', dayType: 'onsite', overnightAway: false });
      expect(state.calls).toHaveLength(2);
    });

    it('a set flag fails visibly: a counted day must not vanish silently', async () => {
      state.respond = () => missingWriteCol;
      await expect(
        api.upsertDayLog({ companyId: 'c1', workDate: '2026-01-05', dayType: 'onsite', overnightAway: true }),
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
      expect(rows).toEqual([{ date: '2026-01-05', type: 'onsite', borderPackId: 'ticino_it', overnightAway: false }]);
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
    ]);
    state.respond = () => ({ data: [], error: null });
    await expect(api.updateEmployeeProfile('c1', 'e1', profile)).rejects.toThrow(/denied/);
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

  it('createInvite normalises the email and reports a dry run as not emailed', async () => {
    state.respond = () => ({
      data: { id: 'i1', company_id: 'c1', email: 'x@y.com', role: 'employee', token: 't', status: 'pending' },
      error: null,
    });
    const { invite, emailed } = await api.createInvite('c1', '  X@Y.com ');
    expect(op(state.calls[0], 'insert')[0][0]).toEqual({
      company_id: 'c1',
      email: 'x@y.com',
      role: 'employee',
      invited_by: 'me',
    });
    expect(state.invoke).toHaveBeenCalledWith('bd-send-invite', { body: { invitationId: 'i1', companyId: 'c1' } });
    expect(invite.token).toBe('t');
    expect(emailed).toBe(false);
  });

  it('createInvite reports a real send as emailed, and survives a failed send', async () => {
    state.respond = () => ({ data: { id: 'i1', token: 't' }, error: null });
    state.invoke.mockResolvedValueOnce({ data: { sent: true }, error: null });
    expect((await api.createInvite('c1', 'a@b.com')).emailed).toBe(true);
    state.invoke.mockResolvedValueOnce({ data: null, error: new Error('403') });
    expect((await api.createInvite('c1', 'a@b.com')).emailed).toBe(false);
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
