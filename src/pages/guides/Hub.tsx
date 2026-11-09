import { Link, Navigate } from 'react-router-dom';
import { useLang } from '../../components/Layout';
import Seo from '../../components/Seo';
import { HUB_BY_LANG } from '../../content/guideHub.mjs';
import { guidesFor } from '../../content/guides';
import { getDict } from '../../i18n';
import { publicPath } from '../../lib/publicPath';

const BASE = 'https://borderday.com';

const CRUMBS: Record<string, string> = {
  fr: "Fil d'Ariane",
  de: 'Brotkrumen',
  it: 'Percorso',
};

function briefText(markdown: string, pattern: RegExp): string {
  const match = markdown.match(pattern);
  if (!match) return '';
  return match[1].replace(/\*\*/g, '').trim();
}

export default function GuidesHub() {
  const lang = useLang();
  const hub = HUB_BY_LANG[lang as 'fr' | 'de' | 'it'];
  if (!hub) {
    return <Navigate to={publicPath(lang)} replace />;
  }
  const d = getDict(lang);
  const guides = guidesFor(lang);
  const only = [lang] as ['fr'] | ['de'] | ['it'];
  const itemList = {
    '@type': 'ItemList',
    itemListElement: guides.map((guide, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: guide.h1,
      url: `${BASE}/${lang}/${guide.path}/`,
      description: briefText(guide.markdown, hub.briefRe),
    })),
  };
  return (
    <>
      <Seo
        lang={lang}
        title={hub.title}
        description={hub.description}
        path={hub.path}
        alternates={only}
        breadcrumb={[
          { name: d.nav.home, path: '' },
          { name: d.nav.guides, path: 'guides' },
        ]}
        extraGraph={[
          {
            '@type': 'CollectionPage',
            '@id': `${BASE}/${lang}/guides/#collection`,
            name: hub.h1,
            description: hub.description,
            inLanguage: lang,
            url: `${BASE}/${lang}/guides/`,
            mainEntity: itemList,
          },
          itemList,
        ]}
      />
      <section className="hero">
        <div className="container">
          <nav className="crumbs" aria-label={CRUMBS[lang]}>
            <ol>
              <li>
                <Link to={publicPath(lang)}>{d.nav.home}</Link>
              </li>
              <li aria-current="page">{d.nav.guides}</li>
            </ol>
          </nav>
          <h1>{hub.h1}</h1>
          <p id="summary" className="lead">
            {hub.intro}
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <ul>
            {guides.map((guide) => (
              <li key={guide.id}>
                <Link to={publicPath(lang, guide.path)}>{guide.h1}</Link>
                <p>
                  <strong>{hub.briefLabel} :</strong> {briefText(guide.markdown, hub.briefRe)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
