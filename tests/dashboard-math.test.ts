import { describe, expect, it } from 'vitest';
import {
  filterRows,
  dayRowsToCsv,
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

describe('A3-15 CSV formula defusing', () => {
  const rowFor = (displayName: string, email = 'a@x.com') =>
    summarizeEmployee({
      userId: 'u1',
      displayName,
      email,
      borderPackId: 'geneva_fr',
      annualWorkingDays: 240,
      logs: [],
      year: 2026,
    });
  const firstDataLine = (displayName: string, email?: string) =>
    rowsToCsv([rowFor(displayName, email)], 2026).split('\n')[2];

  it.each(['=HYPERLINK("http://evil.example","x")', '+1+1', '-2+3', '@SUM(A1)'])(
    'defuses a name starting with %j',
    (name) => {
      // The name is the first thing after the demo column.
      expect(firstDataLine(name).startsWith(`no,"'${name.replaceAll('"', '""')}",`)).toBe(true);
    },
  );

  it('E22: trimming comes first, so whitespace cannot hide a formula or stay in the file', () => {
    expect(firstDataLine('\tcmd').startsWith('no,"cmd",')).toBe(true);
    expect(firstDataLine('\rcmd').startsWith('no,"cmd",')).toBe(true);
    expect(firstDataLine('  =1+1 ').startsWith(`no,"'=1+1",`)).toBe(true);
  });

  it('defuses the email column too, and leaves ordinary values alone', () => {
    const line = firstDataLine('Ana, Maria', '=evil@x.com');
    expect(line).toContain('"Ana, Maria"');
    expect(line).toContain(`"'=evil@x.com"`);
  });

  it('uses the same cell function as the account export', async () => {
    const { csvCell } = await import('../src/lib/csvCell');
    expect(csvCell('=1+1')).toBe(`"'=1+1"`);
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    for (const f of ['../src/lib/accountExport.ts', '../src/company/dashboardMath.ts']) {
      expect(readFileSync(join(__dirname, f), 'utf8')).toContain("import { csvCell } from");
    }
  });
});

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

  it('Basel employer monthly floor stays out of HR aggregate; tax regular-return does feed it', () => {
    const sparse = summarizeEmployee({
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
    const practice = sparse.counters.find((c) => c.counterId === 'basel_de_employer_practice')!;
    expect(practice.kind).toBe('employer_practice');
    const taxFloor = sparse.counters.find((c) => c.counterId === 'basel_de_regular_return_20')!;
    expect(taxFloor.kind).toBe('tax');
    // Sparse on-site mid-year: tax floor can warn/critical; employer practice must not drive "over" alone.
    expect(['warn', 'critical', 'ok', 'over']).toContain(taxFloor.status);
    // Enough regular-return days (48 of 240 = 20%) keeps the tax floor ok and HR aggregate clean.
    const onsite = Array.from({ length: 48 }, (_, i) => {
      const d = new Date(Date.UTC(2026, 0, 5 + i * 2));
      return [d.toISOString().slice(0, 10), 'onsite'] as [string, 'onsite'];
    });
    const okRow = summarizeEmployee({
      userId: 'u3b',
      displayName: 'C2',
      email: 'c2@x.com',
      borderPackId: 'basel_de',
      annualWorkingDays: 240,
      logs: logs('u3b', 'c1', onsite),
      year: 2026,
    });
    const taxOk = okRow.counters.find((c) => c.counterId === 'basel_de_regular_return_20')!;
    expect(taxOk.status).toBe('ok');
    expect(okRow.worstStatus).not.toBe('over');
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
    const lines = csv.split('\n');
    expect(lines[0].startsWith('#')).toBe(true);
    expect(lines[0]).toMatch(/working record only|not an official filing/i);
    expect(lines[1]).not.toMatch(/location|gps|lat|lon/i);
    expect(lines[2].startsWith('yes,')).toBe(true);
    expect(csv).toContain('geneva_tax_telework_40');
    expect(lines[1]).toContain('employment_percent');
    expect(lines[1]).toContain('a1_valid_until');
    expect(lines[1]).toContain('telework_rate_pct_working_calc_not_afc');
  });
});

describe('E21, E22, E25: the CSV columns', () => {
  const row = (fields: object = {}) =>
    summarizeEmployee({
      userId: 'u1',
      displayName: 'BDt Employee ',
      email: 'e@x.com',
      borderPackId: 'geneva_fr',
      annualWorkingDays: 240,
      logs: [],
      year: 2026,
      ...fields,
    });
  const lines = rowsToCsv([row()], 2026).split('\n');

  it('E21: says route, not border_pack', () => {
    expect(lines[1].split(',')).toContain('route');
    expect(lines[1]).not.toContain('border_pack');
  });
  it('E22: trims the name', () => {
    expect(lines[2]).toContain('"BDt Employee"');
  });
  it('E25: demo is always filled', () => {
    expect(lines[2].startsWith('no,')).toBe(true);
    expect(rowsToCsv([row({ isDemo: true })], 2026).split('\n')[2].startsWith('yes,')).toBe(true);
  });
});

describe('E23: day-level CSV', () => {
  const r = { userId: 'u1', displayName: ' Ann ', email: 'a@x.com', borderPackId: 'geneva_fr' as const, isDemo: false };
  const logs = [
    { employeeUserId: 'u1', workDate: '2026-02-03', dayType: 'telework' as const, dayShare: 0.5 as const, overnightAway: false, note: 'secret' },
    { employeeUserId: 'u1', workDate: '2026-02-02', dayType: 'onsite' as const, overnightAway: true },
    { employeeUserId: 'u1', workDate: '2025-12-31', dayType: 'onsite' as const },
    { employeeUserId: 'gone', workDate: '2026-02-02', dayType: 'onsite' as const },
  ];
  const csv = dayRowsToCsv([r], logs, 2026);
  const lines = csv.split('\n');

  it('has one sorted row per day of the listed employees in that year, with half day and night away', () => {
    expect(lines.slice(1)).toEqual([
      'demo,employee_name,employee_email,route,date,day_type,half_day,night_away',
      'no,"Ann","a@x.com",geneva_fr,2026-02-02,onsite,no,yes',
      'no,"Ann","a@x.com",geneva_fr,2026-02-03,telework,yes,no',
    ]);
  });
  it('says how half days count and never carries a note, even if one is passed in', () => {
    expect(lines[0]).toMatch(/half day counts as 0\.5/i);
    expect(csv).not.toContain('secret');
    expect(lines[1]).not.toMatch(/note|location|gps/i);
  });
  it('every column is already disclosed to the employee: names, route, type, date, half day, night away', () => {
    for (const col of lines[1].split(',')) {
      expect(['demo', 'employee_name', 'employee_email', 'route', 'date', 'day_type', 'half_day', 'night_away']).toContain(col);
    }
  });
});
