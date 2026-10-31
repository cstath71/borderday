import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import { getDict } from '../../i18n';
import { useAuth } from '../../lib/auth';
import * as api from '../../lib/companyApi';
import { seedDemoCompany, getBackendMode as mockMode } from '../../lib/supabaseMock';

export default function CompanySignup() {
  const lang = useLang();
  const d = getDict(lang);
  const nav = useNavigate();
  const auth = useAuth();
  const [name, setName] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!auth.user) return;
    api.listMyCompanies().then((list) => setCompanies(list)).catch(() => setCompanies([]));
  }, [auth.user]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.user) { nav(`/${lang}/auth/sign-in?next=/${lang}/company/signup`); return; }
    setBusy(true); setMsg(null);
    try {
      const { companyId: id } = await api.createCompany(name);
      setCompanyId(id);
      setMsg(d.company.created);
      setCompanies(await api.listMyCompanies());
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Error');
    } finally { setBusy(false); }
  }

  function onLoadDemo() {
    const { companyId: id } = seedDemoCompany();
    setCompanyId(id);
    setMsg(d.company.demoBanner);
    nav(`/${lang}/company/${id}/dashboard`);
  }

  const backendLabel = auth.configured ? api.getBackendMode() : mockMode();

  return (
    <>
      <Seo lang={lang} title={`${d.company.signupTitle} — BorderDay`} description={d.company.signupSubtitle} path="company/signup" />
      <section className="section">
        <div className="container" style={{ maxWidth: 560 }}>
          <h1>{d.company.signupTitle}</h1>
          <p>{d.company.signupSubtitle}</p>
          <p className="meta backend-mode">{d.company.backendMode} {backendLabel}{auth.user ? ` · ${auth.user.email}` : ''}</p>
          {!auth.user && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <Link className="btn btn-primary" to={`/${lang}/auth/sign-up`}>{d.auth.signUp}</Link>
              <Link className="btn btn-secondary" to={`/${lang}/auth/sign-in`}>{d.auth.signIn}</Link>
            </div>
          )}
          {auth.user && (
            <button type="button" className="btn btn-secondary" style={{ marginBottom: '1rem' }} onClick={() => auth.signOut()}>{d.auth.signOut}</button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onLoadDemo} style={{ marginBottom: '1rem' }}>{d.company.loadDemo}</button>
          <form className="card stack-form" onSubmit={onCreate}>
            <label>{d.company.companyName}<input value={name} onChange={(e) => setName(e.target.value)} required disabled={!auth.user} /></label>
            <button className="btn btn-primary" type="submit" disabled={busy || !auth.user}>{d.company.createButton}</button>
            {msg && <p className="meta" role="status">{msg}</p>}
            {companyId && <Link className="btn btn-secondary" to={`/${lang}/company/${companyId}/dashboard`}>{d.company.openDashboard}</Link>}
          </form>
          {companies.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h2>{d.nav.hrDashboard}</h2>
              <ul>{companies.map((c) => <li key={c.id}><Link to={`/${lang}/company/${c.id}/dashboard`}>{c.name}</Link></li>)}</ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
