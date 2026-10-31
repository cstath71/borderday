import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import JoinForm from '../../components/company/JoinForm';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import type { BorderId } from '../../borders/types';
import { CONSENT_VERSION } from '../../company/types';
import { getDict, t } from '../../i18n';
import { useAuth } from '../../lib/auth';
import * as api from '../../lib/companyApi';

type Peek =
  | { status: 'loading' }
  | { status: 'invalid' }
  | { status: 'open'; invite: api.InvitePeek };

export default function JoinCompany() {
  const lang = useLang();
  const d = getDict(lang);
  const auth = useAuth();
  const { token = '' } = useParams();
  const [peek, setPeek] = useState<Peek>({ status: 'loading' });
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signedIn = !!auth.user;

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    api
      .getInviteByToken(token)
      .then((invite) => {
        if (cancelled) return;
        setPeek(invite && api.isInviteOpen(invite) ? { status: 'open', invite } : { status: 'invalid' });
      })
      .catch(() => {
        if (!cancelled) setPeek({ status: 'invalid' });
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn, token]);

  if (auth.ready && !auth.user) {
    return <Navigate to={`/${lang}/auth/sign-in?next=${encodeURIComponent(`/${lang}/join/${token}`)}`} replace />;
  }

  async function onJoin(values: { displayName: string; borderPackId: BorderId }) {
    setError(null);
    setBusy(true);
    try {
      const companyId = await api.acceptInvite(token, CONSENT_VERSION, lang);
      await api.updateMemberSelf(companyId, { borderPackId: values.borderPackId, annualWorkingDays: null });
      await api.updateMyDisplayName(values.displayName);
      setDone(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (/email not confirmed/.test(message)) setError(d.company.joinEmailUnconfirmed);
      else if (/not found or expired/.test(message)) setError(d.company.inviteInvalid);
      else setError(d.company.loadError);
    } finally {
      setBusy(false);
    }
  }

  let body: React.ReactNode;
  if (!auth.ready || peek.status === 'loading') {
    body = <p role="status">{d.company.loading}</p>;
  } else if (done) {
    body = (
      <div className="card">
        <p>{d.company.joinSuccess}</p>
        <Link className="btn btn-primary" to={`/${lang}/app`}>
          {d.nav.openApp}
        </Link>
      </div>
    );
  } else if (peek.status === 'invalid') {
    body = <p role="alert">{d.company.inviteInvalid}</p>;
  } else if (!api.sameEmail(auth.user?.email, peek.invite.email)) {
    body = (
      <div className="card">
        <p role="alert">
          {t(d.company.joinEmailMismatch, { invited: peek.invite.email, current: auth.user?.email ?? '' })}
        </p>
        <button type="button" className="btn btn-primary" onClick={() => void auth.signOut()}>
          {d.auth.signOut}
        </button>
      </div>
    );
  } else {
    body = (
      <JoinForm
        d={d}
        companyName={peek.invite.companyName}
        email={peek.invite.email}
        role={peek.invite.role}
        error={error}
        busy={busy}
        onSubmit={(values) => void onJoin(values)}
      />
    );
  }

  return (
    <>
      <Seo
        lang={lang}
        title={`${d.company.joinTitle} — BorderDay`}
        description={d.company.joinSubtitle}
        path={`join/${token}`}
        noindex
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <h1>{d.company.joinTitle}</h1>
          <p>{d.company.joinSubtitle}</p>
          {body}
        </div>
      </section>
    </>
  );
}
