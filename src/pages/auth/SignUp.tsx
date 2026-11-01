import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import LegalLinks from '../../components/LegalLinks';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import { getDict, t } from '../../i18n';
import { useAuth } from '../../lib/auth';
import { defaultAuthDestination, rememberNext, safeNext } from '../../lib/authNext';

const MIN_PASSWORD = 8;

export default function SignUp() {
  const lang = useLang();
  const d = getDict(lang);
  const nav = useNavigate();
  const auth = useAuth();
  const [params] = useSearchParams();
  const nextParam = params.get('next');
  const next = safeNext(nextParam, defaultAuthDestination(lang));
  const inviteEmail = (params.get('inviteEmail') || '').trim();
  const inviteCompany = (params.get('inviteCompany') || '').trim();
  const isInvite = !!inviteEmail;
  const [email, setEmail] = useState(inviteEmail);
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  useEffect(() => {
    if (submitted && auth.user) nav(next);
  }, [submitted, auth.user, next, nav]);

  const checkEmailMsg = useMemo(() => {
    if (!submittedEmail) return d.auth.checkEmail;
    return t(d.auth.checkEmailNamed, { email: submittedEmail });
  }, [submittedEmail, d.auth.checkEmail, d.auth.checkEmailNamed]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitted) return;
    const trimmed = email.trim();
    if (password.length < MIN_PASSWORD) {
      setMsg(t(d.auth.passwordTooShort, { min: MIN_PASSWORD }));
      return;
    }
    setBusy(true);
    setMsg(null);
    rememberNext(next);
    const { error } = await auth.signUpEmail(trimmed, password, displayName, { lang, next });
    setBusy(false);
    if (error) setMsg(error);
    else {
      setSubmittedEmail(trimmed);
      setMsg(null);
      setSubmitted(true);
    }
  }

  async function onGoogle() {
    if (submitted) return;
    setBusy(true);
    rememberNext(next);
    const { error } = await auth.signInGoogle({ lang, next });
    if (error) {
      setBusy(false);
      setMsg(error.includes('provider') ? d.auth.googleNotReady : error);
    }
  }

  async function onResend() {
    if (!submittedEmail) return;
    setBusy(true);
    setMsg(null);
    const { error } = await auth.signUpEmail(submittedEmail, password || 'ResendPlaceholder9!', displayName, { lang, next });
    setBusy(false);
    // Supabase re-sends confirmation for an existing unconfirmed user on signUp; ignore "already registered" noise when possible.
    if (error && !/already|registered|exists/i.test(error)) setMsg(error);
    else setMsg(t(d.auth.checkEmailNamed, { email: submittedEmail }));
  }

  return (
    <>
      <Seo lang={lang} title={`${d.auth.signUpTitle} — BorderDay`} description={d.auth.signUpSubtitle} path="auth/sign-up" />
      <section className="section">
        <div className="container" style={{ maxWidth: 420 }}>
          <h1>{isInvite ? d.auth.signUpInviteTitle : d.auth.signUpTitle}</h1>
          {isInvite ? (
            <p>{t(d.auth.signUpInviteSubtitle, { company: inviteCompany || 'BorderDay', email: inviteEmail })}</p>
          ) : (
            <p>{d.auth.signUpSubtitle}</p>
          )}
          <LegalLinks d={d} lang={lang} intro={d.auth.signUpTerms} />
          {submitted ? (
            <div className="card stack-form" role="status">
              <p>{checkEmailMsg}</p>
              <p className="meta">{d.auth.checkEmailHint}</p>
              <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void onResend()}>
                {busy ? d.auth.creating : d.auth.resendConfirmation}
              </button>
              {msg && <p className="meta">{msg}</p>}
            </div>
          ) : (
            <>
              {!isInvite && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', marginBottom: '1rem' }}
                  onClick={() => void onGoogle()}
                  disabled={busy || !auth.configured}
                >
                  {d.auth.continueGoogle}
                </button>
              )}
              <form className="card stack-form" onSubmit={onSubmit}>
                <label>
                  {d.auth.displayName}
                  <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required disabled={busy} />
                </label>
                <label>
                  {d.auth.email}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    readOnly={isInvite}
                    disabled={busy || isInvite}
                  />
                </label>
                <label>
                  {d.auth.password}
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={MIN_PASSWORD}
                    disabled={busy}
                  />
                </label>
                <button className="btn btn-primary" type="submit" disabled={busy || !auth.configured} aria-busy={busy}>
                  {busy ? d.auth.creating : d.auth.createAccount}
                </button>
              </form>
              {msg && (
                <p className="meta" role="alert">
                  {msg}
                </p>
              )}
            </>
          )}
          <p style={{ marginTop: '1rem' }}>
            {d.auth.hasAccount}{' '}
            <Link to={`/${lang}/auth/sign-in${nextParam ? `?next=${encodeURIComponent(next)}` : ''}`}>{d.auth.signIn}</Link>
          </p>
        </div>
      </section>
    </>
  );
}
