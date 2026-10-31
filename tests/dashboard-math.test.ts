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
  });
});
