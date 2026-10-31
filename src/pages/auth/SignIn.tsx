import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import { getDict } from '../../i18n';
import { useAuth } from '../../lib/auth';

export default function SignIn() {
  const lang = useLang();
  const d = getDict(lang);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || `/${lang}/company/signup`;
  const auth = useAuth();
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const { error } = await auth.signInEmail(email, password);
    setBusy(false);
    if (error) setMsg(error); else nav(next);
  }
  async function onMagic(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const { error } = await auth.signInMagicLink(email);
    setBusy(false);
    if (error) setMsg(error); else setMsg(d.auth.magicSent);
  }
  async function onGoogle() {
    setBusy(true); setMsg(null);
    const { error } = await auth.signInGoogle();
    if (error) { setBusy(false); setMsg(error.includes('provider') ? d.auth.googleNotReady : error); }
  }

  return (
    <>
      <Seo lang={lang} title={`${d.auth.signInTitle} — BorderDay`} description={d.auth.signInSubtitle} path="auth/sign-in" />
      <section className="section">
        <div className="container" style={{ maxWidth: 420 }}>
          <h1>{d.auth.signInTitle}</h1>
          <p>{d.auth.signInSubtitle}</p>
          {!auth.configured && <p className="meta">{d.auth.notConfigured}</p>}
          <button type="button" className="btn btn-secondary" style={{ width: '100%', marginBottom: '1rem' }} onClick={onGoogle} disabled={busy || !auth.configured}>{d.auth.continueGoogle}</button>
          <p className="meta" style={{ marginTop: '-0.5rem' }}>{d.auth.googleHint}</p>
          <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
            <button type="button" className={`btn ${mode === 'password' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('password')}>{d.auth.password}</button>
            <button type="button" className={`btn ${mode === 'magic' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('magic')}>{d.auth.magicLink}</button>
          </div>
          {mode === 'password' ? (
            <form className="card stack-form" onSubmit={onPassword}>
              <label>{d.auth.email}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
              <label>{d.auth.password}<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" minLength={8} /></label>
              <button className="btn btn-primary" type="submit" disabled={busy || !auth.configured}>{d.auth.signIn}</button>
            </form>
          ) : (
            <form className="card stack-form" onSubmit={onMagic}>
              <label>{d.auth.email}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
              <button className="btn btn-primary" type="submit" disabled={busy || !auth.configured}>{d.auth.sendMagic}</button>
            </form>
          )}
          {msg && <p className="meta" role="status">{msg}</p>}
          <p style={{ marginTop: '1rem' }}>{d.auth.noAccount} <Link to={`/${lang}/auth/sign-up`}>{d.auth.signUp}</Link></p>
        </div>
      </section>
    </>
  );
}
