import { Link } from 'react-router-dom';
import { hasSocialSecurityCounter, hasTaxCounter, listBorderPacks } from '../borders/packs';
import FrenchGuideLinks from '../components/FrenchGuideLinks';
import PublicSeo from '../components/PublicSeo';
import RoutesCovered from '../components/RoutesCovered';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';
import { publicPath } from '../lib/publicPath';

export default function Home() {
  const lang = useLang();
  const d = getDict(lang);
  const packs = listBorderPacks();

  return (
    <>
      <PublicSeo path="" />
      <section className="hero">
        <div className="container">
          <p className="meta" style={{ color: 'var(--warn)', fontWeight: 600 }}>
            {d.home.demoBanner}
          </p>
          <h1>{d.home.heroTitle}</h1>
          <p id="summary" className="lead"><strong>{d.home.inShortLabel}:</strong> {d.home.inShort}</p>
          <p className="lead">{d.home.heroBody}</p>
          <div className="hero-cta">
            <Link className="btn btn-primary" to={publicPath(lang, 'company/signup')}>{d.home.ctaPrimary}
            </Link>
            <Link className="btn btn-secondary" to={publicPath(lang, 'pricing')}>
              {d.home.ctaSecondary}
            </Link>
            <Link className="btn btn-ghost" to={publicPath(lang, 'for-individuals')}>
              {d.home.ctaIndividuals}
            </Link>
            <Link className="btn btn-ghost" to={`/${lang}/auth/sign-up`}>
              {d.home.ctaIndividualSignup}
            </Link>
          </div>
          <p style={{ marginTop: '1rem', color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
            {d.home.disclaimerShort}
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="hr-desk-title">
        <div className="container">
          <h2 id="hr-desk-title">{d.home.hrDeskTitle}</h2>
          <p>{d.home.hrDeskIntro}</p>
          <div className="grid-3" style={{ marginTop: '1rem' }}>
            <article className="card">
              <h3>{d.home.hrDesk1Title}</h3>
              <p>{d.home.hrDesk1Body}</p>
            </article>
            <article className="card">
              <h3>{d.home.hrDesk2Title}</h3>
              <p>{d.home.hrDesk2Body}</p>
            </article>
            <article className="card">
              <h3>{d.home.hrDesk3Title}</h3>
              <p>{d.home.hrDesk3Body}</p>
            </article>
          </div>
          <article className="card" style={{ marginTop: '1.5rem' }}>
            <h3>{d.home.hrDeskExampleTitle}</h3>
            <ol>
              <li>{d.home.hrDeskExample1}</li>
              <li>{d.home.hrDeskExample2}</li>
              <li>{d.home.hrDeskExample3}</li>
              <li>{d.home.hrDeskExample4}</li>
            </ol>
            <p className="meta" style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>
              {d.home.hrDeskExampleNote}
            </p>
          </article>
          <div className="hero-cta">
            <Link className="btn btn-primary" to={publicPath(lang, 'company/signup')}>
              {d.home.ctaPrimary}
            </Link>
          </div>
        </div>
      </section>

      {(lang === 'en' || lang === 'fr' || lang === 'de' || lang === 'it') && (
        <section className="section">
          <div className="container">
            <FrenchGuideLinks />
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <h2>{d.home.riskTitle}</h2>
          <div className="grid-3" style={{ marginTop: '1rem' }}>
            <article className="card">
              <h3>{d.home.risk1Title}</h3>
              <p>{d.home.risk1Body}</p>
            </article>
            <article className="card">
              <h3>{d.home.risk2Title}</h3>
              <p>{d.home.risk2Body}</p>
            </article>
            <article className="card">
              <h3>{d.home.risk3Title}</h3>
              <p>{d.home.risk3Body}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container grid-3">
          <article className="card">
            <h3>{d.home.feature1Title}</h3>
            <p>{d.home.feature1Body}</p>
          </article>
          <article className="card">
            <h3>{d.home.feature2Title}</h3>
            <p>{d.home.feature2Body}</p>
          </article>
          <article className="card">
            <h3>{d.home.feature3Title}</h3>
            <p>{d.home.feature3Body}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>{d.home.bordersTitle}</h2>
          <p>{d.home.bordersIntro}</p>
          <div className="border-list" style={{ marginTop: '1rem' }}>
            {packs.map((p) => (
              <div className="border-chip" key={p.id}>
                <strong>{(d.borders as Record<string, string>)[p.nameKey]}</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                  {hasTaxCounter(p) ? d.home.chipTaxYes : d.home[p.noTaxChipKey ?? 'chipTaxNo']}
                  {hasSocialSecurityCounter(p) && ` · ${d.home.chipSsYes}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <h2>{d.employersHub.byRegionTitle}</h2>
          <ul>
            <li>
              <Link to={publicPath(lang, 'employers/ticino')}>{d.employersHub.linkTicino}</Link>
            </li>
            <li>
              <Link to={publicPath(lang, 'employers/geneva')}>{d.employersHub.linkGeneva}</Link>
            </li>
            <li>
              <Link to={publicPath(lang, 'employers/luxembourg')}>{d.employersHub.linkLuxembourg}</Link>
            </li>
          </ul>
        </div>
      </section>

      <RoutesCovered />

      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <h2>{d.home.howTitle}</h2>
          <ol>
            <li>{d.home.how1}</li>
            <li>{d.home.how2}</li>
            <li>{d.home.how3}</li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container card" id="get-started">
          <h2>{d.home.waitlistTitle}</h2>
          <p>{d.home.waitlistBody}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
            <Link className="btn btn-primary" to={`/${lang}/auth/sign-up`}>{d.home.waitlistButton}</Link>
            <Link className="btn btn-secondary" to={`/${lang}/auth/sign-in`}>{d.nav.joinWaitlist}</Link>
            <Link className="btn btn-secondary" to={publicPath(lang, 'company/signup')}>{d.nav.companySignup}</Link>
          </div>
          <p className="meta" style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>
            {d.home.waitlistNote}
          </p>
        </div>
      </section>
    </>
  );
}
