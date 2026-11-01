import { getBorderPack } from '../borders/packs';
import type {
  BorderId,
  CounterKind,
  CounterMessage,
  CounterResult,
  DayEntry,
  DayType,
  EmploymentProfile,
  OfficialSource,
} from '../borders/types';
import { annualBaseFor, evaluatePack, zurichToday } from '../lib/counting';
import { csvCell } from '../lib/csvCell';
import type { DayLog } from './types';

export type AggregateStatus = 'ok' | 'warn' | 'critical' | 'at_limit' | 'over' | 'disabled' | 'mixed';

export interface EmployeeCounterSummary {
  counterId: string;
  kind: CounterKind;
  labelKey: string;
  enabled: boolean;
  usedDays: number | null;
  allowedDays: number | null;
  percentOfAnnual: number | null;
  annualWorkingDays: number | null;
  status: CounterResult['status'];
  unit: CounterResult['unit'];
  used: number;
  limit: number | null;
  statusLabelKey?: string;
  messages: CounterMessage[];
  notesKey?: string;
  pendingReasonKey?: string;
  pendingValueKey?: string;
  sources: OfficialSource[];
}

export interface EmployeeDashboardRow {
  userId: string;
  displayName: string;
  email: string;
  borderPackId: BorderId | null;
  /** The base the counters use: the stored figure, or the default scaled by employment %. */
  annualWorkingDays: number | null;
  /** What is stored for this member. Null means the base follows employment %. */
  storedAnnualWorkingDays: number | null;
  profile: EmploymentProfile;
  counters: EmployeeCounterSummary[];
  /** Worst status across enabled tax and social-security counters. */
  worstStatus: AggregateStatus;
  isDemo: boolean;
}

function worse(a: AggregateStatus, b: CounterResult['status']): AggregateStatus {
  const rank: Record<string, number> = {
    disabled: 0,
    ok: 1,
    warn: 2,
    critical: 3,
    at_limit: 4,
    over: 5,
    mixed: 2,
  };
  return (rank[b] ?? 0) > (rank[a] ?? 0) ? (b as AggregateStatus) : a;
}

type CountedLog = Pick<DayLog, 'workDate' | 'dayType' | 'note' | 'overnightAway' | 'dayShare'>;

export function dayLogsToEntries(logs: CountedLog[]): DayEntry[] {
  return logs.map((l) => ({ date: l.workDate, type: l.dayType, note: l.note, overnightAway: l.overnightAway, dayShare: l.dayShare }));
}

/**
 * The dashboard status of one employee. Staff rules of one employer (Basel-Stadt's floor) stay out:
 * BorderDay does not know whose staff this is, so that counter keeps its own badge in the detail view
 * but cannot flag the employee overall.
 */
export function aggregateStatus(counters: Pick<EmployeeCounterSummary, 'kind' | 'enabled' | 'status'>[]): AggregateStatus {
  if (counters.every((c) => c.status === 'disabled' || !c.enabled)) return 'disabled';
  let worst: AggregateStatus = 'ok';
  for (const c of counters) {
    if (c.status === 'disabled' || c.kind === 'employer_practice') continue;
    worst = worse(worst, c.status);
  }
  return worst;
}

