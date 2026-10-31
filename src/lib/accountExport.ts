import type { BorderId, DayEntry, DayType } from '../borders/types';
import { listDayLogs, listMyCompanies, listPersonalDayLogs } from './companyApi';

export interface AccountExport {
  version: 1;
  exportedAt: string;
  account: { email: string | null };
  individualPlan: { days: Array<DayEntry & { borderPackId: BorderId | null }> };
  companies: Array<{
    company: string;
    role: string;
    borderPackId: BorderId | null;
    annualWorkingDays: number | null;
    employmentPercent: number | null;
    a1InPlace: boolean;
    a1ValidUntil: string | null;
    days: Array<{ date: string; type: DayType; overnightAway: boolean }>;
  }>;
}

/** Everything the server holds about the caller's own days. Other members' days are never included. */
export async function collectAccountExport(user: { id: string; email?: string | null }): Promise<AccountExport> {
  const [personal, companies] = await Promise.all([listPersonalDayLogs(), listMyCompanies()]);
  const perCompany = await Promise.all(
    companies.map(async (c) => {
      const logs = await listDayLogs(c.id, user.id);
      return {
        company: c.name,
        role: c.role,
        borderPackId: c.borderPackId,
        annualWorkingDays: c.annualWorkingDays,
        employmentPercent: c.profile?.employmentPercent ?? null,
        a1InPlace: !!c.profile?.a1InPlace,
        a1ValidUntil: c.profile?.a1ValidUntil ?? null,
        days: logs.map((l) => ({ date: l.workDate, type: l.dayType, overnightAway: l.overnightAway })),
      };
    }),
  );
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    account: { email: user.email ?? null },
    individualPlan: { days: personal },
    companies: perCompany,
  };
}

/** Quoted, and a leading formula character is defused: company names are free text and CSVs open in spreadsheets. */
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function accountExportCsv(data: AccountExport): string {
  const lines = ['source,date,type,overnight_away_for_work'];
  for (const d of data.individualPlan.days) {
    lines.push(`${csvCell('individual plan')},${d.date},${d.type},${d.overnightAway ? 'yes' : 'no'}`);
  }
  for (const c of data.companies) {
    for (const d of c.days) {
      lines.push(`${csvCell(c.company)},${d.date},${d.type},${d.overnightAway ? 'yes' : 'no'}`);
    }
  }
  return `${lines.join('\n')}\n`;
}
