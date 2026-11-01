import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getBorderPack, listBorderPacks } from '../../borders/packs';
import type { BorderId, DayType } from '../../borders/types';
import type { AggregateStatus, EmployeeDashboardRow } from '../../company/dashboardMath';
import { RETENTION_MONTHS_MAX, RETENTION_MONTHS_MIN, clampRetentionMonths, dayRowsToCsv, filterRows, needsFilingNote, rowsToCsv } from '../../company/dashboardMath';
import type { Invitation } from '../../company/types';
import { t, type Dict } from '../../i18n';
import { download } from '../../lib/download';
import { usesContractDays, usesPartYearFormula } from '../../lib/counting';
import ProfileFields, { type ProfileValues } from '../ProfileFields';
import type { ResendResult } from '../../lib/companyApi';
import CounterTable, { statusLabel } from './CounterTable';
import PendingInvites from './PendingInvites';

const STATUSES: AggregateStatus[] = ['ok', 'warn', 'critical', 'at_limit', 'over', 'disabled'];

export interface TeamMember {
  userId: string;
  displayName: string;
  email: string;
}

export type EmployeeProfileValues = ProfileValues & { annualWorkingDays?: number | null };

/** HR records what an employee's limits depend on. Status shows only after a real save. */
function EmployeeProfileForm(props: {
  d: Dict;
  row: EmployeeDashboardRow;
  onSave: (userId: string, profile: EmployeeProfileValues) => Promise<void>;
}) {
  const { d, row, onSave } = props;
  const pack = row.borderPackId ? getBorderPack(row.borderPackId) : undefined;
  const [base, setBase] = useState<number | null>(row.storedAnnualWorkingDays);
  const [value, setValue] = useState<ProfileValues>({
    employmentPercent: row.profile.employmentPercent ?? null,
    contractDaysPerYear: row.profile.contractDaysPerYear ?? null,
    a1InPlace: !!row.profile.a1InPlace,
    a1ValidUntil: row.profile.a1ValidUntil ?? null,
    frontierBefore2012: !!row.profile.frontierBefore2012,
  });
  const [state, setState] = useState<'idle' | 'saved' | 'error'>('idle');
  return (
    <details style={{ marginTop: '0.75rem' }}>
      <summary className="meta">{d.company.profileTitle}</summary>
      <ProfileFields
        d={d}
        idPrefix={`profile-${row.userId}`}
        value={value}
        onChange={(next) => {
          setValue(next);
          setState('idle');
        }}
        showFrontierBefore2012={row.borderPackId === 'belgium_fr'}
        showContractDays={!!pack && usesContractDays(pack)}
        showPartYear={!!pack && usesPartYearFormula(pack)}
      />
      {pack && (
        <>
          <label style={{ display: 'block', marginTop: '0.75rem' }} htmlFor={`profile-${row.userId}-base`}>
            <strong>{d.company.workingDaysBase}</strong>
            <div className="meta">{t(d.company.workingDaysBaseHint, { annual: row.annualWorkingDays ?? pack.defaultAnnualWorkingDays })}</div>
          </label>
          <input
            id={`profile-${row.userId}-base`}
            className="num"
            type="number"
            min={1}
            max={366}
            style={{ marginTop: '0.35rem' }}
            value={base ?? ''}
            onChange={(e) => {
              const v = Math.trunc(Number(e.target.value));
              setBase(v >= 1 && v <= 366 ? v : null);
              setState('idle');
            }}
          />
        </>
      )}
      <p style={{ marginTop: '0.5rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            onSave(row.userId, { ...value, annualWorkingDays: base }).then(
              () => setState('saved'),
              () => setState('error'),
            )
          }
        >
          {d.company.saveProfile}
        </button>{' '}
        {state === 'saved' && <span role="status">{d.company.profileSaved}</span>}
        {state === 'error' && <span role="alert">{d.app.saveError}</span>}
      </p>
    </details>
  );
}


function RetentionForm(props: {
  d: Dict;
  months: number;
  onSave: (months: number) => Promise<void>;
}) {
  const { d, months, onSave } = props;
  const [value, setValue] = useState(String(months));
  const [state, setState] = useState<'idle' | 'saved' | 'error'>('idle');
  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h2>{d.company.retentionTitle}</h2>
      <p className="meta">{d.company.retentionHelp}</p>
      <label>
        {d.company.retentionMonths}
        <input
          type="number"
          min={RETENTION_MONTHS_MIN}
          max={RETENTION_MONTHS_MAX}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setState('idle');
          }}
        />
      </label>{' '}
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => {
          const raw = value.trim();
          const n = Number(raw);
          // F13: surface empty / out-of-range before silent clamp.
          if (
            raw === '' ||
            !Number.isFinite(n) ||
            n < RETENTION_MONTHS_MIN ||
            n > RETENTION_MONTHS_MAX ||
            !Number.isInteger(n)
          ) {
            setState('error');
            return;
          }
          const next = clampRetentionMonths(n);
          if (next !== n) {
            setState('error');
            return;
          }
          // Lowering deletes at the next daily purge, and the purge has no undo.
          if (next < months) {
            const warning = t(d.company.retentionConfirm, { months: next });
            const message = next <= RETENTION_MONTHS_MIN ? `${warning} ${d.company.retentionConfirmShort}` : warning;
            if (!window.confirm(message)) return;
          }
          onSave(next).then(
            () => setState('saved'),
            () => setState('error'),
          );
        }}
      >
        {d.company.retentionSave}
      </button>{' '}
      {state === 'saved' && <span role="status">{d.company.retentionSaved}</span>}
      {state === 'error' && <span role="alert">{d.company.retentionInvalid}</span>}
    </div>
  );
}

