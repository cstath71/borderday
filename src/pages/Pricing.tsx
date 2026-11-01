import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LegalLinks from '../components/LegalLinks';
import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';
import { startCheckout } from '../lib/billing';
import { useAuth } from '../lib/auth';
import { listMyCompanies } from '../lib/companyApi';
import { ECB_EUR_CHF, formatApproxChf } from '../lib/fx';
import { t } from '../i18n';

export default function Pricing() {
  const lang = useLang();
  const d = getDict(lang);
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [note, setNote] = useState<string | null>(null);
  const [banner, setBanner] = useState<'success' | 'cancel' | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [expressStart, setExpressStart] = useState(false);

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

  const locale = lang === 'en' ? 'en-CH' : lang === 'de' ? 'de-CH' : lang === 'fr' ? 'fr-CH' : lang === 'it' ? 'it-CH' : lang === 'nl' ? 'nl-BE' : 'en-CH';
  const chfLine = (eur: number) =>
    t(d.pricing.approxChf, { chf: formatApproxChf(eur, locale) });
  const chfNote = t(d.pricing.chfBillingNote, {
    date: ECB_EUR_CHF.date,
    rate: String(ECB_EUR_CHF.rate),
  });

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
    if (!expressStart) {
      setNote(d.pricing.expressStartRequired);
      return;
    }
    setBusy(true);
    try {
      const res = await startCheckout({
        plan,
        interval,
        companyId: plan === 'company' ? companyId ?? undefined : undefined,
        lang,
        expressStartAcknowledged: true,
      });
      if (res.ok) {
        window.location.assign(res.url);
        return;
      }
      setNote(res.reason === 'already_subscribed' ? t(d.pricing.alreadySubscribed, { cancel: d.nav.cancel }) : d.auth.paymentsUnavailable);
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
          <p id="summary"><strong>{d.home.inShortLabel}:</strong> {d.home.inShort}</p>
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
          <p style={{ fontSize: '0.9rem' }}>
            <Link to={`/${lang}/cancel`}>{d.nav.cancel}</Link>
          </p>
          <label
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              marginTop: '1.25rem',
              padding: '0.85rem 1rem',
              borderRadius: 8,
              border: '1px solid color-mix(in srgb, var(--ink-muted) 35%, transparent)',
              fontSize: '0.9rem',
              lineHeight: 1.45,
            }}
          >
            <input
              type="checkbox"
              checked={expressStart}
              onChange={(e) => setExpressStart(e.target.checked)}
              required
              style={{ marginTop: '0.2rem' }}
            />
            <span>{d.pricing.expressStartLabel}</span>
          </label>
          <div className="price-grid" style={{ marginTop: '1.5rem' }}>
            <article className="card price-card" style={{ borderColor: 'var(--primary)', borderWidth: 2 }}>
              <div className="meta" style={{ color: 'var(--primary)', fontWeight: 700 }}>{d.pricing.recommended}</div>
              <h2>{d.pricing.company}</h2>
              <div className="price">{d.pricing.companyPrice}</div>
              <div className="meta">{chfLine(5)} <span aria-hidden="true">·</span> {chfLine(39)} min</div>
              <div>{d.pricing.companyMin}</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>{d.pricing.companyYearly} ({chfLine(390)})</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{d.pricing.companyTax}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{d.pricing.activeEmployeeDef}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{d.pricing.companyBusinessOnly}</p>
              <h3>{d.pricing.includes}</h3>
              <ul>
                <li>{d.pricing.companyInclude1}</li>
                <li>{d.pricing.companyInclude2}</li>
                <li>{d.pricing.companyInclude3}</li>
                <li>{d.pricing.companyInclude4}</li>
                <li>{d.pricing.include2}</li>
                <li>{d.pricing.include5}</li>
              </ul>
              <p style={{ fontSize: '0.9rem' }}><strong>{d.pricing.trialCompany}</strong></p>
              <LegalLinks d={d} lang={lang} intro={d.pricing.readBefore} />
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
              <div className="meta">{chfLine(4.99)}</div>
              <div>{d.pricing.yearly} ({chfLine(49)})</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>{d.pricing.yearlyNote}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{d.pricing.individualTax}</p>
              <h3>{d.pricing.includes}</h3>
              <ul>
                <li>{d.pricing.include1}</li>
                <li>{d.pricing.include2}</li>
                <li>{d.pricing.include3}</li>
                <li>{d.pricing.include4}</li>
                <li>{d.pricing.include5}</li>
                <li>{d.pricing.include6}</li>
              </ul>
              <p style={{ fontSize: '0.9rem' }}><strong>{d.pricing.trialIndividual}</strong></p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{d.pricing.yearlyRenewal}</p>
              <LegalLinks d={d} lang={lang} intro={d.pricing.readBefore} />
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
          <p className="meta" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>{chfNote}</p>
          {note && <p className="meta" role="alert" style={{ marginTop: '1rem' }}>{note}</p>}
        </div>
      </section>
    </>
  );
}
