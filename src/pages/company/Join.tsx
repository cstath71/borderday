import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import JoinForm from '../../components/company/JoinForm';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import type { BorderId } from '../../borders/types';
import { CONSENT_VERSION } from '../../company/types';
import { getDict, t } from '../../i18n';
import { useAuth } from '../../lib/auth';
import { publicPath } from '../../lib/publicPath';
import * as api from '../../lib/companyApi';

type Peek =
  | { status: 'loading' }
  | { status: 'invalid' }
  | { status: 'open'; invite: api.InvitePeek };

function resolveInviteToken(paramToken: string, search: URLSearchParams): string {
  const fromQuery = search.get('t') || search.get('token') || '';
  if (paramToken) return paramToken;
  if (fromQuery) return fromQuery;
  if (typeof window === 'undefined') return '';
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) return '';
  if (raw.startsWith('t=')) return decodeURIComponent(raw.slice(2));
  if (raw.startsWith('token=')) return decodeURIComponent(raw.slice(6));
  return decodeURIComponent(raw);
}

export default function JoinCompany() {
  const lang = useLang();
  const d = getDict(lang);
  const auth = useAuth();
  const { token: paramToken = '' } = useParams();
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const token = resolveInviteToken(paramToken, searchParams);
  const [peek, setPeek] = useState<Peek>({ status: 'loading' });

  // F17: canonical join URL is /join/?t=… (path token still works once, then is replaced).
  useEffect(() => {
    if (!paramToken) return;
    const t = paramToken;
    nav(`/${lang}/join/?t=${encodeURIComponent(t)}`, { replace: true });
  }, [paramToken, lang, nav]);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signedIn = !!auth.user;

  // The lookup works signed out, so a visitor sees who is inviting them before being asked for an account.
  useEffect(() => {
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
  }, [token]);

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
    // F18: keep page shell; skeleton instead of a blank Loading flash.
    body = <LoadingSkeleton label={d.company.loading} />;
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
  } else if (!signedIn) {
    const next = encodeURIComponent(`/${lang}/join/?t=${encodeURIComponent(token)}`);
    body = (
      <div className="card">
        <p>{t(d.company.joinPreviewIntro, { company: peek.invite.companyName })}</p>
        <p className="meta">{t(d.company.joinPreviewFor, { email: peek.invite.email })}</p>
        <h2>{d.company.noticeTitle}</h2>
        <p>{d.company.noticeBody}</p>
        <p>
          <Link to={publicPath(lang, 'privacy')}>{d.company.noticePrivacyLink}</Link>
        </p>
        <div className="toolbar">
          <Link
            className="btn btn-primary"
            to={`/${lang}/auth/sign-up?next=${next}&inviteEmail=${encodeURIComponent(peek.invite.email)}&inviteCompany=${encodeURIComponent(peek.invite.companyName)}`}
          >
            {d.auth.signUp}
          </Link>
          <Link className="btn btn-secondary" to={`/${lang}/auth/sign-in?next=${next}`}>
            {d.auth.signIn}
          </Link>
        </div>
      </div>
    );
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
        initialDisplayName={
          (auth.user?.user_metadata?.display_name as string | undefined)?.trim() ||
          (auth.user?.email ? auth.user.email.split('@')[0] : '') ||
          ''
        }
        error={error}
        busy={busy}
        privacyHref={publicPath(lang, 'privacy')}
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
        path="join"
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
