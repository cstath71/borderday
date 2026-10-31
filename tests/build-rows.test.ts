import { describe, expect, it } from 'vitest';
import { buildDashboardRows, type RowMember } from '../src/company/buildRows';
import { localOnlyDays } from '../src/lib/dayStore';
import { rememberNext, safeNext, takeRememberedNext } from '../src/lib/authNext';

const member = (over: Partial<RowMember>): RowMember => ({
  userId: 'u',
  role: 'employee',
  displayName: 'U',
  email: 'u@example.com',
  borderPackId: 'geneva_fr',
  annualWorkingDays: 240,
  ...over,
});

describe('buildDashboardRows', () => {
  it('lists active employees only, each with their own logs', () => {
    const rows = buildDashboardRows({
      year: 2026,
      members: [
        member({ userId: 'a' }),
        member({ userId: 'b' }),
        member({ userId: 'owner', role: 'owner' }),
        member({ userId: 'hr', role: 'hr_viewer' }),
        member({ userId: 'gone', active: false }),
      ],
      logs: [
        { employeeUserId: 'a', workDate: '2026-01-05', dayType: 'telework' },
        { employeeUserId: 'a', workDate: '2026-01-06', dayType: 'telework' },
        { employeeUserId: 'b', workDate: '2026-01-05', dayType: 'onsite' },
      ],
    });
    expect(rows.map((r) => r.userId)).toEqual(['a', 'b']);
    const telework = (id: string) =>
      rows.find((r) => r.userId === id)!.counters.find((c) => c.counterId === 'geneva_tax_telework_40')!.used;
    expect(telework('a')).toBeGreaterThan(telework('b'));
  });

  it('marks rows as demo only when asked', () => {
    const logs: never[] = [];
    expect(buildDashboardRows({ members: [member({})], logs, year: 2026 })[0].isDemo).toBe(false);
    expect(buildDashboardRows({ members: [member({})], logs, year: 2026, isDemo: true })[0].isDemo).toBe(true);
  });
});

describe('localOnlyDays', () => {
  it('keeps only dates the account does not have', () => {
    const local = [
      { date: '2026-01-05', type: 'telework' as const },
      { date: '2026-01-06', type: 'telework' as const },
    ];
    expect(localOnlyDays(local, [{ date: '2026-01-05', type: 'onsite' }])).toEqual([local[1]]);
  });
});

describe('safeNext', () => {
  it('keeps same-origin paths', () => {
    expect(safeNext('/en/join/abc', '/x')).toBe('/en/join/abc');
  });
  it('rejects anything that could leave the site', () => {
    for (const bad of ['//evil.com', '/\\evil.com', 'https://evil.com', 'javascript:alert(1)', '', null, undefined]) {
      expect(safeNext(bad, '/x')).toBe('/x');
    }
  });
  it('without localStorage, remembered next is a harmless no-op', () => {
    rememberNext('/en/join/abc');
    expect(takeRememberedNext()).toBeNull();
  });
});
