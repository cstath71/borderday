import { defuseFormula, csvCell } from './csvCell';
import type { DayType } from '../borders/types';

/** One upload. A year of days for a mid-size company fits; larger files are split. */
export const MAX_IMPORT_ROWS = 20_000;
const NOTE_MAX = 500;

const DAY_TYPES: readonly DayType[] = ['telework', 'onsite', 'third_country', 'non_working'];

export type ProvenanceCode = 'employee' | 'hr_import' | 'hr_import_confirmed' | 'hr_import_corrected';

export function provenanceOf(row: {
  entrySource?: 'employee' | 'hr' | null;
  employeeConfirmedAt?: string | null;
  employeeCorrectedAt?: string | null;
}): ProvenanceCode {
  if (row.entrySource !== 'hr') return 'employee';
  if (row.employeeCorrectedAt) return 'hr_import_corrected';
  if (row.employeeConfirmedAt) return 'hr_import_confirmed';
  return 'hr_import';
}

export interface ImportMember {
  userId: string;
  email: string;
  active: boolean;
  /** ISO timestamp or date. Only the calendar day is used. */
  removedAt: string | null;
  employedFrom: string | null;
  employedUntil: string | null;
}

export interface ImportExisting {
  employeeUserId: string;
  workDate: string;
  entrySource?: 'employee' | 'hr' | null;
  employeeCorrectedAt?: string | null;
  voidedAt?: string | null;
}

export type ImportRowStatus = 'ready' | 'error' | 'skipped';

export interface ClassifiedRow {
  index: number;
  email: string;
  workDate: string;
  dayType: string;
  overnightAway: boolean;
  halfDay: boolean;
  /** Stored form: formula characters already defused, trimmed. */
  note: string;
  status: ImportRowStatus;
  code: string | null;
  /** What the RPC should receive for this row, including invalid flags. */
  rpc: ImportRpcRow;
}

export interface ImportRpcRow {
  email: string;
  work_date: string;
  day_type: string;
  overnight_away: boolean | 'invalid';
  half_day: boolean | 'invalid';
  note: string;
}

export interface ImportFileResult {
  fileError: null | 'empty' | 'bad_file' | 'too_big';
  rows: ClassifiedRow[];
}

export interface ImportRpcResult {
  batch_id: string;
  imported: number;
  skipped: number;
  errors: number;
  rows: Array<{
    index: number;
    status: 'imported' | 'skipped' | 'error';
    code: string | null;
    email: string | null;
    work_date: string | null;
  }>;
}

/** Header plus one obviously fake example row. Column names stay English: they are the file format. */
export function dayImportTemplateCsv(): string {
  const header = 'employee_email,date,day_type,overnight_away,half_day,note';
  const example = [
    csvCell('ada.example@example.com'),
    '2026-03-02',
    'telework',
    'no',
    'no',
    csvCell('Example row. Delete before import.'),
  ].join(',');
  return `${header}\n${example}\n`;
}

export function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let i = 0;
  let inQuotes = false;
  while (i < src.length) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === ',') {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }
    if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function headerIndex(header: string[], names: string[]): number {
  const wanted = new Set(names);
  return header.findIndex((cell) => wanted.has(cell.trim().toLowerCase()));
}

function canonicalType(raw: string): DayType | null {
  const v = raw.trim().toLowerCase().replaceAll('-', '_').replaceAll(' ', '_');
  const mapped = v === 'on_site' ? 'onsite' : v;
  return (DAY_TYPES as readonly string[]).includes(mapped) ? (mapped as DayType) : null;
}

function parseFlag(raw: string | undefined): boolean | 'invalid' | 'absent' {
  if (raw === undefined) return 'absent';
  const v = raw.trim().toLowerCase();
  if (v === '') return 'absent';
  if (v === 'no' || v === 'n' || v === 'false' || v === '0' || v === '1.0') return false;
  if (v === 'yes' || v === 'y' || v === 'true' || v === '1' || v === '0.5') return true;
  return 'invalid';
}

/** Real YYYY-MM-DD only. 2026-02-31 is rejected. */
export function parseIsoDate(raw: string): string | null {
  const v = raw.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return v;
}

function dayOf(value: string | null): string | null {
  if (!value) return null;
  const day = value.slice(0, 10);
  return parseIsoDate(day) ? day : null;
}

/** Last day that may be imported. Active members use employed_until only. */
export function employmentEnd(member: Pick<ImportMember, 'active' | 'removedAt' | 'employedUntil'>): string | null {
  if (member.active) return dayOf(member.employedUntil);
  const removed = dayOf(member.removedAt);
  const until = dayOf(member.employedUntil);
  if (until && removed) return until < removed ? until : removed;
  return until ?? removed;
}

function finish(row: ClassifiedRow, status: ImportRowStatus, code: string | null): ClassifiedRow {
  return { ...row, status, code };
}

/**
 * Classify every data row. Nothing is written here.
 * Employment start is employed_from when set. joined_at is not a bound: a company
 * joining in November can load days from earlier in the year.
 */
