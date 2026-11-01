import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBorderPack, listBorderPacks, tracksOvernight } from '../borders/packs';
import type { BorderId, DayEntry, DayType } from '../borders/types';
import CounterCards from '../components/CounterCards';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ProfileFields, { type ProfileValues } from '../components/ProfileFields';
import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict, t } from '../i18n';
import { useAuth } from '../lib/auth';
import {
  isDayLogOtherCompany,
  listFormerCompanies,
  resolveAppAccess,
  updateMemberSelf,
  updateMyProfile,
  type AppAccess,
  type FormerCompany,
} from '../lib/companyApi';
import { annualBaseFor, evaluatePack, usesContractDays, zurichToday } from '../lib/counting';
import { dayStoreFor, localOnlyDays } from '../lib/dayStore';
import { download } from '../lib/download';
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
/** Colour is not the only cue: each logged cell also shows a shape. The aria-label carries the words. */
const DAY_MARKS: Record<DayType, string> = { telework: '⌂', onsite: '▣', third_country: '✈', non_working: '○' };

function canBeHalfDay(type: DayType): boolean {
  return type === 'telework' || type === 'onsite' || type === 'third_country';
}

/** Sleeping away for work only makes sense on a day worked away from home. */
function canBeOvernight(type: DayType): boolean {
  return type === 'onsite' || type === 'third_country';
}

const DAYS_PER_WEEK = [1, 2, 3, 4, 5];
/** Also enforced by the bd_*_note_length checks. */
const NOTE_MAX_LENGTH = 500;

