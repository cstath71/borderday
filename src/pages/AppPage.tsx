import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBorderPack, listBorderPacks } from '../borders/packs';
import type { BorderId, DayEntry, DayType } from '../borders/types';
import CounterCards from '../components/CounterCards';
import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict, t } from '../i18n';
import { useAuth } from '../lib/auth';
import { resolveAppAccess, updateMemberSelf, type AppAccess } from '../lib/companyApi';
import { evaluatePack } from '../lib/counting';
import { dayStoreFor, localOnlyDays } from '../lib/dayStore';
import {
  deleteAllDays,
  exportCsv,
  exportJson,
  getMeta,
  listDays,
  setMeta,
  todayIso,
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
  const auth = useAuth();
  const userId = auth.user?.id ?? null;

  const [access, setAccess] = useState<AppAccess | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localOnly, setLocalOnly] = useState<DayEntry[]>([]);
  const [meta, setMetaState] = useState<UserMeta | null>(null);
  const [days, setDays] = useState<DayEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [busy, setBusy] = useState(false);

  // Fail closed: if access cannot be resolved, the visitor stays on the on-device preview.
  useEffect(() => {
    if (!auth.ready) return;
    let cancelled = false;
    setAccess(null);
    setMetaState(null);
    if (!userId) {
      setAccess({ mode: 'preview', unpaidCompany: null });
      return;
    }
    resolveAppAccess()
      .then((next) => {
        if (!cancelled) setAccess(next);
      })
      .catch(() => {
        if (cancelled) return;
        setError(d.company.loadError);
        setAccess({ mode: 'preview', unpaidCompany: null });
      });
    return () => {
      cancelled = true;
    };
  }, [auth.ready, userId, d.company.loadError]);

  const store = useMemo(() => (access ? dayStoreFor(access, userId) : null), [access, userId]);
  const isPreview = access?.mode === 'preview';

  const refresh = useCallback(async () => {
    if (!access || !store) return;
    const [localMeta, list] = await Promise.all([getMeta(), store.list()]);
    if (access.mode === 'company') {
      // Member settings live on the server; keep what this session already saved over the initial load.
      const { borderPackId, annualWorkingDays } = access.company;
      setMetaState((prev) => prev ?? { ...localMeta, borderId: borderPackId, annualWorkingDays });
    } else if (access.mode === 'individual' && !localMeta.borderId) {
      // Another device: the account's rows remember the border, this device's settings do not.
      const rows = list as Array<DayEntry & { borderPackId?: BorderId | null }>;
      const borderPackId = [...rows].reverse().find((e) => e.borderPackId)?.borderPackId;
      setMetaState(borderPackId ? { ...localMeta, borderId: borderPackId } : localMeta);
    } else {
      setMetaState(localMeta);
    }
    setDays(list);
    setLocalOnly(access.mode === 'preview' ? [] : localOnlyDays(await listDays(), list));
  }, [access, store]);

  useEffect(() => {
    refresh().catch(() => setError(d.company.loadError));
  }, [refresh, d.company.loadError]);

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

  const canLogSelected = !isPreview || selectedDate.startsWith(todayIso().slice(0, 7));

  async function saveSettings(next: UserMeta) {
    setMetaState(next);
    setError(null);
    try {
      if (access?.mode === 'company') {
        await updateMemberSelf(access.company.id, {
          borderPackId: next.borderId,
          annualWorkingDays: next.annualWorkingDays,
        });
      } else {
        await setMeta(next);
      }
    } catch {
      setError(d.app.saveError);
    }
  }

  async function logType(type: DayType) {
    if (!store || !canLogSelected) return;
    setBusy(true);
    setError(null);
    try {
      await store.put({ date: selectedDate, type }, borderId);
      await refresh();
    } catch {
      setError(d.app.saveError);
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteAll() {
    if (!store) return;
    if (!window.confirm(isPreview ? d.app.deleteAllConfirm : d.app.deleteAllAccountConfirm)) return;
    setError(null);
    try {
      await store.clear();
      await refresh();
      alert(d.app.deleted);
    } catch {
      setError(d.app.saveError);
    }
  }

  async function onImportLocal() {
    if (!store) return;
    setBusy(true);
    setError(null);
    try {
      for (const day of localOnly) await store.put(day, borderId);
      await deleteAllDays();
      await refresh();
    } catch {
      setError(d.app.saveError);
    } finally {
      setBusy(false);
    }
  }

  const cells = monthMatrix(viewYear, viewMonth);
  const weekdays = d.app.weekdays;

  if (!access) {
    return (
      <div className="container app-shell">
        <p role="status">{d.app.loading}</p>
      </div>
    );
  }

  return (
    <>
      <Seo lang={lang} title={`${d.app.title} — BorderDay`} description={d.meta.description} path="app" />
      <div className="container app-shell">
        <div className="banner">{d.app.disclaimerBanner}</div>
        {access.mode === 'preview' && (
          <div className="demo-banner" role="status">
            <strong>{d.app.previewBadge}</strong> —{' '}
            {access.unpaidCompany
              ? t(d.app.previewCompanyBody, { company: access.unpaidCompany })
              : d.app.previewBody}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <Link className="btn btn-primary" to={`/${lang}/pricing`}>
                {d.app.previewCta}
              </Link>
              {!auth.user && (
                <Link className="btn btn-secondary" to={`/${lang}/auth/sign-in?next=${encodeURIComponent(`/${lang}/app`)}`}>
                  {d.auth.signIn}
                </Link>
              )}
            </div>
          </div>
        )}
        <h1>
          {d.app.title}
          {access.mode === 'preview' && (
            <span className="badge warn" style={{ marginLeft: '0.5rem' }}>
              {d.app.previewBadge}
            </span>
          )}
        </h1>
        {access.mode === 'individual' && <p className="meta">{d.app.savedToAccount}</p>}
        {access.mode === 'company' && (
          <p className="meta">
            {t(d.app.savedToCompany, { company: access.company.name })}{' '}
            <Link to={`/${lang}/company/${access.company.id}/employee/${userId}`}>{d.company.viewMyHistory}</Link>
          </p>
        )}
        {error && (
          <p role="alert" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}
        {localOnly.length > 0 && (
          <p>
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void onImportLocal()}>
              {t(d.app.importLocal, { count: localOnly.length })}
            </button>
          </p>
        )}

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
            onChange={(e) => {
              if (meta) void saveSettings({ ...meta, borderId: e.target.value as BorderId });
            }}
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
                  setMetaState({ ...meta, annualWorkingDays: v >= 1 && v <= 366 ? v : null });
                }}
                onBlur={() => {
                  if (meta) void saveSettings(meta);
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
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
            {canLogSelected ? d.app.logDay : d.app.previewMonthOnly}
          </p>
          <div className="day-type-grid">
            {DAY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`day-type-btn ${selectedEntry?.type === type ? 'selected' : ''}`}
                disabled={busy || !canLogSelected}
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
            onClick={async () => download('borderday-export.json', await exportJson(days), 'application/json')}
          >
            {d.app.exportJson}
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={async () => download('borderday-export.csv', await exportCsv(days), 'text/csv')}
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
