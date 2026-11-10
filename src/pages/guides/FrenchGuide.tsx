import { Link, Navigate } from 'react-router-dom';
import FrenchGuideLinks from '../../components/FrenchGuideLinks';
import { useLang } from '../../components/Layout';
import Seo from '../../components/Seo';
import { GUIDE_FAQ } from '../../content/guideFaq.mjs';
import { articleLd, guideById, guideLongDate, type GuideId, type GuideLang } from '../../content/guides';
import { getDict } from '../../i18n';
import { publicPath } from '../../lib/publicPath';

const UI: Record<
  GuideLang,
  { crumbs: string; faq: string; related: string }
> = {
  fr: { crumbs: "Fil d'Ariane", faq: 'Questions fréquentes', related: 'Autres guides' },
  de: { crumbs: 'Brotkrumen', faq: 'Häufige Fragen', related: 'Weitere Leitfäden' },
  it: { crumbs: 'Percorso', faq: 'Domande frequenti', related: 'Altre guide' },
};

export default function FrenchGuide({ id }: { id: GuideId }) {
  const lang = useLang();
  const guide = guideById(id);
  if (lang !== guide.lang) {
    return <Navigate to={publicPath(lang, guide.fallbackPath)} replace />;
  }
  const d = getDict(guide.lang);
  const ui = UI[guide.lang];
  const faq = GUIDE_FAQ[id];
  const only = [guide.lang] as const;
  return (
    <>
      <Seo
        lang={guide.lang}
        title={guide.title}
        description={guide.description}
        path={guide.path}
        alternates={only}
        ogType="article"
        ogImage={guide.ogImage}
        publishedTime={guide.datePublished}
        modifiedTime={guide.dateModified || guide.datePublished}
        faq={faq}
        breadcrumb={[
          { name: d.nav.home, path: '' },
          { name: d.nav.guides, path: 'guides' },
          { name: guide.h1, path: guide.path },
        ]}
        extraGraph={[articleLd(guide)]}
      />
      <article className="guide-article">
        <header className="hero article-hero">
          <div className="container article-wrap">
            <nav className="crumbs" aria-label={ui.crumbs}>
              <ol>
                <li>
                  <Link to={publicPath(guide.lang)}>{d.nav.home}</Link>
                </li>
                <li>
                  <Link to={publicPath(guide.lang, 'guides')}>{d.nav.guides}</Link>
                </li>
                <li aria-current="page">{guide.h1}</li>
              </ol>
            </nav>
            <time className="article-kicker" dateTime={guide.datePublished}>
              {guideLongDate(guide.lang, guide.datePublished)}
            </time>
            <h1>{guide.h1}</h1>
          </div>
        </header>
        <div className="section article-section">
          <div className="container article-wrap article-prose" dangerouslySetInnerHTML={{ __html: guide.bodyHtml }} />
        </div>
        <div className="section">
          <div className="container article-wrap">
            <h2>{ui.faq}</h2>
            <div className="faq">
              {faq.map(([q, a]) => (
                <div key={q}>
                  <h3>{q}</h3>
                  <p>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="section article-related">
          <div className="container article-wrap">
            <FrenchGuideLinks except={guide.id} heading={ui.related} />
          </div>
        </div>
      </article>
    </>
  );
}
