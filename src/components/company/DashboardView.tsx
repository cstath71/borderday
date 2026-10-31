import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listBorderPacks } from '../../borders/packs';
import type { BorderId } from '../../borders/types';
import type { AggregateStatus, EmployeeDashboardRow } from '../../company/dashboardMath';
import { filterRows, rowsToCsv } from '../../company/dashboardMath';
import type { Invitation } from '../../company/types';
import type { Dict } from '../../i18n';
import ProfileFields, { type ProfileValues } from '../ProfileFields';
import CounterTable, { statusLabel } from './CounterTable';

const STATUSES: AggregateStatus[] = ['ok', 'warn', 'critical', 'at_limit', 'over', 'disabled'];

/** HR records what an employee's limits depend on. Status shows only after a real save. */
function EmployeeProfileForm(props: {
  d: Dict;
  row: EmployeeDashboardRow;
  onSave: (userId: string, profile: ProfileValues) => Promise<void>;
}) {
  const { d, row, onSave } = props;
  const [value, setValue] = useState<ProfileValues>({
    employmentPercent: row.profile.employmentPercent ?? null,
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
      />
      <p style={{ marginTop: '0.5rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            onSave(row.userId, value).then(
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
          min={1}
          max={120}
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
          const n = Number(value);
          if (!Number.isFinite(n)) {
            setState('error');
            return;
          }
          onSave(n).then(
            () => setState('saved'),
            () => setState('error'),
          );
        }}
      >
        {d.company.retentionSave}
      </button>{' '}
      {state === 'saved' && <span role="status">{d.company.retentionSaved}</span>}
      {state === 'error' && <span role="alert">{d.app.saveError}</span>}
    </div>
  );
}

/** Presentational: the real dashboard and /demo feed it their own data and links. */
export default function DashboardView(props: {
  d: Dict;
  companyName: string;
  rows: EmployeeDashboardRow[];
  invites: Invitation[];
  year: number;
  isDemo?: boolean;
  /** e.g. /en/company/<id> or /en/demo/company/<id> */
  companyBase: string;
  /** e.g. /en/join or /en/demo/join */
  joinBase: string;
  retentionMonths?: number;
  canEditRetention?: boolean;
  onRefresh: () => void;
  onSaveProfile: (userId: string, profile: ProfileValues) => Promise<void>;
  onSaveRetention?: (months: number) => Promise<void>;
}) {
  const { d, companyName, rows, invites, year, isDemo, companyBase, joinBase, retentionMonths, canEditRetention, onRefresh, onSaveProfile, onSaveRetention } = props;
  const [borderFilter, setBorderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = filterRows(rows, {
    borderPackId: (borderFilter || null) as BorderId | null,
    status: (statusFilter as AggregateStatus) || null,
  });
  const packs = listBorderPacks();

  function exportCsv() {
    const csv = rowsToCsv(filtered, year);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `borderday-export-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          <Link className="btn btn-secondary" to={`${companyBase}/invite`}>
            {d.company.inviteTitle}
          </Link>
          <button type="button" className="btn btn-primary" onClick={exportCsv}>
            {d.company.exportCsv}
          </button>
          <p className="meta" role="note" style={{ maxWidth: '16rem', margin: 0 }}>
            {d.company.exportCsvNote}
          </p>
        </div>
      </div>

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
        <button type="button" className="btn btn-ghost" onClick={onRefresh}>
          ↻
        </button>
      </div>

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
            </article>
          ))}
        </div>
      )}

      {canEditRetention && onSaveRetention && retentionMonths != null && (
        <RetentionForm d={d} months={retentionMonths} onSave={onSaveRetention} />
      )}

      {invites.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2>{d.company.pendingInvites}</h2>
          <ul>
            {invites.map((i) => (
              <li key={i.id}>
                {i.email} · {i.role} · <Link to={`${joinBase}/${i.token}`}>{d.company.inviteLinkLabel}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
