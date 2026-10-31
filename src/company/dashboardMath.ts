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
import { evaluatePack } from '../lib/counting';
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
  annualWorkingDays: number | null;
  profile: EmploymentProfile;
  counters: EmployeeCounterSummary[];
  /** Worst non-disabled status across enabled counters. */
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

type CountedLog = Pick<DayLog, 'workDate' | 'dayType' | 'note' | 'overnightAway'>;

export function dayLogsToEntries(logs: CountedLog[]): DayEntry[] {
  return logs.map((l) => ({ date: l.workDate, type: l.dayType, note: l.note, overnightAway: l.overnightAway }));
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
      profile,
      counters: [],
      worstStatus: 'disabled',
      isDemo,
    };
  }
  const annual = opts.annualWorkingDays ?? pack.defaultAnnualWorkingDays;
  const results = evaluatePack(pack, dayLogsToEntries(opts.logs), {
    year: opts.year,
    annualWorkingDays: annual,
    profile,
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
  let worst: AggregateStatus = 'ok';
  for (const c of counters) {
    if (c.status === 'disabled') continue;
    worst = worse(worst, c.status);
  }
  if (counters.every((c) => c.status === 'disabled' || !c.enabled)) worst = 'disabled';
  return {
    userId: opts.userId,
    displayName: opts.displayName,
    email: opts.email,
    borderPackId: opts.borderPackId,
    annualWorkingDays: annual,
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

/** CSV for audit — day types and counts only, never location. */
export function rowsToCsv(rows: EmployeeDashboardRow[], year: number): string {
  const header = [
    'demo',
    'employee_name',
    'employee_email',
    'border_pack',
    'annual_working_days',
    'employment_percent',
    'a1_in_place',
    'a1_valid_until',
    'counter_id',
    'kind',
    'status',
    'used_days',
    'allowed_days',
    'percent_of_annual',
    'year',
  ];
  const lines = [header.join(',')];
  for (const r of rows) {
    for (const c of r.counters) {
      lines.push(
        [
          r.isDemo ? 'DEMO' : '',
          csv(r.displayName),
          csv(r.email),
          r.borderPackId ?? '',
          r.annualWorkingDays ?? '',
          r.profile.employmentPercent ?? '',
          r.profile.a1InPlace ? 'yes' : 'no',
          r.profile.a1ValidUntil ?? '',
          c.counterId,
          c.kind,
          c.status,
          c.usedDays ?? '',
          c.allowedDays ?? '',
          c.percentOfAnnual ?? '',
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
