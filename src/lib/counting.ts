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
 * Allowed day budget for a percentage-of-working-time rule.
 * e.g. 40% of 240 contractual days → 96 days (ge.ch method).
 */
export function allowedDaysForPercent(limitPercent: number, annualWorkingDays: number): number {
  return Math.round((limitPercent / 100) * annualWorkingDays);
}

/**
 * Evaluate one counter for a calendar year (or current month for days_per_period employer practice).
 *
 * percent_of_working_time is measured against the user's annual contractual working days
 * (or pack default), not against days logged so far. Ratio = usedDays / allowedDays so
 * warnings fire at 75/90/100% of the real annual allowance.
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
      usedDays: null,
      allowedDays: null,
      percentOfAnnual: null,
      annualWorkingDays: null,
    };
  }

  const annualWorkingDays = opts.annualWorkingDays ?? pack.defaultAnnualWorkingDays;
  let yearEntries = entries.filter((e) => yearOf(e.date) === opts.year);

  // Basel-Stadt employer commute floor is monthly
  if (counter.unit === 'days_per_period' && counter.id.includes('employer')) {
    const month = opts.referenceMonth ?? new Date().toISOString().slice(0, 7);
    yearEntries = entries.filter((e) => monthOf(e.date) === month);
  }

  if (counter.unit === 'percent_of_working_time') {
    const usedDays = yearEntries.filter((e) => {
      const c = contribution(counter, e.type);
      return c === 'toward_percent' || c === 'full';
    }).length;
    const limit = counter.limit;
    const allowedDays = allowedDaysForPercent(limit, annualWorkingDays);
    const percentOfAnnual =
      annualWorkingDays > 0
        ? Math.round((usedDays / annualWorkingDays) * 10000) / 100
        : 0;
    const ratio = allowedDays > 0 ? usedDays / allowedDays : null;
    return {
      counterId: counter.id,
      enabled: true,
      // `used` = percent of annual contractual time (display helper / legacy)
      used: percentOfAnnual,
      limit,
      unit: counter.unit,
      ratio,
      status: statusFor(ratio, counter.warningAt),
      usedDays,
      allowedDays,
      percentOfAnnual,
      annualWorkingDays,
    };
  }

  // Absolute day counts (per year or per reference period)
  let used = 0;
  for (const e of yearEntries) {
    const c = contribution(counter, e.type);
    if (c === 'full' || c === 'mission' || c === 'non_return') {
      used += 1;
    }
  }

  const limit = counter.limit;
  const ratio = limit > 0 ? used / limit : null;
  return {
    counterId: counter.id,
    enabled: true,
    used,
    limit,
    unit: counter.unit,
    ratio,
    status: statusFor(ratio, counter.warningAt),
    usedDays: used,
    allowedDays: limit,
    percentOfAnnual: null,
    annualWorkingDays,
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
