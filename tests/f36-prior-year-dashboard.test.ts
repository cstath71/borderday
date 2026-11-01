import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dayRowsToCsv, rowsToCsv, summarizeEmployee } from '../src/company/dashboardMath';
import { getDict } from '../src/i18n';

describe('F36 / A3-K1 prior-year dashboard + CSV', () => {
  it('CSV embeds the selected year (prior year export)', () => {
    const row = summarizeEmployee({
      userId: 'u1',
      displayName: 'Ada',
      email: 'ada@example.com',
      borderPackId: 'basel_de',
      annualWorkingDays: 240,
      logs: [],
      year: 2025,
    });
    const csv = rowsToCsv([row], 2025);
    const header = csv.split('\n')[1];
    expect(header).toContain('year');
    expect(csv.split('\n')[2]).toContain(',2025');
  });

  it('day CSV filters to the selected year only', () => {
    const row = summarizeEmployee({
      userId: 'u1',
      displayName: 'Ada',
      email: 'ada@example.com',
      borderPackId: 'basel_de',
      annualWorkingDays: 240,
      logs: [],
      year: 2025,
    });
    const csv = dayRowsToCsv(
      [row],
      [
        { employeeUserId: 'u1', workDate: '2025-06-01', dayType: 'telework' },
        { employeeUserId: 'u1', workDate: '2026-06-01', dayType: 'office' },
      ],
      2025,
    );
    expect(csv).toContain('2025-06-01');
    expect(csv).not.toContain('2026-06-01');
  });

  it('HR dashboard exposes a year selector wired to state', () => {
    const dash = readFileSync('src/pages/company/Dashboard.tsx', 'utf8');
    const view = readFileSync('src/components/company/DashboardView.tsx', 'utf8');
    expect(dash).toMatch(/\[year, setYear\]/);
    expect(dash).toContain('onYearChange={setYear}');
    expect(view).toContain('onYearChange');
    expect(view).toContain('d.company.dashboardYear');
  });

  it('all locales label the year control', () => {
    for (const lang of ['en', 'fr', 'de', 'it', 'nl'] as const) {
      expect(getDict(lang).company.dashboardYear.length).toBeGreaterThan(0);
    }
  });
});
