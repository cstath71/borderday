import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import LegalLinks from '../../components/LegalLinks';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import { getDict } from '../../i18n';
import { useAuth } from '../../lib/auth';
import { rememberNext, safeNext } from '../../lib/authNext';

export default function SignUp() {
  const lang = useLang();
  const d = getDict(lang);
  const nav = useNavigate();
  const auth = useAuth();
  const [params] = useSearchParams();
  const nextParam = params.get('next');
  const next = safeNext(nextParam, `/${lang}/company/signup`);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // With an invite waiting, stay on the "check your email" message until a session exists.
  useEffect(() => {
    if (submitted && nextParam && auth.user) nav(next);
  }, [submitted, nextParam, auth.user, next, nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    rememberNext(next);
    const { error } = await auth.signUpEmail(email, password, displayName);
    setBusy(false);
    if (error) setMsg(error);
    else {
      setMsg(d.auth.checkEmail);
      setSubmitted(true);
      if (!nextParam) setTimeout(() => nav(next), 800);
    }
  }
  async function onGoogle() {
    setBusy(true);
    rememberNext(next);
    const { error } = await auth.signInGoogle();
    if (error) { setBusy(false); setMsg(error.includes('provider') ? d.auth.googleNotReady : error); }
  }

  return (
    <>
      <Seo lang={lang} title={`${d.auth.signUpTitle} — BorderDay`} description={d.auth.signUpSubtitle} path="auth/sign-up" />
      <section className="section">
        <div className="container" style={{ maxWidth: 420 }}>
          <h1>{d.auth.signUpTitle}</h1>
          <p>{d.auth.signUpSubtitle}</p>
          <LegalLinks d={d} lang={lang} intro={d.auth.signUpTerms} />
          <button type="button" className="btn btn-secondary" style={{ width: '100%', marginBottom: '1rem' }} onClick={onGoogle} disabled={busy || !auth.configured}>{d.auth.continueGoogle}</button>
          <form className="card stack-form" onSubmit={onSubmit}>
            <label>{d.auth.displayName}<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required /></label>
            <label>{d.auth.email}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
            <label>{d.auth.password}<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" minLength={8} /></label>
            <button className="btn btn-primary" type="submit" disabled={busy || !auth.configured}>{d.auth.createAccount}</button>
          </form>
          {msg && <p className="meta" role={submitted ? 'status' : 'alert'}>{msg}</p>}
          <p style={{ marginTop: '1rem' }}>{d.auth.hasAccount} <Link to={`/${lang}/auth/sign-in${nextParam ? `?next=${encodeURIComponent(next)}` : ''}`}>{d.auth.signIn}</Link></p>
        </div>
      </section>
    </>
  );
}
