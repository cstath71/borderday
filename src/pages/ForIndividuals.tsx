import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';

export default function ForIndividuals() {
  const lang = useLang();
  const d = getDict(lang);

  return (
    <>
      <Seo
        lang={lang}
        title={`${d.individuals.title} — BorderDay`}
        description={d.individuals.heroBody}
        path="for-individuals"
      />
      <section className="hero">
        <div className="container">
          <h1>{d.individuals.heroTitle}</h1>
          <p className="lead">{d.individuals.heroBody}</p>
          <div className="hero-cta">
            <Link className="btn btn-primary" to={`/${lang}/app`}>
              {d.individuals.ctaApp}
            </Link>
            <Link className="btn btn-secondary" to={`/${lang}/pricing`}>
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
        <div className="container" style={{ marginTop: '1.5rem' }}>
          <Link className="btn btn-ghost" to={`/${lang}/company/signup`}>
            {d.individuals.ctaCompanies}
          </Link>
        </div>
      </section>
    </>
  );
}
