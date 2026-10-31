import type {
  BorderPack,
  CounterMessage,
  CounterResult,
  CounterStatus,
  DayEntry,
  DayType,
  EmploymentProfile,
  LimitCounter,
} from '../borders/types';

export interface EvaluateOptions {
  year: number;
  annualWorkingDays?: number;
  referenceMonth?: string; // YYYY-MM
  profile?: EmploymentProfile;
  /** YYYY-MM-DD. Defaults to today in Europe/Zurich. */
  today?: string;
}

function yearOf(date: string): number {
  return Number(date.slice(0, 4));
}

function monthOf(date: string): string {
  return date.slice(0, 7); // YYYY-MM
}

/** Today in Europe/Zurich, so month boundaries match for every viewer. */
export function zurichToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich' }).format(now);
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

function statusFor(ratio: number | null, counter: LimitCounter): CounterStatus {
  if (ratio === null) return 'ok';
  if (ratio > 1) return 'over';
  if (ratio === 1) return counter.inclusive ? 'at_limit' : 'over';
  const sorted = [...counter.warningAt].filter((t) => t < 1).sort((a, b) => b - a);
  for (const t of sorted) {
    if (ratio >= t) return t >= 0.9 ? 'critical' : 'warn';
  }
  return 'ok';
}

/**
 * Whole days inside a percentage-of-working-time rule, rounded down so the allowance
 * never displays above the percentage. e.g. 40% of 240 contractual days → 96 days (ge.ch method).
 */
export function allowedDaysForPercent(limitPercent: number, annualWorkingDays: number): number {
  return Math.floor((limitPercent * annualWorkingDays) / 100);
}

/**
 * Part-time / part-year day limit.
 * FR–LU rounds down ("le nombre inférieur de journées entières"), CH–FR rounds up
 * ("arrondie à l'unité supérieure"): impots.gouv.fr accord 34 jours §1.b; ESTV accord 29.04.2026 §1.d.
 */
export function proratedLimit(limit: number, rounding: 'floor' | 'ceil', employmentPercent: number): number {
  const exact = (limit * employmentPercent) / 100;
  return rounding === 'floor' ? Math.floor(exact) : Math.ceil(exact);
}

export function validEmploymentPercent(p: EmploymentProfile | undefined): number | null {
  const v = p?.employmentPercent;
  return typeof v === 'number' && v >= 1 && v <= 100 ? v : null;
}

/**
 * CH–FR convention regime, ESTV accord amiable of 29 Apr 2026 §1:
 * ordinary telework is imputed first; missions count only up to both the 10-day cap and the
 * 40% quota; whatever exceeds either limit stays outside telework. Above the quota on telework
 * alone, the regime is lost. Worked examples: impots.gouv.fr fiche pratique, ex. 1–3.
 */
export function chFrMissionSplit(opts: {
  telework: number;
  missions: number;
  annualWorkingDays: number;
  quotaPercent: number;
  capDays: number;
}) {
  const quota = (opts.quotaPercent * opts.annualWorkingDays) / 100;
  const counted = Math.min(opts.missions, opts.capDays, Math.max(0, Math.floor(quota - opts.telework)));
  return {
    quota,
    counted,
    excess: opts.missions - counted,
    rateDays: opts.telework + counted,
    regimeLost: opts.telework > quota,
  };
}

/** Basel-Stadt: "mindestens an einem Tag pro Woche" — every Mon–Fri week of the month has an on-site day. */
function everyWeekCovered(month: string, onsiteDates: Set<string>): boolean {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const weeks = new Map<number, boolean>();
  for (let day = 1; day <= daysInMonth; day++) {
    const dt = new Date(Date.UTC(y, m - 1, day));
    const dow = dt.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    const monday = day - (dow - 1);
    const iso = `${month}-${String(day).padStart(2, '0')}`;
    weeks.set(monday, (weeks.get(monday) ?? false) || onsiteDates.has(iso));
  }
  return [...weeks.values()].every(Boolean);
}

