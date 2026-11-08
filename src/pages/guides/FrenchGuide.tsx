import { Link, Navigate } from 'react-router-dom';
import FrenchGuideLinks from '../../components/FrenchGuideLinks';
import { useLang } from '../../components/Layout';
import Seo from '../../components/Seo';
import { articleLd, frenchLongDate, guideById, type GuideId } from '../../content/guides';
import { getDict } from '../../i18n';

const FR_ONLY = ['fr'] as const;

export default function FrenchGuide({ id }: { id: GuideId }) {
  const lang = useLang();
  const guide = guideById(id);
  if (lang !== 'fr') {
    return <Navigate to={`/${lang}/${guide.fallbackPath}`} replace />;
  }
  const d = getDict('fr');
  return (
    <>
      <Seo
        lang="fr"
        title={`${guide.h1} — BorderDay`}
        description={guide.description}
        path={guide.path}
        alternates={FR_ONLY}
        ogType="article"
        publishedTime={guide.datePublished}
        breadcrumb={[
          { name: d.nav.home, path: '' },
          { name: d.nav.forIndividuals, path: 'for-individuals' },
          { name: guide.h1, path: guide.path },
        ]}
        extraGraph={[articleLd(guide)]}
      />
      <article className="guide-article">
        <header className="hero article-hero">
          <div className="container article-wrap">
            <nav className="crumbs" aria-label="Fil d'Ariane">
              <ol>
                <li>
                  <Link to="/fr/">{d.nav.home}</Link>
                </li>
                <li>
                  <Link to="/fr/for-individuals">{d.nav.forIndividuals}</Link>
                </li>
                <li aria-current="page">{guide.h1}</li>
              </ol>
            </nav>
            <p className="article-kicker">
              <time dateTime={guide.datePublished}>{frenchLongDate(guide.datePublished)}</time>
            </p>
            <h1>{guide.h1}</h1>
          </div>
        </header>
        <div className="section article-section">
          <div className="container article-wrap article-prose" dangerouslySetInnerHTML={{ __html: guide.bodyHtml }} />
        </div>
        <div className="section article-related">
          <div className="container article-wrap">
            <FrenchGuideLinks except={guide.id} heading="Autre guide" />
          </div>
        </div>
      </article>
    </>
  );
}
