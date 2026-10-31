import { beforeEach, describe, expect, it } from 'vitest';
import {
  RlsError,
  acceptInvitation,
  createCompany,
  createInvitation,
  currentSession,
  getBackendMode,
  getCompany,
  listCompanyEmployees,
  listDayLogsForEmployee,
  resetMockDb,
  seedDemoCompany,
  signIn,
  signOut,
  upsertDayLog,
  __test_rawDb,
} from '../src/lib/supabaseMock';

describe('backend mode', () => {
  it('reports local-mock (no cloud project)', () => {
    expect(getBackendMode()).toBe('local-mock');
  });
});

describe('multi-tenant RLS (mock)', () => {
  beforeEach(() => {
    resetMockDb();
  });

  it('isolates companies: member of A cannot read company B', () => {
    signIn('owner-a@example.com', 'Owner A');
    const a = createCompany('Company A');
    signOut();
    signIn('owner-b@example.com', 'Owner B');
    const b = createCompany('Company B');

    expect(() => getCompany(a.company.id)).toThrow(RlsError);

    // B owner can read B
    expect(getCompany(b.company.id)?.name).toBe('Company B');
  });

  it('blocks employee from listing company employees', () => {
    signIn('hr@example.com', 'HR');
    const { company } = createCompany('HR Co');
    const inv = createInvitation(company.id, 'emp@example.com', 'employee');
    signOut();
    signIn('emp@example.com', 'Emp');
    acceptInvitation(inv.token, { borderPackId: 'geneva_fr', annualWorkingDays: 240 });
    expect(() => listCompanyEmployees(company.id)).toThrow(RlsError);
  });

  it('lets HR read employee day types but employee cannot read other employee days', () => {
    signIn('hr@example.com', 'HR');
    const { company } = createCompany('HR Co');
    const inv1 = createInvitation(company.id, 'e1@example.com');
    const inv2 = createInvitation(company.id, 'e2@example.com');
    signOut();

    signIn('e1@example.com');
    acceptInvitation(inv1.token, { borderPackId: 'geneva_fr' });
    upsertDayLog(company.id, '2026-01-05', 'telework');
    const e1Id = currentSession()!.userId;
    signOut();

    signIn('e2@example.com');
    acceptInvitation(inv2.token, { borderPackId: 'geneva_fr' });
    expect(() => listDayLogsForEmployee(company.id, e1Id)).toThrow(RlsError);
    signOut();

    signIn('hr@example.com');
    const logs = listDayLogsForEmployee(company.id, e1Id);
    expect(logs).toHaveLength(1);
    expect(logs[0].dayType).toBe('telework');
    expect(logs[0]).not.toHaveProperty('latitude');
    expect(logs[0]).not.toHaveProperty('location');
  });

  it('rejects invite accept when signed-in email mismatches', () => {
    signIn('hr@example.com');
    const { company } = createCompany('Co');
    const inv = createInvitation(company.id, 'intended@example.com');
    signOut();
    signIn('wrong@example.com');
    expect(() => acceptInvitation(inv.token)).toThrow(/email mismatch/);
  });

  it('demo seed is labeled isDemo', () => {
    const { companyId } = seedDemoCompany();
    const raw = __test_rawDb();
    const c = raw.companies.find((x) => x.id === companyId)!;
    expect(c.isDemo).toBe(true);
    expect(c.name).toMatch(/^DEMO/);
  });
});
