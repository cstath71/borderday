import type { BorderId, DayEntry } from '../borders/types';
import {
  deleteMyDayLog,
  deleteMyDayLogs,
  deleteMyPersonalDayLog,
  deleteMyPersonalDayLogs,
  listDayLogs,
  listMyDayNotes,
  listPersonalDayLogs,
  upsertDayLog,
  upsertPersonalDayLog,
  type AppAccess,
} from './companyApi';
import { deleteAllDays, deleteDay, listDays, upsertDay } from './storage';

/** Where /app reads and writes days. Picked from the caller's access; only preview stays on-device. */
export interface DayStore {
  list(): Promise<DayEntry[]>;
  put(entry: DayEntry, borderId: BorderId | null): Promise<void>;
  /** F26: remove one day. */
  remove(workDate: string): Promise<void>;
  clear(): Promise<void>;
}

const localStore: DayStore = {
  list: listDays,
  put: (entry) => upsertDay(entry),
  remove: (workDate) => deleteDay(workDate),
  clear: deleteAllDays,
};

export function dayStoreFor(access: AppAccess, userId: string | null): DayStore {
  if (access.mode === 'company' && userId) {
    const companyId = access.company.id;
    return {
      list: async () => {
        const [logs, notes] = await Promise.all([listDayLogs(companyId, userId), listMyDayNotes(companyId)]);
        return logs
          .map((l) => {
            const note = notes.get(l.workDate);
            const entrySource: 'employee' | 'hr' = l.entrySource === 'hr' ? 'hr' : 'employee';
            return {
              date: l.workDate,
              type: l.dayType,
              overnightAway: l.overnightAway,
              dayShare: l.dayShare,
              entrySource,
              importedAt: l.importedAt ?? null,
              employeeConfirmedAt: l.employeeConfirmedAt ?? null,
              employeeCorrectedAt: l.employeeCorrectedAt ?? null,
              ...(note ? { note } : {}),
            };
          })
          .sort((a, b) => a.date.localeCompare(b.date));
      },
      put: (entry) =>
        upsertDayLog({ companyId, workDate: entry.date, dayType: entry.type, overnightAway: entry.overnightAway, dayShare: entry.dayShare, note: entry.note }),
      remove: (workDate) => deleteMyDayLog(companyId, workDate),
      clear: () => deleteMyDayLogs(companyId),
    };
  }
  if (access.mode === 'individual') {
    return {
      list: listPersonalDayLogs,
      put: (entry, borderId) =>
        upsertPersonalDayLog({
          workDate: entry.date,
          dayType: entry.type,
          borderPackId: borderId,
          overnightAway: entry.overnightAway,
          dayShare: entry.dayShare,
          note: entry.note,
        }),
      remove: (workDate) => deleteMyPersonalDayLog(workDate),
      clear: deleteMyPersonalDayLogs,
    };
  }
  return localStore;
}

/** Days on this device that the account does not have yet. The account's value wins on a clash. */
export function localOnlyDays(local: DayEntry[], account: DayEntry[]): DayEntry[] {
  const known = new Set(account.map((d) => d.date));
  return local.filter((d) => !known.has(d.date));
}
