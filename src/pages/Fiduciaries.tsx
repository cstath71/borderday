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
    [p.point1Title, p.point1Body],
    [p.point2Title, p.point2Body],
    [p.point3Title, p.point3Body],
    [p.point4Title, p.point4Body],
    [p.point5Title, p.point5Body],
  ] as const;

  return (
    <>
      <PublicSeo path="fiduciaries" />
      <section className="hero">
        <div className="container">
          <h1>{p.heroTitle}</h1>
          <p id="summary" className="lead">
            {p.intro}
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary" to={publicPath(lang, 'company/signup')}>
              {p.ctaAccount}
            </Link>
            <Link className="btn btn-secondary" to={publicPath(lang, 'pricing')}>
              {d.home.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>{p.howTitle}</h2>
          <ul>
            {points.map(([title, body]) => (
              <li key={title}>
                <strong>{title}</strong> {body}
              </li>
            ))}
          </ul>
          <p>{p.pricing}</p>
          <p>{p.dataProtection}</p>
        </div>
      </section>
    </>
  );
}
