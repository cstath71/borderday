import { getBorderPack } from '../borders/packs';
import type {
  BorderId,
  CounterKind,
  CounterMessage,
  CounterResult,
  DayEntry,
  EmploymentProfile,
  OfficialSource,
} from '../borders/types';
import { annualBaseFor, evaluatePack, zurichToday } from '../lib/counting';
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
 * Corridors with an employer telework-rate filing we could verify: Geneva (ge.ch) under geneva_fr,
 * Jura (jura.ch) under basel_fr. Other cantons in these corridors were not verified.
 */
const FILING_NOTE_PACKS: ReadonlySet<BorderId> = new Set<BorderId>(['geneva_fr', 'basel_fr']);

export function needsFilingNote(rows: Pick<EmployeeDashboardRow, 'borderPackId'>[]): boolean {
  return rows.some((r) => r.borderPackId != null && FILING_NOTE_PACKS.has(r.borderPackId));
}

/** CSV for audit — day types and counts only, never location. Not an AFC filing. */
export function rowsToCsv(rows: EmployeeDashboardRow[], year: number): string {
  const header = [
    'demo',
    'employee_name',
    'employee_email',
    'border_pack',
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
    '# BorderDay working export — day types and counts only, never location. Not the annual telework-rate filing some cantons (e.g. AFC) require. Compute and submit that rate with your authority.';
  const filing =
    ' Dates we could verify: Geneva, first transmission to the AFC in January 2027 for 2026 data; Jura, attestation by 31 January following the fiscal period, from fiscal period 2026. Other cantons not verified.';
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
          r.isDemo ? 'DEMO' : '',
          csv(r.displayName),
          csv(r.email),
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

function csv(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
