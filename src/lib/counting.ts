import type {
  BorderPack,
  CounterResult,
  DayEntry,
  DayType,
  LimitCounter,
} from '../borders/types';

function yearOf(date: string): number {
  return Number(date.slice(0, 4));
}

function monthOf(date: string): string {
  return date.slice(0, 7); // YYYY-MM
}

/** Working days in the set (excludes non_working). */
export function workingDays(entries: DayEntry[]): DayEntry[] {
  return entries.filter((e) => e.type !== 'non_working');
}

function contribution(
  counter: LimitCounter,
  type: DayType,
): 'full' | 'toward_percent' | 'mission' | 'non_return' | 'none' {
  return counter.countsAs[type] ?? 'none';
}

function statusFor(ratio: number | null, warningAt: number[]): CounterResult['status'] {
  if (ratio === null) return 'ok';
  if (ratio >= 1) return 'over';
  const sorted = [...warningAt].sort((a, b) => b - a);
  for (const t of sorted) {
    if (ratio >= t) {
      if (t >= 1) return 'over';
      if (t >= 0.9) return 'critical';
      return 'warn';
    }
  }
  return 'ok';
}

/**
 * Evaluate one counter for a calendar year (or current month for days_per_period employer practice).
 */
export function evaluateCounter(
  pack: BorderPack,
  counter: LimitCounter,
  entries: DayEntry[],
  opts: { year: number; annualWorkingDays?: number; referenceMonth?: string } = {
    year: new Date().getFullYear(),
  },
): CounterResult {
  if (!counter.enabled || counter.limit == null || !counter.unit) {
    return {
      counterId: counter.id,
      enabled: false,
      used: 0,
      limit: null,
      unit: null,
      ratio: null,
      status: 'disabled',
    };
  }

  const annualWorkingDays = opts.annualWorkingDays ?? pack.defaultAnnualWorkingDays;
  let yearEntries = entries.filter((e) => yearOf(e.date) === opts.year);

  // Basel-Stadt employer commute floor is monthly
  if (counter.unit === 'days_per_period' && counter.id.includes('employer')) {
    const month = opts.referenceMonth ?? new Date().toISOString().slice(0, 7);
    yearEntries = entries.filter((e) => monthOf(e.date) === month);
  }

  let used = 0;

  if (counter.unit === 'percent_of_working_time') {
    const worked = workingDays(yearEntries);
    const toward = worked.filter((e) => {
      const c = contribution(counter, e.type);
      return c === 'toward_percent' || c === 'full';
    }).length;
    const denom = Math.max(worked.length, 1);
    // Prefer user-logged working days as denominator when the year has logs;
    // also expose against the contractual annual base when useful.
    const pctOfLogged = (toward / denom) * 100;
    // For projections early in the year, also consider toward / annualWorkingDays.
    // Spec: use logged working days when available (>= 1), else annual base.
    used = worked.length >= 1 ? pctOfLogged : (toward / annualWorkingDays) * 100;
  } else {
    // day counts
    for (const e of yearEntries) {
      const c = contribution(counter, e.type);
      if (c === 'full' || c === 'mission' || c === 'non_return') {
        used += 1;
      }
    }
  }

  const limit = counter.limit;
  const ratio = limit > 0 ? used / limit : null;
  return {
    counterId: counter.id,
    enabled: true,
    used: Math.round(used * 100) / 100,
    limit,
    unit: counter.unit,
    ratio,
    status: statusFor(ratio, counter.warningAt),
  };
}

export function evaluatePack(
  pack: BorderPack,
  entries: DayEntry[],
  opts?: { year: number; annualWorkingDays?: number; referenceMonth?: string },
): CounterResult[] {
  const year = opts?.year ?? new Date().getFullYear();
  return pack.counters.map((c) => evaluateCounter(pack, c, entries, { ...opts, year }));
}

/** Pure helper used in tests: count days of a type in a year. */
export function countType(entries: DayEntry[], type: DayType, year: number): number {
  return entries.filter((e) => e.type === type && yearOf(e.date) === year).length;
}