/** Presentational: the real dashboard and /demo feed it their own data and links. */
export default function DashboardView(props: {
  d: Dict;
  companyName: string;
  rows: EmployeeDashboardRow[];
  /** Soft-deactivated employees with retained day history (F32). */
  formerRows?: EmployeeDashboardRow[];
  /** What the optional day-level CSV is built from. It has no note field. */
  dayLogs?: Array<{ employeeUserId: string; workDate: string; dayType: DayType; overnightAway?: boolean; dayShare?: 0.5 | 1 }>;
  invites: Invitation[];
  year: number;
  onYearChange?: (year: number) => void;
  isDemo?: boolean;
  /** e.g. /en/company/<id> or /en/demo/company/<id> */
  companyBase: string;
  /** e.g. /en/join or /en/demo/join */
  joinBase: string;
  retentionMonths?: number;
  canEditRetention?: boolean;
  /** HR viewers the signed-in user may remove. The demo passes none. */
  hrViewers?: TeamMember[];
  canRevokeInvite?: (invite: Invitation) => boolean;
  onRefresh: () => void;
  /** Absent under /demo, which then shows no remove or revoke controls. */
  onDeactivateMember?: (userId: string) => Promise<{ billingSynced: boolean }>;
  onRevokeInvite?: (inviteId: string) => Promise<void>;
  onResendInvite?: (invite: Invitation) => Promise<ResendResult>;
  onSaveProfile: (userId: string, profile: EmployeeProfileValues) => Promise<void>;
  onSaveRetention?: (months: number) => Promise<void>;
}) {
  const { d, companyName, rows, formerRows = [], dayLogs, invites, year, onYearChange, isDemo, companyBase, joinBase, retentionMonths, canEditRetention, hrViewers, canRevokeInvite, onRefresh, onDeactivateMember, onRevokeInvite, onResendInvite, onSaveProfile, onSaveRetention } = props;
  const [borderFilter, setBorderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'status' | 'alert'; text: string } | null>(null);

  async function deactivate(member: TeamMember) {
    if (!onDeactivateMember) return;
    if (!window.confirm(t(d.company.deactivateConfirm, { name: member.displayName }))) return;
    setBusy(true);
    setNotice(null);
    try {
      const { billingSynced } = await onDeactivateMember(member.userId);
      const text = billingSynced ? d.company.deactivated : d.company.deactivatedBillingPending;
      setNotice({ tone: billingSynced ? 'status' : 'alert', text: t(text, { name: member.displayName }) });
    } catch {
      setNotice({ tone: 'alert', text: d.company.deactivateFailed });
    } finally {
      setBusy(false);
    }
  }

  const filtered = filterRows(rows, {
    borderPackId: (borderFilter || null) as BorderId | null,
    status: (statusFilter as AggregateStatus) || null,
  });
  const packs = listBorderPacks();

  function exportCsv() {
    // F32: include former employees' retained rows until retention purge.
    const all = [...filtered, ...formerRows];
    download(`borderday-export-${year}.csv`, rowsToCsv(all, year), 'text/csv;charset=utf-8');
  }

  function exportDaysCsv() {
    const all = [...filtered, ...formerRows];
    download(`borderday-days-${year}.csv`, dayRowsToCsv(all, dayLogs ?? [], year), 'text/csv;charset=utf-8');
  }

  function borderLabel(id: string | null): string {
    if (!id) return '—';
    return (d.borders as Record<string, string>)[id] ?? id;
  }

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>
            {d.company.dashboardTitle}
            {isDemo && (
              <span className="badge warn" style={{ marginLeft: '0.5rem' }}>
                {d.company.demoDataBadge}
              </span>
            )}
          </h1>
          <p>{companyName}</p>
          <p className="meta">{d.company.dashboardSubtitle}</p>
          <p className="meta" role="note">{d.company.hrDisclaimer}</p>
        </div>
        <div className="dash-actions">
          {onYearChange && (
            <label className="meta" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>{d.company.dashboardYear}</span>
              <select
                aria-label={d.company.dashboardYear}
                value={year}
                onChange={(e) => onYearChange(Number(e.target.value))}
              >
                {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Link className="btn btn-secondary" to={`${companyBase}/invite`}>
            {d.company.inviteTitle}
          </Link>
          <button type="button" className="btn btn-primary" onClick={exportCsv}>
            {d.company.exportCsv}
          </button>
          {dayLogs && (
            <button type="button" className="btn btn-secondary" onClick={exportDaysCsv}>
              {d.company.exportDaysCsv}
            </button>
          )}
          <p className="meta" role="note" style={{ maxWidth: '16rem', margin: 0 }}>
            {d.company.exportCsvNote} {dayLogs && d.company.exportDaysNote}
          </p>
        </div>
      </div>
      {needsFilingNote(rows) && (
        <p className="meta" role="note">
          {d.company.filingNote}
        </p>
      )}

      <div className="filters">
        <label>
          {d.company.filterBorder}
          <select value={borderFilter} onChange={(e) => setBorderFilter(e.target.value)}>
            <option value="">{d.company.filterAll}</option>
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {(d.borders as Record<string, string>)[p.nameKey]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {d.company.filterStatus}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">{d.company.filterAll}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(d, s)}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-ghost" onClick={onRefresh} aria-label={d.company.refreshAria}>
          ↻
        </button>
      </div>

      {notice && <p role={notice.tone}>{notice.text}</p>}

      <h2>
        {d.company.employees} ({filtered.length})
      </h2>
      {filtered.length === 0 ? (
        <p>{d.company.noEmployees}</p>
      ) : (
        <div className="employee-list">
          {filtered.map((row) => (
            <article className="card employee-card" key={row.userId}>
              <div className="employee-head">
                <div>
                  <strong>
                    {row.isDemo && (
                      <span className="badge warn" style={{ marginRight: '0.35rem' }}>
                        {d.company.demoDataBadge}
                      </span>
                    )}
                    {row.displayName}
                  </strong>
                  <div className="meta">{row.email}</div>
                  <div className="meta">{borderLabel(row.borderPackId)}</div>
                </div>
                <span className={`badge ${row.worstStatus}`}>{statusLabel(d, row.worstStatus)}</span>
              </div>
              <h3 className="meta">{d.company.countersHeading}</h3>
              <CounterTable d={d} counters={row.counters} />
              <EmployeeProfileForm d={d} row={row} onSave={onSaveProfile} />
              <Link className="btn btn-ghost" to={`${companyBase}/employee/${row.userId}`} style={{ marginTop: '0.75rem' }}>
                {d.company.viewHistory}
              </Link>
              {onDeactivateMember && (
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ marginTop: '0.75rem', marginLeft: '0.5rem' }}
                  disabled={busy}
                  onClick={() => void deactivate(row)}
                >
                  {t(d.company.deactivateMember, { name: row.displayName })}
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      {formerRows.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }} data-testid="former-employees">
          <h2>
            {d.company.formerEmployees} ({formerRows.length})
          </h2>
          <p className="meta">{d.company.formerEmployeesHelp}</p>
          <div className="employee-list">
            {formerRows.map((row) => (
              <article className="card employee-card" key={`former-${row.userId}`}>
                <div className="employee-head">
                  <div>
                    <strong>{row.displayName}</strong>
                    <div className="meta">{row.email}</div>
                    <div className="meta">{borderLabel(row.borderPackId)}</div>
                    <div className="meta">{d.company.formerReadOnly}</div>
                  </div>
                  <span className={`badge ${row.worstStatus}`}>{statusLabel(d, row.worstStatus)}</span>
                </div>
                <h3 className="meta">{d.company.countersHeading}</h3>
                <CounterTable d={d} counters={row.counters} />
                <Link className="btn btn-ghost" to={`${companyBase}/employee/${row.userId}`} style={{ marginTop: '0.75rem' }}>
                  {d.company.viewHistory}
                </Link>
              </article>
            ))}
          </div>
        </div>
      )}

      {canEditRetention && onSaveRetention && retentionMonths != null && (
        <RetentionForm d={d} months={retentionMonths} onSave={onSaveRetention} />
      )}

      {onDeactivateMember && hrViewers && hrViewers.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2>{d.company.hrViewersTitle}</h2>
          <ul>
            {hrViewers.map((m) => (
              <li key={m.userId}>
                {m.displayName} · {m.email}{' '}
                <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void deactivate(m)}>
                  {t(d.company.deactivateMember, { name: m.displayName })}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {invites.length > 0 && (
        <PendingInvites
          d={d}
          invites={invites}
          joinPath={(token) => `${joinBase}/?t=${encodeURIComponent(token)}`}
          canManage={canRevokeInvite}
          onResend={onResendInvite}
          onRevoke={onRevokeInvite}
        />
      )}
    </>
  );
}
