import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import { getDict } from '../../i18n';
import { listBorderPacks } from '../../borders/packs';
import type { BorderId } from '../../borders/types';
import {
  acceptInvitation,
  peekInvitation,
  recordConsent,
  signIn,
  updateMemberSelf,
} from '../../lib/supabaseMock';

export default function JoinCompany() {
  const lang = useLang();
  const d = getDict(lang);
  const { token = '' } = useParams();
  const peek = peekInvitation(token);
  const packs = listBorderPacks();

  const [displayName, setDisplayName] = useState('');
  const [border, setBorder] = useState<BorderId | ''>('');
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!peek) {
      setError('invalid invite');
      return;
    }
    if (!consent) {
      setError(d.company.consentRequired);
      return;
    }
    try {
      signIn(peek.email, displayName || peek.email.split('@')[0]);
      acceptInvitation(token, {
        displayName: displayName || undefined,
        borderPackId: border || undefined,
      });
      recordConsent(peek.companyId, lang);
      if (border) {
        updateMemberSelf(peek.companyId, { borderPackId: border });
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'error');
    }
  }

  return (
    <>
      <Seo
        lang={lang}
        title={`${d.company.joinTitle} — BorderDay`}
        description={d.company.joinSubtitle}
        path={`join/${token}`}
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <h1>{d.company.joinTitle}</h1>
          <p>{d.company.joinSubtitle}</p>
          {!peek ? (
            <p>Invite not found or expired.</p>
          ) : done ? (
            <div className="card">
              <p>{d.company.joinSuccess}</p>
              <Link className="btn btn-primary" to={`/${lang}/app`}>
                {d.nav.openApp}
              </Link>
            </div>
          ) : (
            <form className="card stack-form" onSubmit={onJoin}>
              <p>
                <strong>{peek.companyName}</strong> → {peek.email} ({peek.role})
              </p>
              <label>
                {d.company.yourName}
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
              </label>
              <label>
                {d.company.pickBorder}
                <select
                  value={border}
                  onChange={(e) => setBorder(e.target.value as BorderId | '')}
                  required
                >
                  <option value="">—</option>
                  {packs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {(d.borders as Record<string, string>)[p.nameKey]}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="consent-box">
                <legend>{d.company.consentTitle}</legend>
                <p>{d.company.consentBody}</p>
                <label className="consent-check">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  {d.company.consentAccept}
                </label>
              </fieldset>
              <button className="btn btn-primary" type="submit">
                {d.company.joinButton}
              </button>
              {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
            </form>
          )}
        </div>
      </section>
    </>
  );
}