function disabledResult(counter: LimitCounter): CounterResult {
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
    messages: [],
  };
}

function capStatusLabel(status: CounterStatus): string | undefined {
  return status === 'warn' ? 'status_approaching' : undefined;
}

function countsAsDay(counter: LimitCounter, e: DayEntry): boolean {
  const c = contribution(counter, e.type);
  if (c === 'full' || c === 'mission' || c === 'non_return') return true;
  // Telework and non-working days are at home or off work: a flag on them is not a work night away.
  return !!counter.countsOvernight && !!e.overnightAway && (e.type === 'onsite' || e.type === 'third_country');
}

function evaluateFloor(counter: LimitCounter, entries: DayEntry[], month: string, today: string): CounterResult {
  const limit = counter.limit!;
  const inMonth = entries.filter((e) => monthOf(e.date) === month);
  const onsite = new Set(inMonth.filter((e) => contribution(counter, e.type) === 'full').map((e) => e.date));
  const used = onsite.size;
  const monthEnded = month < monthOf(today);
  const weekly = everyWeekCovered(month, onsite);

  let status: CounterStatus = 'ok';
  let statusLabelKey = 'status_floor_progress';
  const messages: CounterMessage[] = [];
  if (used >= limit) {
    statusLabelKey = 'status_floor_met';
  } else if (weekly) {
    statusLabelKey = 'status_floor_met';
    messages.push({ key: 'floor_week_met', tone: 'info' });
  } else if (inMonth.length === 0) {
    statusLabelKey = 'status_floor_no_data';
  } else if (monthEnded) {
    status = 'warn';
    statusLabelKey = 'status_floor_below';
    messages.push({ key: 'floor_below_note', tone: 'warn', vars: { limit } });
  }
  return {
    counterId: counter.id,
    enabled: true,
    used,
    limit,
    unit: counter.unit!,
    ratio: Math.min(1, used / limit),
    status,
    usedDays: used,
    allowedDays: limit,
    percentOfAnnual: null,
    annualWorkingDays: null,
    statusLabelKey,
    messages,
  };
}

function a1InPlace(profile: EmploymentProfile | undefined, today: string): boolean {
  const until = profile?.a1ValidUntil;
  return !!profile?.a1InPlace && !(until && until < today);
}

/**
 * Framework bands (explanatory memorandum: change of legislation "as soon as the telework in the
 * state of residence amounts to a share of 25%"; Art. 3: "less than 50%"):
 * under 25% no A1 on telework grounds, 25% to under 50% A1 required, 50% or more residence state.
 */
function applyA1Bands(
  counter: LimitCounter,
  usedDays: number,
  annualWorkingDays: number,
  ratio: number | null,
  profile: EmploymentProfile | undefined,
  today: string,
): Pick<CounterResult, 'status' | 'statusLabelKey' | 'messages'> {
  const percent = annualWorkingDays > 0 ? (usedDays * 100) / annualWorkingDays : 0;
  const from = counter.a1FromPercent!;
  const until = profile?.a1ValidUntil ?? null;
  const expired = !!profile?.a1InPlace && !!until && until < today;
  const inPlace = a1InPlace(profile, today);

  if (ratio !== null && ratio >= 1) {
    return {
      status: 'over',
      statusLabelKey: 'status_ss_residence',
      messages: [{ key: 'ss_band_residence', tone: 'warn' }],
    };
  }
  const nearCap = statusFor(ratio, counter);
  if (percent >= from) {
    if (inPlace) {
      return {
        status: nearCap,
        statusLabelKey: 'status_a1_recorded',
        messages: [
          until
            ? { key: 'ss_band_a1_recorded', tone: 'info', vars: { until } }
            : { key: 'ss_band_a1_recorded_nodate', tone: 'info' },
        ],
      };
    }
    return {
      status: nearCap === 'ok' ? 'warn' : nearCap,
      statusLabelKey: 'status_a1_required',
      messages: [
        expired
          ? { key: 'ss_band_a1_expired', tone: 'warn', vars: { until: until! } }
          : { key: 'ss_band_a1_required', tone: 'warn' },
      ],
    };
  }
  if (percent >= from * 0.75 && !inPlace) {
    return {
      status: 'warn',
      statusLabelKey: 'status_approaching',
      messages: [{ key: 'ss_band_approaching', tone: 'warn', vars: { from } }],
    };
  }
  return { status: 'ok', statusLabelKey: 'status_ss_under', messages: [{ key: 'ss_band_under', tone: 'info', vars: { from } }] };
}

