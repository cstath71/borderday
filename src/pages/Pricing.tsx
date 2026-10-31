import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';
import { startCheckout } from '../lib/billing';
import { useAuth } from '../lib/auth';
import { listMyCompanies } from '../lib/companyApi';

export default function Pricing() {
  const lang = useLang();
  const d = getDict(lang);
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [note, setNote] = useState<string | null>(null);
  const [banner, setBanner] = useState<'success' | 'cancel' | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const c = searchParams.get('checkout');
    if (c === 'success' || c === 'cancel') {
      setBanner(c);
      const next = new URLSearchParams(searchParams);
      next.delete('checkout');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!auth.user) { setCompanyId(null); return; }
    let cancelled = false;
    listMyCompanies()
      .then((list) => {
        if (cancelled) return;
        const owned = list.find((c) => c.role === 'owner' || c.role === 'hr_viewer');
        setCompanyId(owned?.id ?? null);
      })
      .catch(() => { if (!cancelled) setCompanyId(null); });
    return () => { cancelled = true; };
  }, [auth.user]);

  const bannerText = useMemo(() => {
    if (banner === 'success') return d.pricing.checkoutSuccess;
    if (banner === 'cancel') return d.pricing.checkoutCancel;
    return null;
  }, [banner, d.pricing.checkoutSuccess, d.pricing.checkoutCancel]);

  async function buy(plan: 'company' | 'individual', interval: 'month' | 'year') {
    setNote(null);
    if (!auth.user) {
      setNote(d.auth.signInTitle);
      return;
    }
    if (plan === 'company' && !companyId) {
      setNote(d.pricing.needCompany);
      return;
    }
    setBusy(true);
    try {
      const res = await startCheckout({
        plan,
        interval,
        companyId: plan === 'company' ? companyId ?? undefined : undefined,
        lang,
      });
      if (res.ok) {
        window.location.assign(res.url);
        return;
      }
      setNote(res.reason === 'not_available' ? d.auth.paymentsUnavailable : res.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Seo lang={lang} title={`${d.pricing.title} — BorderDay`} description={d.pricing.subtitle} path="pricing" />
      <section className="section">
        <div className="container">
          <h1>{d.pricing.title}</h1>
          <p>{d.pricing.subtitle}</p>
          {bannerText && (
            <p
              className="meta"
              role="status"
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 8,
                background: banner === 'success' ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'color-mix(in srgb, var(--ink-muted) 12%, transparent)',
              }}
            >
              {bannerText}
              {banner === 'success' && auth.user && (
                <>
                  {' '}
                  <Link to={companyId ? `/${lang}/company/${companyId}/dashboard` : `/${lang}/app`}>
                    {d.pricing.goToAccount}
                  </Link>
                </>
              )}
            </p>
          )}
          <div className="price-grid" style={{ marginTop: '1.5rem' }}>
            <article className="card price-card" style={{ borderColor: 'var(--primary)', borderWidth: 2 }}>
              <div className="meta" style={{ color: 'var(--primary)', fontWeight: 700 }}>{d.pricing.recommended}</div>
              <h2>{d.pricing.company}</h2>
              <div className="price">{d.pricing.companyPrice}</div>
              <div>{d.pricing.companyMin}</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>{d.pricing.companyYearly}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{d.pricing.companyTax}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{d.pricing.trialNote}</p>
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
                <Link className="btn btn-secondary" to={`/${lang}/company/signup`}>{d.nav.companySignup}</Link>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={() => buy('company', 'month')}
                >
                  {d.pricing.subscribeMonthly}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={busy}
                  onClick={() => buy('company', 'year')}
                >
                  {d.pricing.subscribeYearly}
                </button>
              </div>
            </article>
            <article className="card price-card">
              <h2>{d.pricing.individual}</h2>
              <div className="price">{d.pricing.monthly}</div>
              <div>{d.pricing.yearly}</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>{d.pricing.yearlyNote}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{d.pricing.individualTax}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{d.pricing.trialNote}</p>
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
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={() => buy('individual', 'month')}
                >
                  {d.pricing.subscribeMonthly}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={busy}
                  onClick={() => buy('individual', 'year')}
                >
                  {d.pricing.subscribeYearly}
                </button>
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
