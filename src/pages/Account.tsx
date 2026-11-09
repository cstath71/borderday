import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import CancelPanel from '../components/CancelPanel';
import { mailtoHref } from '../components/RequestForm';
import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict, t, type Dict } from '../i18n';
import { accountExportCsv, collectAccountExport } from '../lib/accountExport';
import { useAuth } from '../lib/auth';
import { publicPath } from '../lib/publicPath';
import { supabase } from '../lib/supabase';
import { deleteMyDayLogs, isHrRole, listFormerCompanies, listMyCompanies, listMyDaysIn, type FormerCompany, type OwnDay } from '../lib/companyApi';
import { download } from '../lib/download';
import { exportCsv, exportJson } from '../lib/storage';

const PRIVACY_MAILBOX = 'privacy@borderday.com';

/** E24: the join notice promises a day log can be exported or deleted, and leaving a company does not end that. */
function FormerCompanies({ d, userId }: { d: Dict; userId: string }) {
  const a = d.account;
  const [companies, setCompanies] = useState<FormerCompany[]>([]);
  const [days, setDays] = useState<Record<string, OwnDay[]>>({});
  const [notice, setNotice] = useState<{ tone: 'status' | 'alert'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await listFormerCompanies();
      const loaded = await Promise.all(list.map(async (c) => [c.companyId, await listMyDaysIn(c.companyId)] as const));
      if (cancelled) return;
      setCompanies(list);
      setDays(Object.fromEntries(loaded));
    })().catch(() => {
      if (!cancelled) setNotice({ tone: 'alert', text: a.formerError });
    });
    return () => {
      cancelled = true;
    };
  }, [userId, a.formerError]);

  async function remove(c: FormerCompany) {
    if (!window.confirm(t(a.formerDeleteConfirm, { count: c.dayCount, company: c.company }))) return;
    setBusy(true);
    setNotice(null);
    try {
      await deleteMyDayLogs(c.companyId);
      setCompanies((list) => list.filter((x) => x.companyId !== c.companyId));
      setNotice({ tone: 'status', text: t(a.formerDeleted, { company: c.company }) });
    } catch {
      setNotice({ tone: 'alert', text: a.formerError });
    } finally {
      setBusy(false);
    }
  }

  if (companies.length === 0 && !notice) return null;
  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <h2>{a.formerTitle}</h2>
      {companies.length > 0 && <p>{a.formerBody}</p>}
      {companies.map((c) => (
        <div key={c.companyId} style={{ marginBottom: '0.75rem' }}>
          <details>
            <summary>{t(a.formerSummary, { company: c.company, count: c.dayCount, first: c.firstDate, last: c.lastDate })}</summary>
            <table className="counter-table">
              <thead>
                <tr>
                  <th>{d.company.colDate}</th>
                  <th>{d.company.colDayType}</th>
                  <th>{d.dayTypes.halfDayShort}</th>
                  <th>{d.dayTypes.overnightAwayShort}</th>
                  <th>{a.noteColumn}</th>
                </tr>
              </thead>
              <tbody>
                {(days[c.companyId] ?? []).map((day) => (
                  <tr key={day.date}>
                    <td>{day.date}</td>
                    <td>{(d.dayTypes as Record<string, string>)[day.type] ?? day.type}</td>
                    <td>{day.dayShare === 0.5 ? '½' : ''}</td>
                    <td>{day.overnightAway ? '✓' : ''}</td>
                    <td>{day.note ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
          <button type="button" className="btn btn-danger" style={{ marginTop: '0.5rem' }} disabled={busy} onClick={() => void remove(c)}>
            {t(a.formerDelete, { company: c.company })}
          </button>
        </div>
      ))}
      {notice && <p role={notice.tone}>{notice.text}</p>}
    </div>
  );
}

/** Data-subject controls. Deletion is an email request: the client cannot call Auth Admin (docs/DATA_REQUESTS.md). */
export default function Account() {
  const lang = useLang();
  const d = getDict(lang);
  const a = d.account;
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [exportFailed, setExportFailed] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [hrCompanies, setHrCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const userId = auth.user?.id;

  // Sign-in lands here by default, so HR needs a way on to their dashboard.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    listMyCompanies()
      .then((list) => {
        if (!cancelled) setHrCompanies(list.filter((c) => isHrRole(c.role)));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // F31: when the tab becomes visible again, refresh session so signed-in-as stays current.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      void supabase?.auth.getSession();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  if (auth.signingOut) return <p role="status">{d.company.loading}</p>;
  if (auth.ready && !auth.user) {
    return <Navigate to={`/${lang}/auth/sign-in?next=${encodeURIComponent(`/${lang}/account`)}`} replace />;
  }
  if (!auth.user) return <p role="status">{d.company.loading}</p>;
  const user = auth.user;

  async function exportServer(format: 'json' | 'csv') {
    setBusy(true);
    setExportFailed(false);
    try {
      // F31: re-read session so a stale tab cannot export under the wrong signed-in user.
      const { data: sessionData } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
      const sessionUser = sessionData.session?.user;
      if (!sessionUser || sessionUser.id !== user.id) {
        setExportFailed(true);
        return;
      }
      const data = await collectAccountExport(sessionUser);
      if (format === 'json') download('borderday-account.json', JSON.stringify(data, null, 2), 'application/json');
      else download('borderday-account.csv', accountExportCsv(data), 'text/csv;charset=utf-8');
    } catch {
      setExportFailed(true);
    } finally {
      setBusy(false);
    }
  }

  const deleteBody = t(a.deleteMailBody, {
    email: user.email ?? '',
    id: user.id,
    today: new Date().toISOString().slice(0, 10),
  });

  return (
    <>
      <Seo lang={lang} title={`${a.title} — BorderDay`} description={a.exportBody} path="account" noindex />
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <h1>{a.title}</h1>
          <p className="meta">{t(a.signedInAs, { email: user.email ?? '' })}</p>
          <p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                void auth.signOutAndGo(lang);
              }}
            >
              {d.auth.signOut}
            </button>
          </p>
          {hrCompanies.map((c) => (
            <p key={c.id}>
              <Link className="btn btn-secondary" to={`/${lang}/company/${c.id}/dashboard`}>
                {d.nav.hrDashboard}: {c.name}
              </Link>
            </p>
          ))}

          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2>{a.exportTitle}</h2>
            <p>{a.exportBody}</p>
            <div className="toolbar">
              <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void exportServer('json')}>
                {d.app.exportJson}
              </button>
              <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void exportServer('csv')}>
                {d.app.exportCsv}
              </button>
            </div>
            {exportFailed && (
              <p role="alert" style={{ color: 'var(--danger)' }}>
                {a.exportError}
              </p>
            )}
          </div>

          <FormerCompanies d={d} userId={user.id} />

          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2>{a.deviceTitle}</h2>
            <p>{a.deviceBody}</p>
            <div className="toolbar">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={async () => download('borderday-device.json', await exportJson(), 'application/json')}
              >
                {d.app.exportJson}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={async () => download('borderday-device.csv', await exportCsv(), 'text/csv')}
              >
                {d.app.exportCsv}
              </button>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2 id="cancel">{d.nav.cancel}</h2>
            <CancelPanel lang={lang} />
            <p>
              <Link to={publicPath(lang, 'cancel')}>{d.cancel.linkTitle}</Link>
            </p>
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2>{a.deleteTitle}</h2>
            <p>{a.deleteBody}</p>
            <label className="consent-check">
              <input type="checkbox" checked={deleteConfirmed} onChange={(e) => setDeleteConfirmed(e.target.checked)} />{' '}
              {a.deleteConfirm}
            </label>
            {deleteConfirmed && (
              <>
                <p style={{ marginTop: '0.75rem' }}>
                  <a className="btn btn-danger" href={mailtoHref(PRIVACY_MAILBOX, a.deleteMailSubject, deleteBody)}>
                    {a.deleteSend}
                  </a>
                </p>
                <p className="meta">{t(a.deleteHint, { to: PRIVACY_MAILBOX })}</p>
              </>
            )}
          </div>

          <p>
            <Link to={publicPath(lang, 'privacy')}>{d.nav.privacy}</Link>
          </p>
        </div>
      </section>
    </>
  );
}
