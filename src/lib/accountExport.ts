import type { BorderId, DayEntry } from '../borders/types';
import {
  getOwnAccountRecords,
  listFormerCompanies,
  listMyCompanies,
  listMyDaysIn,
  listPersonalDayLogs,
  type OwnAccountRecords,
  type OwnDay,
} from './companyApi';
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
    days: OwnDay[];
  }>;
  /** Companies the person has left: they keep sight of the days they logged there (E24). */
  formerCompanies: Array<{ company: string; days: OwnDay[] }>;
}

/** Everything the server holds about the caller's own days. Other members' days are never included. */
export async function collectAccountExport(user: { id: string; email?: string | null }): Promise<AccountExport> {
  const [personal, companies, own, former] = await Promise.all([
    listPersonalDayLogs(),
    listMyCompanies(),
    getOwnAccountRecords(user.id),
    listFormerCompanies(),
  ]);
  const perCompany = await Promise.all(
    companies.map(async (c) => {
      const days = await listMyDaysIn(c.id);
      return {
        company: c.name,
        role: c.role,
        borderPackId: c.borderPackId,
        annualWorkingDays: c.annualWorkingDays,
        employmentPercent: c.profile?.employmentPercent ?? null,
        contractDaysPerYear: c.profile?.contractDaysPerYear ?? null,
        a1InPlace: !!c.profile?.a1InPlace,
        a1ValidUntil: c.profile?.a1ValidUntil ?? null,
        days,
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
    formerCompanies: await Promise.all(former.map(async (c) => ({ company: c.company, days: await listMyDaysIn(c.companyId) }))),
  };
}

type CsvDay = Pick<OwnDay, 'date' | 'type' | 'overnightAway' | 'dayShare' | 'note'>;

export function accountExportCsv(data: AccountExport): string {
  const line = (source: string, d: CsvDay) =>
    `${csvCell(source)},${d.date},${d.type},${d.overnightAway ? 'yes' : 'no'},${d.dayShare === 0.5 ? '0.5' : '1'},${csvCell(d.note ?? '')}`;
  const lines = ['source,date,type,overnight_away_for_work,day_share,note'];
  for (const d of data.individualPlan.days) lines.push(line('individual plan', d as CsvDay));
  for (const c of [...data.companies, ...(data.formerCompanies ?? [])]) {
    for (const d of c.days) lines.push(line(c.company, d));
  }
  return `${lines.join('\n')}\n`;
}
