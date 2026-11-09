import { Link } from 'react-router-dom';
import FrenchGuideLinks from '../components/FrenchGuideLinks';
import PublicSeo from '../components/PublicSeo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';
import { publicPath } from '../lib/publicPath';

export default function ForIndividuals() {
  const lang = useLang();
  const d = getDict(lang);

  return (
    <>
      <PublicSeo path="for-individuals" />
      <section className="hero">
        <div className="container">
          <h1>{d.individuals.heroTitle}</h1>
          <p id="summary" className="lead">{d.individuals.heroBody}</p>
          <div className="hero-cta">
            <Link className="btn btn-primary" to={`/${lang}/app`}>
              {d.individuals.ctaApp}
            </Link>
            <Link className="btn btn-secondary" to={publicPath(lang, 'pricing')}>
              {d.individuals.ctaPricing}
            </Link>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container grid-3">
          <article className="card">
            <p>{d.individuals.point1}</p>
          </article>
          <article className="card">
            <p>{d.individuals.point2}</p>
          </article>
          <article className="card">
            <p>{d.individuals.point3}</p>
          </article>
        </div>
        {lang === 'fr' && (
          <div className="container">
            <FrenchGuideLinks />
          </div>
        )}
        <div className="container" style={{ marginTop: '1.5rem' }}>
          <Link className="btn btn-ghost" to={publicPath(lang, 'company/signup')}>
            {d.individuals.ctaCompanies}
          </Link>
        </div>
      </section>
    </>
  );
}
