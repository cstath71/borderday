import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import { getDict, t } from '../../i18n';
import { listBorderPacks } from '../../borders/packs';
import type { AggregateStatus } from '../../company/dashboardMath';
import { filterRows, rowsToCsv } from '../../company/dashboardMath';
import { buildDashboardRows } from '../../company/buildRows';
import {
  getBackendMode,
  getCompany,
  listInvitations,
  myMembership,
  seedDemoCompany,
} from '../../lib/supabaseMock';

const STATUSES: AggregateStatus[] = ['ok', 'warn', 'critical', 'over', 'disabled'];

export default function CompanyDashboard() {
  const lang = useLang();
  const d = getDict(lang);
  const { companyId: paramId } = useParams();
  const year = new Date().getFullYear();
  const [borderFilter, setBorderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tick, setTick] = useState(0);

  let companyId = paramId ?? '';
  if (!companyId) {
    try {
      const seeded = seedDemoCompany();
      companyId = seeded.companyId;
    } catch {
      /* ignore */
    }
  }

  const company = (() => {
    try {
      return companyId ? getCompany(companyId) : null;
    } catch {
      return null;
    }
  })();

  const membership = (() => {
    try {
      return companyId ? myMembership(companyId) : null;
    } catch {
      return null;
    }
  })();

  const { rows, isDemo } = useMemo(() => {
    void tick;
    if (!companyId || !membership || (membership.role !== 'owner' && membership.role !== 'hr_viewer')) {
      return { rows: [], isDemo: false };
    }
    try {
      return buildDashboardRows(companyId, year);
    } catch {
      return { rows: [], isDemo: false };
    }
  }, [companyId, membership, year, tick]);

  const filtered = filterRows(rows, {
    borderPackId: (borderFilter || null) as import('../../borders/types').BorderId | null,
    status: (statusFilter as AggregateStatus) || null,
  });

  const packs = listBorderPacks();
  const invites = (() => {
    try {
      return companyId && membership && (membership.role === 'owner' || membership.role === 'hr_viewer')
        ? listInvitations(companyId).filter((i) => i.status === 'pending')
        : [];
    } catch {
      return [];
    }
  })();

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

  function ensureDemo() {
    const { companyId: id } = seedDemoCompany();
    window.location.assign(`/${lang}/company/${id}/dashboard`);
  }

  if (!company || !membership || (membership.role !== 'owner' && membership.role !== 'hr_viewer')) {
    return (
      <section className="section">
        <div className="container">
          <h1>{d.company.dashboardTitle}</h1>
          <p>{d.company.backendMode}</p>
          <button type="button" className="btn btn-primary" onClick={ensureDemo}>
            {d.company.loadDemo}
          </button>
          <Link className="btn btn-ghost" to={`/${lang}/company/signup`} style={{ marginLeft: '0.5rem' }}>
            {d.nav.companySignup}
          </Link>
        </div>
      </section>
    );
  }

  function statusLabel(s: string): string {
    const key = `status_${s}`;
    return (d.counters as Record<string, string>)[key] ?? s;
  }

  function borderLabel(id: string | null): string {
    if (!id) return '—';
    return (d.borders as Record<string, string>)[id] ?? id;
  }

  return (
    <>
      <Seo
        lang={lang}
        title={`${d.company.dashboardTitle} — BorderDay`}
        description={d.company.dashboardSubtitle}
        path={`company/${companyId}/dashboard`}
      />
      <section className="section">
        <div className="container">
          {(isDemo || company.isDemo) && (
            <div className="demo-banner" role="status">
              <strong>{d.company.demoDataBadge}</strong> — {d.company.demoBanner}
            </div>
          )}
          <div className="dash-head">
            <div>
              <h1>
                {d.company.dashboardTitle}
                {(isDemo || company.isDemo) && (
                  <span className="badge warn" style={{ marginLeft: '0.5rem' }}>
                    {d.company.demoDataBadge}
                  </span>
                )}
              </h1>
              <p>{company.name}</p>
              <p className="meta">{d.company.dashboardSubtitle}</p>
              <p className="meta backend-mode">
                {d.company.backendMode} ({getBackendMode()})
              </p>
            </div>
            <div className="dash-actions">
              <Link className="btn btn-secondary" to={`/${lang}/company/${companyId}/invite`}>
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
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="btn btn-ghost" onClick={() => setTick((x) => x + 1)}>
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
                    <span className={`badge ${row.worstStatus}`}>{statusLabel(row.worstStatus)}</span>
                  </div>
                  <h3 className="meta">{d.company.countersHeading}</h3>
                  {row.counters.length === 0 ? (
                    <p className="meta">{d.company.emptyCounters}</p>
                  ) : (
                    <table className="counter-table">
                      <thead>
                        <tr>
                          <th>{d.company.countersHeading}</th>
                          <th>{d.company.kindTax}/{d.company.kindSs}</th>
                          <th>{d.company.usedAllowed}</th>
                          <th>{d.company.status}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {row.counters.map((c) => (
                          <tr key={c.counterId}>
                            <td>{(d.counters as Record<string, string>)[c.labelKey] ?? c.labelKey}</td>
                            <td>{c.kind === 'tax' ? d.company.kindTax : d.company.kindSs}</td>
                            <td>
                              {c.enabled
                                ? t(d.counters.usedOfDays, {
                                    used: c.usedDays ?? 0,
                                    allowed: c.allowedDays ?? 0,
                                  })
                                : '—'}
                            </td>
                            <td>
                              <span className={`badge ${c.status}`}>{statusLabel(c.status)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <Link
                    className="btn btn-ghost"
                    to={`/${lang}/company/${companyId}/employee/${row.userId}`}
                    style={{ marginTop: '0.75rem' }}
                  >
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
                    {i.email} · {i.role} ·{' '}
                    <Link to={`/${lang}/join/${i.token}`}>{d.company.inviteLinkLabel}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
