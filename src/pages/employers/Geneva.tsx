import { Link } from 'react-router-dom';
import FrenchGuideLinks from '../../components/FrenchGuideLinks';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import { getDict } from '../../i18n';
import EmployerRelatedLinks from './RelatedLinks';

const SOURCES = [
  {
    title: 'ge.ch — avenant télétravail',
    url: 'https://www.ge.ch/actualite/teletravail-personnes-frontalieres-entree-vigueur-avenant-convention-franco-suisse-29-07-2025',
  },
  {
    title: 'ge.ch — obligations de l’employeur (première transmission janvier 2027)',
    url: 'https://www.ge.ch/imposition-du-teletravail-personnes-frontalieres/obligations-employeur-matiere-teletravail',
  },
  {
    title: 'ge.ch — calculer le taux de télétravail',
    url: 'https://www.ge.ch/imposition-du-teletravail-personnes-frontalieres/comment-calculer-taux-teletravail',
  },
  {
    title: 'ge.ch — au-delà de 40% de télétravail',
    url: 'https://www.ge.ch/imposition-du-teletravail-personnes-frontalieres/au-dela-40-activite-teletravail',
  },
  {
    title: 'ESTV amicable agreement CH–FR (PDF)',
    url: 'https://www.estv.admin.ch/dam/fr/sd-web/Bibcb06jL1wG/int-laender-fr-dba-ai-cdi-20260429-fr.pdf',
  },
  {
    title: 'impots.gouv.fr — fiche 10 jours / 40%',
    url: 'https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/4_changements_de_situation/480_depart_arrivee_france/fiche-pratique-accords-interpretatifs-10-jours-cdi.pdf',
  },
  {
    title: 'Belgian FPS — framework agreement (25% / under 50%)',
    url: 'https://socialsecurity.belgium.be/en/internationally-active/cross-border-telework-eu-eea-and-switzerland',
  },
] as const;

export default function EmployersGeneva() {
  const lang = useLang();
  const d = getDict(lang);
  const p = d.employersGeneva;
  const faq = [
    [p.faq1q, p.faq1a],
    [p.faq2q, p.faq2a],
    [p.faq3q, p.faq3a],
    [p.faq4q, p.faq4a],
    [p.faq5q, p.faq5a],
  ] as const;

  return (
    <>
      <Seo
        lang={lang}
        title={p.metaTitle}
        description={p.metaDescription}
        path="employers/geneva"
        faq={faq}
      />
      <section className="hero">
        <div className="container">
          <h1>{p.heroTitle}</h1>
          <p className="lead">
            <strong>{d.home.inShortLabel}:</strong> {p.inShort}
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary" to={`/${lang}/company/signup`}>
              {p.ctaPrimary}
            </Link>
            <Link className="btn btn-secondary" to={`/${lang}/pricing`}>
              {p.ctaPricing}
            </Link>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container prose">
          <h2>{p.thresholdsTitle}</h2>
          <ul>
            <li>{p.thresholdTax40}</li>
            <li>{p.thresholdMissions10}</li>
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
          <FrenchGuideLinks ids={['geneva']} heading="Pour les salariés qui résident en France" />
          <div className="hero-cta" style={{ marginTop: '1.5rem' }}>
            <Link className="btn btn-primary" to={`/${lang}/company/signup`}>
              {p.ctaPrimary}
            </Link>
          </div>
          <EmployerRelatedLinks current="geneva" />
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