export function classifyDayImport(
  text: string,
  opts: { members: ImportMember[]; existing: ImportExisting[]; today: string },
): ImportFileResult {
  const table = parseCsv(text).filter((r) => r.some((c) => c.trim() !== ''));
  if (table.length === 0) return { fileError: 'empty', rows: [] };
  const header = table[0].map((c) => c.trim().toLowerCase());
  const emailAt = headerIndex(header, ['employee_email', 'email']);
  const dateAt = headerIndex(header, ['date', 'work_date']);
  const typeAt = headerIndex(header, ['day_type', 'type']);
  if (emailAt < 0 || dateAt < 0 || typeAt < 0) return { fileError: 'bad_file', rows: [] };
  const overnightAt = headerIndex(header, ['overnight_away', 'overnight_away_for_work', 'overnight', 'night_away']);
  const halfAt = headerIndex(header, ['half_day', 'day_share']);
  const noteAt = headerIndex(header, ['note']);
  const data = table.slice(1);
  if (data.length === 0) return { fileError: 'empty', rows: [] };
  if (data.length > MAX_IMPORT_ROWS) return { fileError: 'too_big', rows: [] };

  const byEmail = new Map<string, ImportMember[]>();
  for (const m of opts.members) {
    const key = m.email.trim().toLowerCase();
    const list = byEmail.get(key);
    if (list) list.push(m);
    else byEmail.set(key, [m]);
  }
  const existingByKey = new Map<string, ImportExisting>();
  for (const log of opts.existing) {
    existingByKey.set(`${log.employeeUserId}|${log.workDate}`, log);
  }

  const rows: ClassifiedRow[] = data.map((cells, index) => {
    const email = (cells[emailAt] ?? '').trim().toLowerCase();
    const workDateRaw = (cells[dateAt] ?? '').trim();
    const typeRaw = (cells[typeAt] ?? '').trim();
    const overnightFlag = overnightAt < 0 ? 'absent' : parseFlag(cells[overnightAt] ?? '');
    const halfFlag = halfAt < 0 ? 'absent' : parseFlag(cells[halfAt] ?? '');
    const note = defuseFormula((cells[noteAt] ?? '').trim());
    const overnightAway = overnightFlag === true;
    const halfDay = halfFlag === true;
    const rpc: ImportRpcRow = {
      email,
      work_date: workDateRaw,
      day_type: typeRaw,
      overnight_away: overnightFlag === 'invalid' ? 'invalid' : overnightAway,
      half_day: halfFlag === 'invalid' ? 'invalid' : halfDay,
      note,
    };
    const base: ClassifiedRow = {
      index,
      email,
      workDate: workDateRaw,
      dayType: typeRaw,
      overnightAway,
      halfDay,
      note,
      status: 'ready',
      code: null,
      rpc,
    };
    if (!email) return finish(base, 'error', 'unknown_email');
    const workDate = parseIsoDate(workDateRaw);
    if (!workDate) return finish(base, 'error', 'bad_date');
    base.workDate = workDate;
    base.rpc.work_date = workDate;
    if (workDate > opts.today) return finish(base, 'error', 'future_date');
    const dayType = canonicalType(typeRaw);
    if (!dayType) return finish(base, 'error', 'invalid_type');
    base.dayType = dayType;
    base.rpc.day_type = dayType;
    if (overnightFlag === 'invalid' || halfFlag === 'invalid') return finish(base, 'error', 'invalid_flag');
    if (halfDay && dayType === 'non_working') return finish(base, 'error', 'invalid_half_day');
    if (overnightAway && dayType !== 'onsite' && dayType !== 'third_country') return finish(base, 'error', 'invalid_overnight');
    if (note.length > NOTE_MAX) return finish(base, 'error', 'note_too_long');
    const matches = byEmail.get(email) ?? [];
    if (matches.length > 1) return finish(base, 'error', 'ambiguous_email');
    if (matches.length === 0) return finish(base, 'error', 'not_member');
    const member = matches[0];
    const start = dayOf(member.employedFrom);
    const end = employmentEnd(member);
    if ((start && workDate < start) || (end && workDate > end)) return finish(base, 'error', 'outside_employment');
    const prior = existingByKey.get(`${member.userId}|${workDate}`);
    if (prior) {
      const untouchedHr =
        prior.entrySource === 'hr' && !prior.employeeCorrectedAt && !prior.voidedAt;
      return finish(base, 'skipped', untouchedHr ? 'skipped_already_imported' : 'skipped_employee');
    }
    return base;
  });

  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.email || !parseIsoDate(row.workDate)) continue;
    const key = `${row.email}|${row.workDate}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  for (const row of rows) {
    if (!row.email || !parseIsoDate(row.workDate)) continue;
    if ((counts.get(`${row.email}|${row.workDate}`) ?? 0) > 1) {
      row.status = 'error';
      row.code = 'duplicate_in_file';
    }
  }
  return { fileError: null, rows };
}
