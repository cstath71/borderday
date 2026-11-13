import { Link } from 'react-router-dom';
import PublicSeo from '../components/PublicSeo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';
import { publicPath } from '../lib/publicPath';

export default function Fiduciaries() {
  const lang = useLang();
  const d = getDict(lang);
  const p = d.fiduciaries;
  const points = [
    [p.how1Title, p.how1Body],
    [p.how2Title, p.how2Body],
    [p.how3Title, p.how3Body],
    [p.how4Title, p.how4Body],
    [p.how5Title, p.how5Body],
  ] as const;

  return (
    <>
      <PublicSeo
        path="fiduciaries"
        breadcrumb={[
          { name: d.nav.home, path: '' },
          { name: p.crumb, path: 'fiduciaries' },
        ]}
      />
      <section className="hero">
        <div className="container">
          <h1>{p.heroTitle}</h1>
          <p id="summary" className="lead">
            {p.intro}
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary" to={publicPath(lang, 'company/signup')}>
              {p.ctaPrimary}
            </Link>
            <Link className="btn btn-secondary" to={publicPath(lang, 'pricing')}>
              {p.ctaPricing}
            </Link>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container prose">
          <h2>{p.howTitle}</h2>
          <ul>
            {points.map(([title, body]) => (
              <li key={title}>
                <strong>{title}</strong> {body}
              </li>
            ))}
          </ul>
          <h2>{p.pricingTitle}</h2>
          <p>{p.pricingBody}</p>
          <p>{p.dataBody}</p>
          <div className="hero-cta">
            <Link className="btn btn-primary" to={publicPath(lang, 'company/signup')}>
              {p.ctaPrimary}
            </Link>
            <Link className="btn btn-secondary" to={publicPath(lang, 'pricing')}>
              {p.ctaPricing}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
