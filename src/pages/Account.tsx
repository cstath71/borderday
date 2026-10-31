import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import CancelPanel from '../components/CancelPanel';
import { mailtoHref } from '../components/RequestMailForm';
import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict, t } from '../i18n';
import { accountExportCsv, collectAccountExport } from '../lib/accountExport';
import { useAuth } from '../lib/auth';
import { download } from '../lib/download';
import { exportCsv, exportJson } from '../lib/storage';

const PRIVACY_MAILBOX = 'privacy@borderday.com';

/** Data-subject controls. Deletion is an email request: the client cannot call Auth Admin (docs/DATA_REQUESTS.md). */
export default function Account() {
  const lang = useLang();
  const d = getDict(lang);
  const a = d.account;
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [exportFailed, setExportFailed] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  if (auth.ready && !auth.user) {
    return <Navigate to={`/${lang}/auth/sign-in?next=${encodeURIComponent(`/${lang}/account`)}`} replace />;
  }
  if (!auth.user) return <p role="status">{d.company.loading}</p>;
  const user = auth.user;

  async function exportServer(format: 'json' | 'csv') {
    setBusy(true);
    setExportFailed(false);
    try {
      const data = await collectAccountExport(user);
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
              <Link to={`/${lang}/cancel`}>{d.cancel.linkTitle}</Link>
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
            <Link to={`/${lang}/privacy`}>{d.nav.privacy}</Link>
          </p>
        </div>
      </section>
    </>
  );
}