export function summarizeEmployee(opts: {
  userId: string;
  displayName: string;
  email: string;
  borderPackId: BorderId | null;
  annualWorkingDays: number | null;
  profile?: EmploymentProfile;
  logs: CountedLog[];
  year: number;
  isDemo?: boolean;
}): EmployeeDashboardRow {
  const isDemo = opts.isDemo ?? false;
  const profile = opts.profile ?? {};
  if (!opts.borderPackId) {
    return {
      userId: opts.userId,
      displayName: opts.displayName,
      email: opts.email,
      borderPackId: null,
      annualWorkingDays: opts.annualWorkingDays,
      storedAnnualWorkingDays: opts.annualWorkingDays,
      profile,
      counters: [],
      worstStatus: 'disabled',
      isDemo,
    };
  }
  const pack = getBorderPack(opts.borderPackId);
  if (!pack) {
    return {
      userId: opts.userId,
      displayName: opts.displayName,
      email: opts.email,
      borderPackId: opts.borderPackId,
      annualWorkingDays: opts.annualWorkingDays,
      storedAnnualWorkingDays: opts.annualWorkingDays,
      profile,
      counters: [],
      worstStatus: 'disabled',
      isDemo,
    };
  }
  const annual = annualBaseFor(pack, opts.annualWorkingDays, profile);
  const today = zurichToday();
  const results = evaluatePack(pack, dayLogsToEntries(opts.logs), {
    year: opts.year,
    annualWorkingDays: opts.annualWorkingDays,
    profile,
    // Same calendar month as the employee view (Europe/Zurich), not UTC.
    referenceMonth: today.slice(0, 7),
    today,
  });
  const counters: EmployeeCounterSummary[] = pack.counters.map((c) => {
    const r = results.find((x) => x.counterId === c.id)!;
    return {
      counterId: c.id,
      kind: c.kind,
      labelKey: c.labelKey,
      enabled: r.enabled,
      usedDays: r.usedDays,
      allowedDays: r.allowedDays,
      percentOfAnnual: r.percentOfAnnual,
      annualWorkingDays: r.annualWorkingDays,
      status: r.status,
      unit: r.unit,
      used: r.used,
      limit: r.limit,
      statusLabelKey: r.statusLabelKey,
      messages: r.messages,
      notesKey: c.notesKey,
      pendingReasonKey: c.pendingReasonKey,
      pendingValueKey: c.pendingValueKey,
      sources: c.sources,
    };
  });
  const worst = aggregateStatus(counters);
  return {
    userId: opts.userId,
    displayName: opts.displayName,
    email: opts.email,
    borderPackId: opts.borderPackId,
    annualWorkingDays: annual,
    storedAnnualWorkingDays: opts.annualWorkingDays,
    profile,
    counters,
    worstStatus: worst,
    isDemo,
  };
}

export function filterRows(
  rows: EmployeeDashboardRow[],
  opts: { borderPackId?: BorderId | '' | null; status?: AggregateStatus | '' | null },
): EmployeeDashboardRow[] {
  return rows.filter((r) => {
    if (opts.borderPackId && r.borderPackId !== opts.borderPackId) return false;
    if (opts.status && r.worstStatus !== opts.status) return false;
    return true;
  });
}

/**
 * Nationwide FR–CH employer telework-rate attestation (ESTV); Geneva (ge.ch) under geneva_fr uses its own form,
 * Jura (jura.ch) under basel_fr. Other cantons in these corridors were not verified.
 */
const FILING_NOTE_PACKS: ReadonlySet<BorderId> = new Set<BorderId>(['geneva_fr', 'basel_fr']);

export function needsFilingNote(rows: Pick<EmployeeDashboardRow, 'borderPackId'>[]): boolean {
  return rows.some((r) => r.borderPackId != null && FILING_NOTE_PACKS.has(r.borderPackId));
}

/** Floor so a calendar year of counters cannot be wiped mid-filing season (AR3-19). */
export const RETENTION_MONTHS_MIN = 13;
export const RETENTION_MONTHS_MAX = 120;

/** The range bd_companies.data_retention_months accepts. */
export function clampRetentionMonths(months: number): number {
  return Math.min(RETENTION_MONTHS_MAX, Math.max(RETENTION_MONTHS_MIN, Math.round(months)));
}