/** The full-time base assumes a 5-day week; rounds like annualBaseFor scaling by employment %. */
export function annualForDaysPerWeek(fullTimeBase: number, daysPerWeek: number): number {
  return Math.max(1, Math.round((fullTimeBase * daysPerWeek) / 5));
}

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
  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      const keep = sessionStorage.getItem('bd_selected_date_keep') || sessionStorage.getItem('bd_selected_date');
      if (keep && /^\d{4}-\d{2}-\d{2}$/.test(keep)) {
        sessionStorage.removeItem('bd_selected_date_keep');
        return keep;
      }
    } catch { /* private mode */ }
    return todayIso();
  });
  const [viewYear, setViewYear] = useState(() => {
    try {
      const keep = sessionStorage.getItem('bd_selected_date') || sessionStorage.getItem('bd_selected_date_keep');
      if (keep && /^\d{4}-\d{2}-\d{2}$/.test(keep)) return Number(keep.slice(0, 4));
    } catch { /* */ }
    return Number(zurichToday().slice(0, 4));
  });
  const [viewMonth, setViewMonth] = useState(() => {
    try {
      const keep = sessionStorage.getItem('bd_selected_date') || sessionStorage.getItem('bd_selected_date_keep');
      if (keep && /^\d{4}-\d{2}-\d{2}$/.test(keep)) return Number(keep.slice(5, 7)) - 1;
    } catch { /* */ }
    return Number(zurichToday().slice(5, 7)) - 1;
  });
  const [busy, setBusy] = useState(false);
  /** Half day ticked on a date with no day type yet. A logged day keeps its own value in the entry. */
  const [halfBeforeType, setHalfBeforeType] = useState<Record<string, boolean>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [former, setFormer] = useState<FormerCompany[]>([]);

  useEffect(() => {
    try {
      sessionStorage.setItem('bd_selected_date', selectedDate);
    } catch { /* private mode */ }
  }, [selectedDate]);

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

  // Someone removed from a company falls back to the preview: tell them their days are not gone (E24).
  useEffect(() => {
    if (!userId) {
      setFormer([]);
      return;
    }
    let cancelled = false;
    listFormerCompanies()
      .then((list) => {
        if (!cancelled) setFormer(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const store = useMemo(() => (access ? dayStoreFor(access, userId) : null), [access, userId]);
  const isPreview = access?.mode === 'preview';

  const refresh = useCallback(async () => {
    if (!access || !store) return;
    const [localMeta, list] = await Promise.all([getMeta(), store.list()]);
    if (access.mode === 'company') {
      // Member settings live on the server; keep what this session already saved over the initial load.
      const { borderPackId, annualWorkingDays, profile } = access.company;
      setMetaState((prev) => prev ?? { ...localMeta, borderId: borderPackId, annualWorkingDays, ...profile });
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
  const storedAnnual = meta?.annualWorkingDays ?? null;

  const profile: ProfileValues = {
    employmentPercent: meta?.employmentPercent ?? null,
    contractDaysPerYear: meta?.contractDaysPerYear ?? null,
    a1InPlace: !!meta?.a1InPlace,
    a1ValidUntil: meta?.a1ValidUntil ?? null,
    frontierBefore2012: !!meta?.frontierBefore2012,
  };
  const { employmentPercent, contractDaysPerYear, a1InPlace, a1ValidUntil, frontierBefore2012 } = profile;
  const annual = pack && annualBaseFor(pack, storedAnnual, { employmentPercent });

  const results = useMemo(() => {
    if (!pack) return [];
    return evaluatePack(pack, days, {
      year: viewYear,
      annualWorkingDays: storedAnnual,
      referenceMonth: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`,
      profile: { employmentPercent, contractDaysPerYear, a1InPlace, a1ValidUntil, frontierBefore2012 },
    });
  }, [pack, days, viewYear, viewMonth, storedAnnual, employmentPercent, contractDaysPerYear, a1InPlace, a1ValidUntil, frontierBefore2012]);

  const selectedEntry = days.find((e) => e.date === selectedDate);
  const byDate = useMemo(() => {
    const m = new Map<string, DayEntry>();
    for (const e of days) m.set(e.date, e);
    return m;
  }, [days]);

  const today = todayIso();
  const selectedIsFuture = selectedDate > today;
  const selectedYear = Number(selectedDate.slice(0, 4));
  const currentYear = Number(today.slice(0, 4));
  const selectedIsPriorYear = selectedYear < currentYear;
  const canLogSelected = !isPreview || selectedDate.startsWith(today.slice(0, 7));
  const selectedIsHalf = selectedEntry ? selectedEntry.dayShare === 0.5 : !!halfBeforeType[selectedDate];
  const halfDayApplies = !selectedEntry || canBeHalfDay(selectedEntry.type);
  const locale = ({ en: 'en-CH', fr: 'fr-CH', de: 'de-CH', it: 'it-CH', nl: 'nl-BE' } as const)[lang] ?? 'en-CH';
  const longDate = (dt: Date) => dt.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const selectedLabel = longDate(new Date(`${selectedDate}T12:00:00`));

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

  async function saveProfile(next: ProfileValues) {
    if (!meta) return;
    setMetaState({ ...meta, ...next });
    setError(null);
    try {
      if (access?.mode === 'company') await updateMyProfile(access.company.id, next);
      else await setMeta({ ...meta, ...next });
    } catch {
      setError(d.app.saveError);
    }
  }

  async function logDay(type: DayType, overnightAway: boolean, dayShare: 0.5 | 1) {
    if (!store || !canLogSelected) return;
    const nextEntry: DayEntry = {
      date: selectedDate,
      type,
      overnightAway,
      dayShare,
      note: selectedEntry?.note,
    };
    // F30: optimistic UI, then reconcile from the store.
    setDays((prev) => {
      const others = prev.filter((e) => e.date !== selectedDate);
      return [...others, nextEntry].sort((a, b) => a.date.localeCompare(b.date));
    });
    setBusy(true);
    setError(null);
    try {
      await store.put(nextEntry, borderId);
      await refresh();
    } catch (e) {
      setError(isDayLogOtherCompany(e) ? d.app.dayLogOtherCompany : d.app.saveError);
      await refresh().catch(() => {});
    } finally {
      setBusy(false);
    }
  }

  /** F26 / A2-01: Clear removes one day. Company mode soft-voids (employer keeps a trail) and confirms first. */
  async function clearSelectedDay() {
    if (!store || !selectedEntry || !canLogSelected) return;
    if (access?.mode === 'company') {
      if (!window.confirm(t(d.app.clearDayConfirm, { date: selectedDate }))) return;
    }
    const date = selectedDate;
    setDays((prev) => prev.filter((e) => e.date !== date));
    setBusy(true);
    setError(null);
    try {
      await store.remove(date);
      await refresh();
    } catch {
      setError(d.app.saveError);
      await refresh().catch(() => {});
    } finally {
      setBusy(false);
    }
  }

  async function saveNote(entry: DayEntry, note: string) {
    if (!store || note.trim() === (entry.note ?? '')) return;
    setBusy(true);
    setError(null);
    try {
      await store.put({ ...entry, note: note.trim() }, borderId);
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
        <LoadingSkeleton label={d.app.loading} />
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
        {former.map((c) => (
          <p className="meta" key={c.companyId}>
            {t(d.app.formerCompanyDays, { company: c.company, count: c.dayCount })}{' '}
            <Link to={`/${lang}/account`}>{d.nav.account}</Link>
          </p>
        ))}
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
          {pack?.regionNoteKey && (
            <p className="meta">{(d.borders as Record<string, string>)[pack.regionNoteKey]}</p>
          )}
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
          {pack && meta && (
            <label style={{ display: 'block', marginTop: '0.75rem' }}>
              <strong>{d.app.daysPerWeek}</strong>
              <div className="meta" style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>
                {t(d.app.daysPerWeekHint, { default: pack.defaultAnnualWorkingDays })}
              </div>
              <select
                style={{ marginTop: '0.35rem' }}
                value={DAYS_PER_WEEK.find((n) => annualForDaysPerWeek(pack.defaultAnnualWorkingDays, n) === annual) ?? ''}
                onChange={(e) => {
                  if (e.target.value) {
                    void saveSettings({ ...meta, annualWorkingDays: annualForDaysPerWeek(pack.defaultAnnualWorkingDays, Number(e.target.value)) });
                  }
                }}
              >
                <option value="">—</option>
                {DAYS_PER_WEEK.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          )}
          {pack && meta && (
            <ProfileFields
              d={d}
              idPrefix="my-profile"
              value={profile}
              onChange={(next) => setMetaState({ ...meta, ...next })}
              onCommit={(next) => void saveProfile(next)}
              showFrontierBefore2012={borderId === 'belgium_fr'}
              showContractDays={usesContractDays(pack)}
            />
          )}
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
            <strong>{selectedDate === todayIso() ? `${d.app.today}: ${selectedLabel}` : selectedLabel}</strong>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                const today = todayIso();
                setSelectedDate(today);
                setViewYear(Number(today.slice(0, 4)));
                setViewMonth(Number(today.slice(5, 7)) - 1);
              }}
            >
              {d.app.today}
            </button>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
            {canLogSelected ? d.app.logDay : d.app.previewMonthOnly}
          </p>
          {selectedIsFuture && canLogSelected && (
            <p className="meta" role="status" data-testid="planned-day-warning">
              {d.app.plannedDayWarning}
            </p>
          )}
          {selectedIsPriorYear && canLogSelected && (
            <p className="meta" role="note" data-testid="prior-year-note">
              {t(d.app.priorYearNote, { year: selectedYear })}
            </p>
          )}
          {pack?.logHintKey && <p className="meta">{(d.dayTypes as Record<string, string>)[pack.logHintKey]}</p>}
          <div className="day-type-grid">
            {DAY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`day-type-btn ${selectedEntry?.type === type ? 'selected' : ''}`}
                aria-pressed={selectedEntry?.type === type}
                disabled={busy || !canLogSelected}
                onClick={() =>
                  void logDay(
                    type,
                    canBeOvernight(type) && !!selectedEntry?.overnightAway,
                    canBeHalfDay(type) && selectedIsHalf ? 0.5 : 1,
                  )
                }
              >
                <strong>{(d.dayTypes as Record<string, string>)[type]}</strong>
                <span>{(d.dayTypes as Record<string, string>)[pack?.dayHintKeys?.[type] ?? `${type}Hint`]}</span>
              </button>
            ))}
          </div>
          {pack && tracksOvernight(pack) && selectedEntry && canBeOvernight(selectedEntry.type) && (
            <label style={{ display: 'block', marginTop: '0.75rem' }}>
              <input
                type="checkbox"
                checked={!!selectedEntry.overnightAway}
                disabled={busy || !canLogSelected}
                onChange={(e) =>
                  void logDay(
                    selectedEntry.type,
                    e.target.checked,
                    selectedEntry.dayShare === 0.5 ? 0.5 : 1,
                  )
                }
              />{' '}
              <strong>{d.dayTypes.overnightAway}</strong>
              <div className="meta">{d.dayTypes.overnightAwayHint}</div>
            </label>
          )}
          <label style={{ display: 'block', marginTop: '0.75rem' }}>
            <input
              type="checkbox"
              checked={halfDayApplies && selectedIsHalf}
              disabled={busy || !canLogSelected || !halfDayApplies}
              onChange={(e) => {
                if (selectedEntry) {
                  void logDay(
                    selectedEntry.type,
                    canBeOvernight(selectedEntry.type) && !!selectedEntry.overnightAway,
                    e.target.checked ? 0.5 : 1,
                  );
                } else {
                  setHalfBeforeType((prev) => ({ ...prev, [selectedDate]: e.target.checked }));
                }
              }}
            />{' '}
            <strong>{d.dayTypes.halfDay}</strong>
            <div className="meta">
              {!halfDayApplies
                ? d.dayTypes.halfDayNotApplicable
                : !selectedEntry && selectedIsHalf
                  ? d.dayTypes.halfDayPending
                  : d.dayTypes.halfDayHint}
            </div>
          </label>
          <label style={{ display: 'block', marginTop: '0.75rem' }}>
            <strong>{d.app.noteLabel}</strong>
            <div className="meta">{selectedEntry ? d.app.noteHint : d.app.noteNeedsType}</div>
            <textarea
              rows={2}
              maxLength={NOTE_MAX_LENGTH}
              style={{ marginTop: '0.35rem', width: '100%' }}
              disabled={busy || !canLogSelected || !selectedEntry}
              value={noteDrafts[selectedDate] ?? selectedEntry?.note ?? ''}
              onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [selectedDate]: e.target.value }))}
              onBlur={(e) => {
                if (selectedEntry) void saveNote(selectedEntry, e.target.value);
              }}
            />
          </label>
          {selectedEntry && canLogSelected && (
            <p style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy}
                data-testid="clear-day"
                onClick={() => void clearSelectedDay()}
              >
                {d.app.clearDay}
              </button>
            </p>
          )}
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{d.app.calendar}</strong>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                className="btn btn-ghost"
                type="button"
                aria-label={d.app.prevMonth}
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
                aria-label={d.app.nextMonth}
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
              const isHalf = entry?.dayShare === 0.5 && canBeHalfDay(entry.type);
              const typeLabel = entry ? (d.dayTypes as Record<string, string>)[entry.type] : d.app.notLogged;
              const dayLabel = isHalf ? `${typeLabel}, ${d.dayTypes.halfDay}` : typeLabel;
              return (
                <button
                  type="button"
                  key={iso}
                  className={`cal-cell ${entry?.type ?? ''} ${isHalf ? 'half' : ''} ${iso === selectedDate ? 'selected' : ''}`}
                  aria-label={t(d.app.calendarDay, {
                    date: longDate(dt),
                    type: dayLabel,
                  })}
                  aria-pressed={iso === selectedDate}
                  aria-current={iso === todayIso() ? 'date' : undefined}
                  onClick={() => setSelectedDate(iso)}
                >
                  <span>{dt.getDate()}</span>
                  {entry && (
                    <span aria-hidden="true">
                      {' '}
                      {DAY_MARKS[entry.type]}
                      {isHalf && ' ½'}
                    </span>
                  )}
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

        <p className="meta" style={{ marginTop: '1rem' }}>
          {isPreview ? d.app.exportDeviceNote : d.app.exportAccountNote}{' '}
          {!isPreview && <Link to={`/${lang}/account`}>{d.nav.account}</Link>}
        </p>
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
          {access.mode !== 'company' && (
            <button className="btn btn-danger" type="button" onClick={() => void onDeleteAll()}>
              {d.app.deleteAll}
            </button>
          )}
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{d.app.installHint}</p>
      </div>
    </>
  );
}
