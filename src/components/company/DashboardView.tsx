import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listBorderPacks } from '../../borders/packs';
import type { BorderId } from '../../borders/types';
import type { AggregateStatus, EmployeeDashboardRow } from '../../company/dashboardMath';
import { filterRows, rowsToCsv } from '../../company/dashboardMath';
import type { Invitation } from '../../company/types';
import type { Dict } from '../../i18n';
import CounterTable, { statusLabel } from './CounterTable';

const STATUSES: AggregateStatus[] = ['ok', 'warn', 'critical', 'over', 'disabled'];

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
  onRefresh: () => void;
}) {
  const { d, companyName, rows, invites, year, isDemo, companyBase, joinBase, onRefresh } = props;
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
    a.download = `borderday-audit-${year}.csv`;
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
        </div>
        <div className="dash-actions">
          <Link className="btn btn-secondary" to={`${companyBase}/invite`}>
            {d.company.inviteTitle}
          </Link>
          <button type="button" className="btn btn-primary" onClick={exportCsv}>
            {d.company.exportCsv}
          </button>
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
              <Link className="btn btn-ghost" to={`${companyBase}/employee/${row.userId}`} style={{ marginTop: '0.75rem' }}>
                {d.company.viewHistory}
              </Link>
            </article>
          ))}
        </div>
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
