import { useCallback, useEffect, useMemo, useState } from 'react';
import { getBorderPack, listBorderPacks } from '../borders/packs';
import type { BorderId, DayEntry, DayType } from '../borders/types';
import CounterCards from '../components/CounterCards';
import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';
import { evaluatePack } from '../lib/counting';
import {
  deleteAllDays,
  exportCsv,
  exportJson,
  getMeta,
  listDays,
  setMeta,
  todayIso,
  upsertDay,
  type UserMeta,
} from '../lib/storage';

const DAY_TYPES: DayType[] = ['telework', 'onsite', 'third_country', 'non_working'];

function monthMatrix(year: number, month0: number): (Date | null)[] {
  const first = new Date(year, month0, 1);
  const startPad = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month0, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function download(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AppPage() {
  const lang = useLang();
  const d = getDict(lang);
  const packs = listBorderPacks();

  const [meta, setMetaState] = useState<UserMeta | null>(null);
  const [days, setDays] = useState<DayEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const [m, list] = await Promise.all([getMeta(), listDays()]);
    setMetaState(m);
    setDays(list);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const borderId = meta?.borderId ?? null;
  const pack = borderId ? getBorderPack(borderId) : undefined;
  const annual = meta?.annualWorkingDays ?? pack?.defaultAnnualWorkingDays;

  const results = useMemo(() => {
    if (!pack) return [];
    return evaluatePack(pack, days, {
      year: viewYear,
      annualWorkingDays: annual,
      referenceMonth: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`,
    });
  }, [pack, days, viewYear, viewMonth, annual]);

  const selectedEntry = days.find((e) => e.date === selectedDate);
  const byDate = useMemo(() => {
    const m = new Map<string, DayEntry>();
    for (const e of days) m.set(e.date, e);
    return m;
  }, [days]);

  async function saveBorder(id: BorderId) {
    if (!meta) return;
    const next = { ...meta, borderId: id };
    await setMeta(next);
    setMetaState(next);
  }

  async function logType(type: DayType) {
    setBusy(true);
    try {
      await upsertDay({ date: selectedDate, type });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteAll() {
    if (!window.confirm(d.app.deleteAllConfirm)) return;
    await deleteAllDays();
    await refresh();
    alert(d.app.deleted);
  }

  const cells = monthMatrix(viewYear, viewMonth);
  const weekdays = d.app.weekdays;

  return (
    <>
      <Seo lang={lang} title={`${d.app.title} — BorderDay`} description={d.meta.description} path="app" />
      <div className="container app-shell">
        <div className="banner">{d.app.disclaimerBanner}</div>
        <h1>{d.app.title}</h1>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <label htmlFor="border">
            <strong>{d.app.pickBorder}</strong>
            <div className="meta" style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>
              {d.app.pickBorderHint}
            </div>
          </label>
          <select
            id="border"
            className="border-select"
            style={{ marginTop: '0.5rem' }}
            value={borderId ?? ''}
            onChange={(e) => void saveBorder(e.target.value as BorderId)}
          >
            <option value="" disabled>
              —
            </option>
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {(d.borders as Record<string, string>)[p.nameKey]}
              </option>
            ))}
          </select>
          {pack && (
            <label style={{ display: 'block', marginTop: '0.75rem' }}>
              <strong>{d.app.annualWorkingDays}</strong>
              <div className="meta" style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>
                {d.app.annualWorkingDaysHint}
              </div>
              <input
                className="num"
                type="number"
                min={1}
                max={366}
                style={{ marginTop: '0.35rem' }}
                value={annual ?? ''}
                onChange={(e) => {
                  if (!meta) return;
                  const v = Number(e.target.value);
                  const next = { ...meta, annualWorkingDays: Number.isFinite(v) ? v : null };
                  setMetaState(next);
                  void setMeta(next);
                }}
              />
            </label>
          )}
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
            <strong>
              {d.app.today}: {selectedDate}
            </strong>
            <button className="btn btn-ghost" type="button" onClick={() => setSelectedDate(todayIso())}>
              {d.app.today}
            </button>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>{d.app.logDay}</p>
          <div className="day-type-grid">
            {DAY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`day-type-btn ${selectedEntry?.type === type ? 'selected' : ''}`}
                disabled={busy}
                onClick={() => void logType(type)}
              >
                <strong>{(d.dayTypes as Record<string, string>)[type]}</strong>
                <span>{(d.dayTypes as Record<string, string>)[`${type}Hint`]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{d.app.calendar}</strong>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  const m = viewMonth - 1;
                  if (m < 0) {
                    setViewMonth(11);
                    setViewYear((y) => y - 1);
                  } else setViewMonth(m);
                }}
              >
                ‹
              </button>
              <span style={{ minWidth: '7rem', textAlign: 'center' }}>
                {viewYear}-{String(viewMonth + 1).padStart(2, '0')}
              </span>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  const m = viewMonth + 1;
                  if (m > 11) {
                    setViewMonth(0);
                    setViewYear((y) => y + 1);
                  } else setViewMonth(m);
                }}
              >
                ›
              </button>
            </div>
          </div>
          <div className="calendar-grid">
            {weekdays.map((w) => (
              <div className="cal-head" key={w}>
                {w}
              </div>
            ))}
            {cells.map((dt, i) => {
              if (!dt) return <div key={`e-${i}`} className="cal-cell muted" />;
              const iso = todayIso(dt);
              const entry = byDate.get(iso);
              return (
                <button
                  type="button"
                  key={iso}
                  className={`cal-cell ${entry?.type ?? ''} ${iso === selectedDate ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(iso)}
                >
                  <span>{dt.getDate()}</span>
                </button>
              );
            })}
          </div>
          {days.filter((e) => e.date.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`)).length ===
            0 && <p style={{ color: 'var(--ink-muted)' }}>{d.app.emptyMonth}</p>}
        </div>

        <h2>{d.app.counters}</h2>
        {!pack && <p>{d.app.noBorder}</p>}
        {pack && <CounterCards d={d} pack={pack} results={results} />}

        <div className="toolbar">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={async () => download('borderday-export.json', await exportJson(), 'application/json')}
          >
            {d.app.exportJson}
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={async () => download('borderday-export.csv', await exportCsv(), 'text/csv')}
          >
            {d.app.exportCsv}
          </button>
          <button className="btn btn-danger" type="button" onClick={() => void onDeleteAll()}>
            {d.app.deleteAll}
          </button>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{d.app.installHint}</p>
      </div>
    </>
  );
}