/**
 * Below about a working month of logs a pace says nothing, so it stays a neutral line.
 * This is a display choice, not a rule from any source.
 */
const PACE_MIN_LOGGED_DAYS = 20;

function paceMessage(usedDays: number, logged: number, limit: number): CounterMessage | null {
  if (logged === 0 || usedDays === 0) return null;
  const pct = Math.round((usedDays / logged) * 100);
  const vars = { pct, days: logged, limit };
  return pct > limit && logged >= PACE_MIN_LOGGED_DAYS
    ? { key: 'pace_above', tone: 'warn', vars }
    : { key: 'pace_line', tone: 'info', vars };
}

/**
 * Evaluate one counter for a calendar year (or one month for period: 'month' counters).
 *
 * percent_of_working_time is measured against the user's annual contractual working days
 * (or pack default), not against days logged so far. Ratio = usedDays / allowance so
 * warnings fire at 75/90% of the real annual allowance.
 */
export function evaluateCounter(
  pack: BorderPack,
  counter: LimitCounter,
  entries: DayEntry[],
  opts: EvaluateOptions = { year: new Date().getFullYear() },
): CounterResult {
  if (!counter.enabled || counter.limit == null || !counter.unit) return disabledResult(counter);

  const today = opts.today ?? zurichToday();
  if (counter.direction === 'floor') {
    return evaluateFloor(counter, entries, opts.referenceMonth ?? monthOf(today), today);
  }

  const annualWorkingDays = opts.annualWorkingDays ?? pack.defaultAnnualWorkingDays;
  const employmentPercent = validEmploymentPercent(opts.profile);
  const yearEntries = entries.filter((e) => yearOf(e.date) === opts.year);

  const missionsCounter = pack.counters.find((c) => c.missionRole === 'missions');
  const missionCap = () =>
    employmentPercent != null && missionsCounter?.prorate
      ? proratedLimit(missionsCounter.limit!, missionsCounter.prorate, employmentPercent)
      : missionsCounter!.limit!;
  const shareCounter = pack.counters.find((c) => c.missionRole === 'share');
  const missionSplit = () => {
    const by = (type: DayType) => yearEntries.filter((e) => e.type === type).length;
    return chFrMissionSplit({
      telework: by('telework'),
      missions: by('third_country'),
      annualWorkingDays,
      quotaPercent: shareCounter!.limit!,
      capDays: missionCap(),
    });
  };

  if (counter.unit === 'percent_of_working_time') {
    const limit = counter.limit;
    const split = counter.missionRole === 'share' ? missionSplit() : null;
    const usedDays = split
      ? split.rateDays
      : yearEntries.filter((e) => {
          const c = contribution(counter, e.type);
          return c === 'toward_percent' || c === 'full';
        }).length;
    const allowedDays = allowedDaysForPercent(limit, annualWorkingDays);
    const percentOfAnnual =
      annualWorkingDays > 0
        ? Math.round((usedDays / annualWorkingDays) * 10000) / 100
        : 0;
    const exactAllowance = (limit * annualWorkingDays) / 100;
    const ratio = exactAllowance > 0 ? usedDays / exactAllowance : null;

    let status = statusFor(ratio, counter);
    let statusLabelKey = capStatusLabel(status);
    const messages: CounterMessage[] = [];
    if (counter.a1FromPercent != null) {
      const band = applyA1Bands(counter, usedDays, annualWorkingDays, ratio, opts.profile, today);
      status = band.status;
      statusLabelKey = band.statusLabelKey;
      messages.push(...band.messages);
      const trips = yearEntries.filter((e) => e.type === 'third_country').length;
      // No numeric test for "habitual" was found, so show the count and stress it once it recurs.
      if (trips > 0) messages.push({ key: 'ss_third_country', tone: trips > 1 ? 'warn' : 'info', vars: { days: trips } });
    } else {
      if (status === 'at_limit') messages.push({ key: 'at_limit_note', tone: 'warn' });
      if (status === 'over' && counter.overKey) messages.push({ key: counter.overKey, tone: 'warn' });
      if (split && split.excess > 0 && !split.regimeLost) {
        messages.push({
          key: 'ch_fr_mission_excess',
          tone: 'warn',
          vars: { counted: split.counted, excess: split.excess },
        });
      }
    }
    // Without an A1 the line that matters on the framework counter is 25%, not 50%.
    const paceLimit =
      counter.a1FromPercent != null && !a1InPlace(opts.profile, today) ? counter.a1FromPercent : limit;
    const pace = paceMessage(usedDays, workingDays(yearEntries).length, paceLimit);
    if (pace) messages.push(pace);

    return {
      counterId: counter.id,
      enabled: true,
      // `used` = percent of annual contractual time (display helper / legacy)
      used: percentOfAnnual,
      limit,
      unit: counter.unit,
      ratio,
      status,
      usedDays,
      allowedDays,
      percentOfAnnual,
      annualWorkingDays,
      statusLabelKey,
      messages,
    };
  }

  // Absolute day counts
  const inPeriod =
    counter.period === 'month'
      ? entries.filter((e) => monthOf(e.date) === (opts.referenceMonth ?? monthOf(today)))
      : yearEntries;
  const used = inPeriod.filter((e) => countsAsDay(counter, e)).length;

  let limit = counter.limit;
  const messages: CounterMessage[] = [];
  if (counter.prorate) {
    if (employmentPercent == null) {
      messages.push({ key: 'prorate_missing', tone: 'warn', vars: { limit } });
    } else {
      limit = proratedLimit(limit, counter.prorate, employmentPercent);
      if (employmentPercent < 100) {
        messages.push({ key: 'prorate_applied', tone: 'info', vars: { pct: employmentPercent, limit } });
      }
    }
  }

  const ratio = limit > 0 ? used / limit : null;
  let status = statusFor(ratio, counter);
  if (status === 'at_limit') messages.push({ key: 'at_limit_note', tone: 'warn' });
  if (status === 'over' && counter.overKey) messages.push({ key: counter.overKey, tone: 'warn' });

  if (counter.missionRole === 'missions' && shareCounter) {
    const split = missionSplit();
    if (split.excess > 0) {
      messages.push({
        key: 'ch_fr_mission_excess',
        tone: 'warn',
        vars: { counted: split.counted, excess: split.excess },
      });
      if (status === 'ok') status = 'warn';
    }
  }

  return {
    counterId: counter.id,
    enabled: true,
    used,
    limit,
    unit: counter.unit,
    ratio,
    status,
    usedDays: used,
    allowedDays: limit,
    percentOfAnnual: null,
    annualWorkingDays,
    statusLabelKey: capStatusLabel(status),
    messages,
  };
}

export function evaluatePack(pack: BorderPack, entries: DayEntry[], opts?: Partial<EvaluateOptions>): CounterResult[] {
  const year = opts?.year ?? new Date().getFullYear();
  return pack.counters.map((c) => evaluateCounter(pack, c, entries, { ...opts, year }));
}

/** Pure helper used in tests: count days of a type in a year. */
export function countType(entries: DayEntry[], type: DayType, year: number): number {
  return entries.filter((e) => e.type === type && yearOf(e.date) === year).length;
}