/** CSV for audit — day types and counts only, never location. Not an AFC filing. */
export function rowsToCsv(rows: EmployeeDashboardRow[], year: number): string {
  const header = [
    'demo',
    'employee_name',
    'employee_email',
    'route',
    'annual_working_days',
    'employment_percent',
    'contract_days_per_year',
    'a1_in_place',
    'a1_valid_until',
    'frontier_before_2012',
    'counter_id',
    'kind',
    'status',
    'used_days',
    'allowed_days',
    'percent_of_annual',
    'telework_rate_pct_working_calc_not_afc',
    'year',
  ];
  const disclaimer =
    '# BorderDay working export — day types and counts only, never location. Working record only — not an official filing. Compute and submit any required rate with your authority.';
  const filing =
    ' Nationwide FR–CH telework-rate attestation: all Swiss employers of France residents file early the following year with the cantonal tax authority, including at 0%. First: early 2027 for 2026. Geneva and Vaud use their own form (Geneva AFC / ge.ch); otherwise federal form or ELM/cantonal portal. Jura: attestation by 31 January following the fiscal period, from fiscal period 2026 (jura.ch).';
  const lines = [needsFilingNote(rows) ? disclaimer + filing : disclaimer, header.join(',')];
  for (const r of rows) {
    // Working calc of telework % for this employee (not an AFC filing figure).
    const teleworkRate =
      r.counters.find((c) => c.percentOfAnnual != null && c.kind === 'tax')?.percentOfAnnual ??
      r.counters.find((c) => c.percentOfAnnual != null)?.percentOfAnnual ??
      '';
    for (const c of r.counters) {
      lines.push(
        [
          r.isDemo ? 'yes' : 'no',
          // An employee sets their own display name, and HR opens this file.
          csvCell(r.displayName.trim()),
          csvCell(r.email),
          r.borderPackId ?? '',
          r.annualWorkingDays ?? '',
          r.profile.employmentPercent ?? '',
          r.profile.contractDaysPerYear ?? '',
          r.profile.a1InPlace ? 'yes' : 'no',
          r.profile.a1ValidUntil ?? '',
          r.profile.frontierBefore2012 ? 'yes' : 'no',
          c.counterId,
          c.kind,
          c.status,
          c.usedDays ?? '',
          c.allowedDays ?? '',
          c.percentOfAnnual ?? '',
          teleworkRate,
          year,
        ].join(','),
      );
    }
  }
  return lines.join('\n');
}

/**
 * Optional day-level CSV, so HR can check a count against its days. Date, day type and the two marks only:
 * DayLogView carries no note, and the log has no location. Only the employees and year given are included.
 */
export function dayRowsToCsv(
  rows: Pick<EmployeeDashboardRow, 'userId' | 'displayName' | 'email' | 'borderPackId' | 'isDemo'>[],
  logs: Array<{ employeeUserId: string; workDate: string; dayType: DayType; overnightAway?: boolean; dayShare?: 0.5 | 1 }>,
  year: number,
): string {
  const note =
    '# BorderDay day-level working export — dates, day types, half-day and night-away marks only, never location or notes. A half day counts as 0.5 in used_days, except where a rule counts any part of a day as a whole day and on the night and non-return counters. Not an official filing.';
  const lines = [note, 'demo,employee_name,employee_email,route,date,day_type,half_day,night_away'];
  const byUser = new Map(rows.map((r) => [r.userId, r]));
  const inYear = logs
    .filter((l) => byUser.has(l.employeeUserId) && Number(l.workDate.slice(0, 4)) === year)
    .sort((a, b) => a.employeeUserId.localeCompare(b.employeeUserId) || a.workDate.localeCompare(b.workDate));
  for (const l of inYear) {
    const r = byUser.get(l.employeeUserId)!;
    lines.push(
      [
        r.isDemo ? 'yes' : 'no',
        csvCell(r.displayName.trim()),
        csvCell(r.email),
        r.borderPackId ?? '',
        l.workDate,
        l.dayType,
        l.dayShare === 0.5 ? 'yes' : 'no',
        l.overnightAway ? 'yes' : 'no',
      ].join(','),
    );
  }
  return lines.join('\n');
}
