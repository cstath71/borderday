import { Link } from 'react-router-dom';
import PublicSeo from '../../components/PublicSeo';
import { useLang } from '../../components/Layout';
import { getDict } from '../../i18n';
import { publicPath } from '../../lib/publicPath';
import { employerFaqPairs } from '../../seo/visibleFaq';
import EmployerRelatedLinks from './RelatedLinks';

/** Titles match pack SRC entries in src/borders/packs.ts (ticino_it). */
const SOURCES = [
  {
    title: 'Fedlex — Accordo CH–IT 23 Dec 2020 Art. 2 (SR 0.642.045.43)',
    url: 'https://www.fedlex.admin.ch/eli/cc/2023/410/it',
  },
  {
    title: 'Fedlex RU 2026 104 — protocollo CH–IT (published)',
    url: 'https://www.fedlex.admin.ch/eli/oc/2026/104/it',
  },
  {
    title: 'FSIO (BSV/OFAS/UFAS) — release of 13 Feb 2026: Switzerland–Italy home office rules in force',
    url: 'https://www.bsv.admin.ch/en/newnsb/KIyFJwwqspqaOcHDaT7u0',
  },
  {
    title: 'Belgian FPS — framework agreement, explanatory memorandum (25% and 50%)',
    url: 'https://socialsecurity.belgium.be/sites/default/files/content/docs/en/international/explanatory_memorandum_to_the_framework_agreement.pdf',
  },
  {
    title: 'Belgian FPS — framework agreement depositary',
    url: 'https://socialsecurity.belgium.be/en/internationally-active/cross-border-telework-eu-eea-and-switzerland',
  },
] as const;

export default function EmployersTicino() {
  const lang = useLang();
  const d = getDict(lang);
  const p = d.employersTicino;
  const faq = employerFaqPairs(lang, 'ticino');

  return (
    <>
      <PublicSeo path="employers/ticino" faq={faq} />
      <section className="hero">
        <div className="container">
          <h1>{p.heroTitle}</h1>
          <p id="summary" className="lead">
            <strong>{d.home.inShortLabel}:</strong> {p.inShort}
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
          <h2>{p.agreementTitle}</h2>
          <p>{p.agreementBody}</p>
          <h2>{p.thresholdsTitle}</h2>
          <ul>
            <li>{p.thresholdTax25}</li>
            <li>{p.thresholdNonreturn45}</li>
            <li>{p.thresholdSs50}</li>
            <li>{p.thresholdEmployerDuty}</li>
          </ul>
          <h2>{p.howTitle}</h2>
          <p>{p.howBody}</p>
          <h2>{p.sourcesTitle}</h2>
          <ul>
            {SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} rel="noopener noreferrer" target="_blank">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
          <p className="muted">{p.disclaimer}</p>
          <div className="hero-cta" style={{ marginTop: '1.5rem' }}>
            <Link className="btn btn-primary" to={publicPath(lang, 'company/signup')}>
              {p.ctaPrimary}
            </Link>
          </div>
          <EmployerRelatedLinks current="ticino" />
          <h2 id="faq">{p.faqTitle}</h2>
          <div className="faq">
            {faq.map(([q, a]) => (
              <div key={q}>
                <h3>{q}</h3>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
