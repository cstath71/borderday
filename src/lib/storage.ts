import type { BorderId, DayEntry, DayType } from '../borders/types';

const DB_NAME = 'borderday';
const DB_VERSION = 1;
const STORE = 'days';
const META = 'meta';

export interface UserMeta {
  borderId: BorderId | null;
  annualWorkingDays: number | null;
  warnAt: number[]; // 0-1
  language: string;
}

const DEFAULT_META: UserMeta = {
  borderId: null,
  annualWorkingDays: null,
  warnAt: [0.75, 0.9, 1],
  language: 'en',
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains(META)) {
        db.createObjectStore(META, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getMeta(): Promise<UserMeta> {
  if (typeof indexedDB === 'undefined') return { ...DEFAULT_META };
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META, 'readonly');
    const req = tx.objectStore(META).get('user');
    req.onsuccess = () => {
      const row = req.result as { key: string; value: UserMeta } | undefined;
      resolve(row?.value ?? { ...DEFAULT_META });
    };
    req.onerror = () => reject(req.error);
  });
}

export async function setMeta(meta: UserMeta): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META, 'readwrite');
    tx.objectStore(META).put({ key: 'user', value: meta });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function upsertDay(entry: DayEntry): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteDay(date: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(date);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listDays(): Promise<DayEntry[]> {
  if (typeof indexedDB === 'undefined') return [];
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as DayEntry[]) ?? [];
      rows.sort((a, b) => a.date.localeCompare(b.date));
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAllDays(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function exportJson(): Promise<string> {
  const [days, meta] = await Promise.all([listDays(), getMeta()]);
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), meta, days }, null, 2);
}

export async function exportCsv(): Promise<string> {
  const days = await listDays();
  const lines = ['date,type,note'];
  for (const d of days) {
    const note = (d.note ?? '').replaceAll('"', '""');
    lines.push(`${d.date},${d.type},"${note}"`);
  }
  return lines.join('\n');
}

export function todayIso(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type { DayType };
