import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import { getDict } from '../../i18n';
import {
  createCompany,
  getBackendMode,
  listMyCompanies,
  seedDemoCompany,
  signIn,
} from '../../lib/supabaseMock';

export default function CompanySignup() {
  const lang = useLang();
  const d = getDict(lang);
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    signIn(email, displayName);
    const { company } = createCompany(name);
    setCompanyId(company.id);
    setMsg(d.company.created);
  }

  function onLoadDemo() {
    const { companyId: id } = seedDemoCompany();
    setCompanyId(id);
    setMsg(d.company.demoBanner);
    nav(`/${lang}/company/${id}/dashboard`);
  }

  const existing = (() => {
    try {
      return listMyCompanies();
    } catch {
      return [];
    }
  })();

  return (
    <>
      <Seo
        lang={lang}
        title={`${d.company.signupTitle} — BorderDay`}
        description={d.company.signupSubtitle}
        path="company/signup"
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 560 }}>
          <h1>{d.company.signupTitle}</h1>
          <p>{d.company.signupSubtitle}</p>
          <p className="meta backend-mode">{d.company.backendMode} ({getBackendMode()})</p>

          <button type="button" className="btn btn-primary" onClick={onLoadDemo} style={{ marginBottom: '1rem' }}>
            {d.company.loadDemo}
          </button>

          <form className="card stack-form" onSubmit={onCreate}>
            <label>
              {d.company.companyName}
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              {d.company.yourName}
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </label>
            <label>
              {d.company.workEmail}
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <button className="btn btn-secondary" type="submit">
              {d.company.createButton}
            </button>
            {msg && <p>{msg}</p>}
            {companyId && (
              <Link className="btn btn-primary" to={`/${lang}/company/${companyId}/dashboard`}>
                {d.company.openDashboard}
              </Link>
            )}
          </form>

          {existing.length > 0 && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <h2>{d.company.openDashboard}</h2>
              <ul>
                {existing.map((c) => (
                  <li key={c.id}>
                    <Link to={`/${lang}/company/${c.id}/dashboard`}>
                      {c.isDemo ? `[${d.company.demoDataBadge}] ` : ''}
                      {c.name}
                    </Link>
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
