/** Day types the user can log. */
export type DayType = 'telework' | 'onsite' | 'third_country' | 'non_working';

export type CounterKind = 'tax' | 'social_security';

export type LimitUnit = 'percent_of_working_time' | 'days_per_year' | 'days_per_period';

export interface OfficialSource {
  title: string;
  url: string;
  checked: string; // ISO date YYYY-MM-DD, Europe/Zurich check day
}

/** A single counter. If enabled=false, UI must show "rule being confirmed" and not invent a number. */
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
  /** Shown when enabled=false */
  pendingReasonKey?: string;
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
}

export interface DayEntry {
  date: string; // YYYY-MM-DD
  type: DayType;
  note?: string;
}

export interface CounterResult {
  counterId: string;
  enabled: boolean;
  used: number;
  limit: number | null;
  unit: LimitUnit | null;
  ratio: number | null; // used/limit when both known
  status: 'ok' | 'warn' | 'critical' | 'over' | 'disabled';
}
