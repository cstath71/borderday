import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import { getDict } from '../../i18n';
import EmployerRelatedLinks from './RelatedLinks';

const SOURCES = [
  {
    title: 'impots.gouv.fr — FR–LU seuil 34 jours',
    url: 'https://www.impots.gouv.fr/sites/default/files/media/10_conventions/luxembourg/nid_13587_accord_avec_le_luxembourg_sur_les_modalites_d_application_du_seuil_des_34_jours.pdf',
  },
  {
    title: 'gouvernement.lu — avenant FR–LU du 7 novembre 2022 (34 jours)',
    url: 'https://gouvernement.lu/fr/actualites/toutes_actualites/communiques/2022/11-novembre/07-signature-luxembourg-france.html',
  },
  {
    title: 'impotsdirects.public.lu — seuil BE–LU, note du 1er mars 2024',
    url: 'https://impotsdirects.public.lu/dam-assets/fr/conventions/conv/seuil-de-tolrance-b-01032024.pdf',
  },
  {
    title: 'Belgian Chamber DOC 55 3055/001 — BE–LU 34 jours',
    url: 'https://www.dekamer.be/FLWB/PDF/55/3055/55K3055001.pdf',
  },
  {
    title: 'ACD Luxembourg — Circulaire L.G. - Conv. D.I. n° 71 (DE–LU)',
    url: 'https://impotsdirects.public.lu/dam-assets/fr/legislation/circulaires/circulaire-lg-conv-di-71-du-18-mars-2024.pdf',
  },
  {
    title: 'BMF — Konsultationsvereinbarung DE–LU 11 Jan 2024',
    url: 'https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Internationales_Steuerrecht/Staatenbezogene_Informationen/Laender_A_Z/Luxemburg/2024-01-15-Luxemburg-Abkommen-DBA-Verstaendigungsvereinbarung-Anwendung-Auslegung-DBA.html',
  },
  {
    title: 'CCSS Luxembourg — telework agreement',
    url: 'https://ccss.public.lu/en/employeurs/secteur-prive/activite-etranger/accord-teletravail/notice-teletravail.html',
  },
  {
    title: 'Belgian FPS — framework agreement depositary',
    url: 'https://socialsecurity.belgium.be/en/internationally-active/cross-border-telework-eu-eea-and-switzerland',
  },
] as const;

export default function EmployersLuxembourg() {
  const lang = useLang();
  const d = getDict(lang);
  const p = d.employersLuxembourg;
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
        path="employers/luxembourg"
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
          <h2>{p.routesTitle}</h2>
          <ul>
            <li>{p.routeFr}</li>
            <li>{p.routeBe}</li>
            <li>{p.routeDe}</li>
          </ul>
          <h2>{p.thresholdsTitle}</h2>
          <ul>
            <li>{p.thresholdTax34}</li>
            <li>{p.thresholdPartTime}</li>
            <li>{p.thresholdSs50}</li>
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
            <Link className="btn btn-primary" to={`/${lang}/company/signup`}>
              {p.ctaPrimary}
            </Link>
          </div>
          <EmployerRelatedLinks current="luxembourg" />
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
