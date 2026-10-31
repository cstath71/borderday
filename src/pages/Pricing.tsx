import { useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';
import { startCheckout } from '../lib/billing';
import { useAuth } from '../lib/auth';

export default function Pricing() {
  const lang = useLang();
  const d = getDict(lang);
  const auth = useAuth();
  const [note, setNote] = useState<string | null>(null);

  async function buy(plan: 'company' | 'individual', interval: 'month' | 'year') {
    setNote(null);
    if (!auth.user) { setNote(d.auth.signInTitle); return; }
    const res = await startCheckout({ plan, interval });
    if (res.ok) { window.location.assign(res.url); return; }
    setNote(res.reason === 'not_available' ? d.auth.paymentsUnavailable : res.message);
  }

  return (
    <>
      <Seo lang={lang} title={`${d.pricing.title} — BorderDay`} description={d.pricing.subtitle} path="pricing" />
      <section className="section">
        <div className="container">
          <h1>{d.pricing.title}</h1>
          <p>{d.pricing.subtitle}</p>
          <div className="price-grid" style={{ marginTop: '1.5rem' }}>
            <article className="card price-card" style={{ borderColor: 'var(--primary)', borderWidth: 2 }}>
              <span className="coming-soon">{d.pricing.comingSoon}</span>
              <div className="meta" style={{ color: 'var(--primary)', fontWeight: 700 }}>{d.pricing.recommended}</div>
              <h2>{d.pricing.company}</h2>
              <div className="price">{d.pricing.companyPrice}</div>
              <div>{d.pricing.companyMin}</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>{d.pricing.companyYearly}</p>
              <h3>{d.pricing.includes}</h3>
              <ul>
                <li>{d.pricing.companyInclude1}</li>
                <li>{d.pricing.companyInclude2}</li>
                <li>{d.pricing.companyInclude3}</li>
                <li>{d.pricing.companyInclude4}</li>
                <li>{d.pricing.include2}</li>
                <li>{d.pricing.include5}</li>
              </ul>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <Link className="btn btn-primary" to={`/${lang}/company/signup`}>{d.nav.companySignup}</Link>
                <button type="button" className="btn btn-secondary" onClick={() => buy('company', 'month')}>{d.auth.paymentsUnavailable}</button>
              </div>
            </article>
            <article className="card price-card">
              <span className="coming-soon">{d.pricing.comingSoon}</span>
              <h2>{d.pricing.individual}</h2>
              <div className="price">{d.pricing.monthly}</div>
              <div>{d.pricing.yearly}</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>{d.pricing.yearlyNote}</p>
              <h3>{d.pricing.includes}</h3>
              <ul>
                <li>{d.pricing.include1}</li>
                <li>{d.pricing.include2}</li>
                <li>{d.pricing.include3}</li>
                <li>{d.pricing.include4}</li>
                <li>{d.pricing.include5}</li>
                <li>{d.pricing.include6}</li>
              </ul>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <Link className="btn btn-secondary" to={`/${lang}/auth/sign-up`}>{d.pricing.waitlistCta}</Link>
                <button type="button" className="btn btn-secondary" onClick={() => buy('individual', 'month')}>{d.auth.paymentsUnavailable}</button>
              </div>
            </article>
          </div>
          {note && <p className="meta" role="status" style={{ marginTop: '1rem' }}>{note}</p>}
          <p style={{ marginTop: '1.5rem', color: 'var(--ink-muted)', fontSize: '0.9rem' }}>{d.pricing.compareNote}</p>
        </div>
      </section>
    </>
  );
}
