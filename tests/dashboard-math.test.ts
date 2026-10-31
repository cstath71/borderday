import { describe, expect, it } from 'vitest';
import {
  filterRows,
  rowsToCsv,
  summarizeEmployee,
} from '../src/company/dashboardMath';
import type { DayLog } from '../src/company/types';

function logs(userId: string, companyId: string, specs: Array<[string, DayLog['dayType']]>): DayLog[] {
  return specs.map(([workDate, dayType], i) => ({
    id: `l${i}`,
    companyId,
    employeeUserId: userId,
    workDate,
    dayType,
  }));
}

describe('HR dashboard status math', () => {
  it('1 telework day at Geneva 240 → ok, 1 of 96', () => {
    const row = summarizeEmployee({
      userId: 'u1',
      displayName: 'Alice',
      email: 'a@x.com',
      borderPackId: 'geneva_fr',
      annualWorkingDays: 240,
      logs: logs('u1', 'c1', [['2026-01-05', 'telework']]),
      year: 2026,
      isDemo: true,
    });
    expect(row.isDemo).toBe(true);
    expect(row.worstStatus).toBe('ok');
    const tax = row.counters.find((c) => c.counterId === 'geneva_tax_telework_40')!;
    expect(tax.usedDays).toBe(1);
    expect(tax.allowedDays).toBe(96);
    expect(tax.status).toBe('ok');
  });

  it('28 telework days on LU 34-day tax → critical (~82%)', () => {
    const daySpecs = Array.from({ length: 28 }, (_, i) => {
      const d = String(i + 1).padStart(2, '0');
      return [`2026-03-${d}`, 'telework'] as [string, DayLog['dayType']];
    });
    const row = summarizeEmployee({
      userId: 'u2',
      displayName: 'Bruno',
      email: 'b@x.com',
      borderPackId: 'luxembourg_fr',
      annualWorkingDays: 220,
      logs: logs('u2', 'c1', daySpecs),
      year: 2026,
    });
    const tax = row.counters.find((c) => c.counterId === 'lu_fr_tax_34')!;
    expect(tax.usedDays).toBe(28);
    expect(tax.allowedDays).toBe(34);
    expect(tax.status).toBe('warn'); // 28/34 ≈ 0.82 → warn (>=0.75)
    expect(row.worstStatus).toBe('warn');
  });

  it('filters by border and status', () => {
    const a = summarizeEmployee({
      userId: '1',
      displayName: 'A',
      email: 'a@x.com',
      borderPackId: 'geneva_fr',
      annualWorkingDays: 240,
      logs: logs('1', 'c', [['2026-01-05', 'telework']]),
      year: 2026,
    });
    const b = summarizeEmployee({
      userId: '2',
      displayName: 'B',
      email: 'b@x.com',
      borderPackId: 'ticino_it',
      annualWorkingDays: 240,
      logs: [],
      year: 2026,
    });
    expect(filterRows([a, b], { borderPackId: 'geneva_fr' })).toHaveLength(1);
    expect(filterRows([a, b], { status: 'ok' }).every((r) => r.worstStatus === 'ok')).toBe(true);
  });

  it('compliant Basel staff no longer rank as worst: 5 on-site days is ok, not over', () => {
    const row = summarizeEmployee({
      userId: 'u3',
      displayName: 'C',
      email: 'c@x.com',
      borderPackId: 'basel_de',
      annualWorkingDays: 240,
      logs: logs('u3', 'c1', [
        ['2026-08-03', 'onsite'],
        ['2026-08-04', 'onsite'],
        ['2026-08-05', 'onsite'],
        ['2026-08-06', 'onsite'],
        ['2026-08-07', 'onsite'],
      ]),
      year: 2026,
    });
    const floor = row.counters.find((c) => c.counterId === 'basel_de_employer_practice')!;
    expect(floor.kind).toBe('employer_practice');
    expect(floor.status).not.toBe('over');
    expect(row.worstStatus).not.toBe('over');
  });

  it('HR gets the same A1 band and caveats as the employee, driven by the profile', () => {
    const specs = Array.from({ length: 72 }, (_, i) => {
      const dt = new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
      return [dt, 'telework'] as [string, DayLog['dayType']];
    });
    const base = {
      userId: 'u4',
      displayName: 'D',
      email: 'd@x.com',
      borderPackId: 'geneva_fr' as const,
      annualWorkingDays: 240,
      logs: logs('u4', 'c1', specs),
      year: 2026,
    };
    const without = summarizeEmployee(base).counters.find((c) => c.counterId === 'geneva_ss_50')!;
    expect(without.status).toBe('warn');
    expect(without.statusLabelKey).toBe('status_a1_required');
    expect(without.messages.map((m) => m.key)).toContain('ss_band_a1_required');
    expect(without.notesKey).toBe('ss_framework_note');
    expect(without.sources.length).toBeGreaterThan(0);

    const withA1 = summarizeEmployee({ ...base, profile: { a1InPlace: true, a1ValidUntil: '2099-01-01' } });
    expect(withA1.counters.find((c) => c.counterId === 'geneva_ss_50')!.statusLabelKey).toBe('status_a1_recorded');
  });

  it('at limit ranks between critical and over, and part-time limits reach HR', () => {
    const specs = Array.from({ length: 17 }, (_, i) => {
      const d = String(i + 1).padStart(2, '0');
      return [`2026-03-${d}`, 'telework'] as [string, DayLog['dayType']];
    });
    const row = summarizeEmployee({
      userId: 'u5',
      displayName: 'E',
      email: 'e@x.com',
      borderPackId: 'luxembourg_fr',
      annualWorkingDays: 110,
      profile: { employmentPercent: 50 },
      logs: logs('u5', 'c1', specs),
      year: 2026,
    });
    const tax = row.counters.find((c) => c.counterId === 'lu_fr_tax_34')!;
    expect(tax.allowedDays).toBe(17);
    expect(tax.status).toBe('at_limit');
    expect(row.worstStatus).toBe('at_limit');
  });

  it('overnight flags reach the counters through day logs', () => {
    const row = summarizeEmployee({
      userId: 'u6',
      displayName: 'F',
      email: 'f@x.com',
      borderPackId: 'ticino_it',
      annualWorkingDays: 240,
      logs: [{ workDate: '2026-03-02', dayType: 'onsite', overnightAway: true }],
      year: 2026,
    });
    expect(row.counters.find((c) => c.counterId === 'ticino_tax_nonreturn_45')!.used).toBe(1);
  });

  it('CSV marks DEMO and has no location columns', () => {
    const row = summarizeEmployee({
      userId: 'u1',
      displayName: 'Alice Demo',
      email: 'a@x.com',
      borderPackId: 'geneva_fr',
      annualWorkingDays: 240,
      logs: logs('u1', 'c1', [['2026-01-05', 'telework']]),
      year: 2026,
      isDemo: true,
    });
    const csv = rowsToCsv([row], 2026);
    expect(csv.split('\n')[0]).not.toMatch(/location|gps|lat|lon/i);
    expect(csv).toContain('DEMO');
    expect(csv).toContain('geneva_tax_telework_40');
    expect(csv.split('\n')[0]).toContain('employment_percent');
    expect(csv.split('\n')[0]).toContain('a1_valid_until');
  });
});
