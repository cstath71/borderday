import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LegalLinks from '../components/LegalLinks';
import PublicSeo from '../components/PublicSeo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';
import { publicPath } from '../lib/publicPath';
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
  const [signInNeeded, setSignInNeeded] = useState(false);
  const [banner, setBanner] = useState<'success' | 'cancel' | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [ownedCompanies, setOwnedCompanies] = useState<Array<{ id: string; name: string }>>([]);
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
    if (!auth.user) {
      setCompanyId(null);
      setOwnedCompanies([]);
      return;
    }
    let cancelled = false;
    const fromUrl = searchParams.get('companyId');
    listMyCompanies()
      .then((list) => {
        if (cancelled) return;
        const owned = list.filter((c) => c.role === 'owner');
        setOwnedCompanies(owned.map((c) => ({ id: c.id, name: c.name })));
        if (fromUrl && owned.some((c) => c.id === fromUrl)) setCompanyId(fromUrl);
        else if (owned.length === 1) setCompanyId(owned[0].id);
        else if (owned.length > 1) setCompanyId((prev) => prev && owned.some((c) => c.id === prev) ? prev : owned[0].id);
        else setCompanyId(null);
      })
      .catch(() => {
        if (!cancelled) {
          setCompanyId(null);
          setOwnedCompanies([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [auth.user, searchParams]);

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
    setSignInNeeded(false);
    if (!auth.user) {
      setSignInNeeded(true);
      return;
    }
    if (plan === 'company' && !companyId) {
      setNote(d.pricing.needCompany);
      return;
    }
    if (plan === 'individual' && !expressStart) {
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
        expressStartAcknowledged: plan === 'individual' ? true : undefined,
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
      <PublicSeo path="pricing" />
      <section className="section">
        <div className="container">
          <h1>{d.pricing.title}</h1>
          <p id="summary"><strong>{d.home.inShortLabel}:</strong> {d.home.inShort}</p>
          <p>{d.pricing.subtitle}</p>
          {(lang === 'en' || lang === 'fr' || lang === 'de' || lang === 'it') && (
            <p>
              <Link to={publicPath(lang, 'guides')}>{d.nav.guides}</Link>
            </p>
          )}
          <p>
            <Link to={publicPath(lang, 'fiduciaries')}>{d.pricing.fiduciaryLink}</Link>
          </p>
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
            <Link to={publicPath(lang, 'cancel')}>{d.nav.cancel}</Link>
          </p>
          <div className="price-grid" style={{ marginTop: '1.5rem' }}>
            <article className="card price-card" style={{ borderColor: 'var(--primary)', borderWidth: 2 }}>
              <div className="meta" style={{ color: 'var(--primary)', fontWeight: 700 }}>{d.pricing.recommended}</div>
              <h2>{d.pricing.company}</h2>
              <div className="price">{d.pricing.companyPrice}</div>
              <div className="meta">{chfLine(5)} <span aria-hidden="true">·</span> {chfLine(39)} {d.pricing.chfMinAbbrev}</div>
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
              {auth.user && ownedCompanies.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  {ownedCompanies.length === 1 ? (
                    <p className="meta" data-testid="billing-company">
                      {t(d.pricing.billingCompany, { company: ownedCompanies[0].name })}
                    </p>
                  ) : (
                    <label>
                      {d.pricing.pickBillingCompany}
                      <select
                        value={companyId ?? ''}
                        onChange={(e) => setCompanyId(e.target.value || null)}
                        data-testid="billing-company-picker"
                      >
                        {ownedCompanies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <Link className="btn btn-secondary" to={publicPath(lang, 'company/signup')}>{d.nav.companySignup}</Link>
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
              <label
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  marginTop: '1rem',
                  marginBottom: '0.75rem',
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
          <p className="meta" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>{d.pricing.trialOnce}</p>
          <p className="meta" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>{chfNote}</p>
          {signInNeeded && (
            <p className="meta" role="alert" style={{ marginTop: '1rem' }}>
              <Link to={`/${lang}/auth/sign-in?next=${encodeURIComponent(publicPath(lang, 'pricing'))}`}>
                {d.auth.signInTitle}
              </Link>
            </p>
          )}
          {note && <p className="meta" role="alert" style={{ marginTop: '1rem' }}>{note}</p>}
        </div>
      </section>
    </>
  );
}
