/** Day types the user can log. */
export type DayType = 'telework' | 'onsite' | 'third_country' | 'non_working';

export type CounterKind = 'tax' | 'social_security' | 'employer_practice';

export type LimitUnit = 'percent_of_working_time' | 'days_per_year' | 'days_per_period';

export interface OfficialSource {
  title: string;
  url: string;
  checked: string; // ISO date YYYY-MM-DD, Europe/Zurich check day
}

/** A single counter. If enabled=false, UI shows pendingValueKey and pendingReasonKey and never invents a number. */
export interface LimitCounter {
  id: string;
  kind: CounterKind;
  /** Stable i18n key under counters.* */
  labelKey: string;
  enabled: boolean;
  /** Present only when enabled and confirmed from an official source. */
  limit?: number;
  unit?: LimitUnit;
  /** How each day type contributes to this counter. */
  countsAs: Partial<Record<DayType, 'full' | 'toward_percent' | 'mission' | 'non_return' | 'none'>>;
  warningAt: number[]; // e.g. [0.75, 0.9, 1]
  sources: OfficialSource[];
  /** 'floor' is a minimum to reach. Default 'cap'. */
  direction?: 'cap' | 'floor';
  /** The limit itself is allowed ("up to", "n'excédant pas", "al massimo"): reaching it is "at limit", not "over". */
  inclusive?: boolean;
  /** Evaluation window. Default calendar_year. */
  period?: 'calendar_year' | 'month';
  /** Day limit reduced for part-time and part-year; rounding differs by rule. */
  prorate?: 'floor' | 'ceil';
  /** Days flagged overnightAway (on-site or trip days) count even if the day type does not. */
  countsOvernight?: boolean;
  /** Framework bands: from this percent an A1 is needed to stay in the employer's state. */
  a1FromPercent?: number;
  /** CH–FR rule: missions count inside the 40% only after ordinary telework, up to the 10-day cap. */
  missionRole?: 'share' | 'missions';
  /** Shown when the counter is over its limit: the consequence, not just the overshoot. */
  overKey?: string;
  /** Shown when enabled=false */
  pendingReasonKey?: string;
  /** Short text in place of the figures when enabled=false. */
  pendingValueKey?: string;
  notesKey?: string;
}

export type BorderId =
  | 'geneva_fr'
  | 'basel_fr'
  | 'basel_de'
  | 'luxembourg_fr'
  | 'luxembourg_be'
  | 'luxembourg_de'
  | 'belgium_fr'
  | 'belgium_nl'
  | 'ticino_it';

export interface BorderPack {
  id: BorderId;
  /** i18n key under borders.* */
  nameKey: string;
  residenceCountries: string[]; // ISO
  workCountries: string[];
  regionNoteKey?: string;
  counters: LimitCounter[];
  /** Default annual working days for % calculations when user has not set a custom value. */
  defaultAnnualWorkingDays: number;
  /** i18n keys under dayTypes.* replacing the shared hint for a day type on this corridor. */
  dayHintKeys?: Partial<Record<DayType, string>>;
  /** i18n key under dayTypes.*: logging guidance shown above the day buttons. */
  logHintKey?: string;
}

export interface DayEntry {
  date: string; // YYYY-MM-DD
  type: DayType;
  note?: string;
  /** Did not return home for work reasons. A day attribute, never a location. */
  overnightAway?: boolean;
}

/** Per-person facts some rules depend on. Null or absent means not provided. */
export interface EmploymentProfile {
  /** 1–100, part-time and part-year combined. */
  employmentPercent?: number | null;
  a1InPlace?: boolean | null;
  a1ValidUntil?: string | null; // YYYY-MM-DD
}

export interface CounterMessage {
  /** i18n key under counters.* */
  key: string;
  vars?: Record<string, string | number>;
  tone: 'info' | 'warn';
}

export type CounterStatus = 'ok' | 'warn' | 'critical' | 'at_limit' | 'over' | 'disabled';

export interface CounterResult {
  counterId: string;
  enabled: boolean;
  /** For percent counters: percent of annual contractual time. For day counters: days used. */
  used: number;
  limit: number | null;
  unit: LimitUnit | null;
  /** usedDays/allowedDays (percent) or used/limit (days). Warnings use this. */
  ratio: number | null;
  status: CounterStatus;
  /** Days that count toward the rule (null when disabled). */
  usedDays: number | null;
  /** Allowance in days (percent × annualWorkingDays, or absolute day limit). */
  allowedDays: number | null;
  /** Percent of annual contractual working days used (percent counters only). */
  percentOfAnnual: number | null;
  annualWorkingDays: number | null;
  /** i18n key under counters.* for the badge when the generic status label would mislead. */
  statusLabelKey?: string;
  /** What this result means for the person: always visible, never collapsed. */
  messages: CounterMessage[];
}
