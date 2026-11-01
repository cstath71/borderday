import type { BorderId, DayEntry, DayType } from '../borders/types';
import { getOwnAccountRecords, listDayLogs, listMyCompanies, listPersonalDayLogs, type OwnAccountRecords } from './companyApi';
import { csvCell } from './csvCell';

export interface AccountExport {
  version: 1;
  exportedAt: string;
  account: { email: string | null; displayName: string | null };
  noticeRecords: Array<OwnAccountRecords['noticeRecords'][number] & { company: string | null }>;
  subscriptions: OwnAccountRecords['subscriptions'];
  individualPlan: { days: Array<DayEntry & { borderPackId: BorderId | null }> };
  companies: Array<{
    company: string;
    role: string;
    borderPackId: BorderId | null;
    annualWorkingDays: number | null;
    employmentPercent: number | null;
    contractDaysPerYear: number | null;
    a1InPlace: boolean;
    a1ValidUntil: string | null;
    days: Array<{ date: string; type: DayType; overnightAway: boolean; dayShare?: 0.5 | 1 }>;
  }>;
}

/** Everything the server holds about the caller's own days. Other members' days are never included. */
export async function collectAccountExport(user: { id: string; email?: string | null }): Promise<AccountExport> {
  const [personal, companies, own] = await Promise.all([listPersonalDayLogs(), listMyCompanies(), getOwnAccountRecords(user.id)]);
  const perCompany = await Promise.all(
    companies.map(async (c) => {
      const logs = await listDayLogs(c.id, user.id);
      return {
        company: c.name,
        role: c.role,
        borderPackId: c.borderPackId,
        annualWorkingDays: c.annualWorkingDays,
        employmentPercent: c.profile?.employmentPercent ?? null,
        contractDaysPerYear: c.profile?.contractDaysPerYear ?? null,
        a1InPlace: !!c.profile?.a1InPlace,
        a1ValidUntil: c.profile?.a1ValidUntil ?? null,
        days: logs.map((l) => ({ date: l.workDate, type: l.dayType, overnightAway: l.overnightAway, dayShare: l.dayShare })),
      };
    }),
  );
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    account: { email: user.email ?? null, displayName: own.displayName },
    noticeRecords: own.noticeRecords.map((n) => ({
      ...n,
      company: companies.find((c) => c.id === n.companyId)?.name ?? null,
    })),
    subscriptions: own.subscriptions,
    individualPlan: { days: personal },
    companies: perCompany,
  };
}

export function accountExportCsv(data: AccountExport): string {
  const lines = ['source,date,type,overnight_away_for_work,day_share'];
  for (const d of data.individualPlan.days) {
    lines.push(`${csvCell('individual plan')},${d.date},${d.type},${d.overnightAway ? 'yes' : 'no'},${d.dayShare === 0.5 ? '0.5' : '1'}`);
  }
  for (const c of data.companies) {
    for (const d of c.days) {
      lines.push(`${csvCell(c.company)},${d.date},${d.type},${d.overnightAway ? 'yes' : 'no'},${d.dayShare === 0.5 ? '0.5' : '1'}`);
    }
  }
  return `${lines.join('\n')}\n`;
}
