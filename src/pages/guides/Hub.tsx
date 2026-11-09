import { Link, Navigate } from 'react-router-dom';
import { useLang } from '../../components/Layout';
import Seo from '../../components/Seo';
import { FRENCH_HUB } from '../../content/guideHub.mjs';
import { GUIDES } from '../../content/guides';
import { getDict } from '../../i18n';
import { publicPath } from '../../lib/publicPath';

const FR_ONLY = ['fr'] as const;
const BASE = 'https://borderday.com';

function enBrefText(markdown: string): string {
  const match = markdown.match(/\*\*En bref\s*:\*\*\s*(.+)/);
  if (!match) return '';
  return match[1].replace(/\*\*/g, '').trim();
}

export default function GuidesHub() {
  const lang = useLang();
  const d = getDict('fr');
  if (lang !== 'fr') {
    return <Navigate to={publicPath(lang)} replace />;
  }
  const itemList = {
    '@type': 'ItemList',
    itemListElement: GUIDES.map((guide, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: guide.h1,
      url: `${BASE}/fr/${guide.path}/`,
      description: enBrefText(guide.markdown),
    })),
  };
  return (
    <>
      <Seo
        lang="fr"
        title={FRENCH_HUB.title}
        description={FRENCH_HUB.description}
        path={FRENCH_HUB.path}
        alternates={FR_ONLY}
        breadcrumb={[
          { name: d.nav.home, path: '' },
          { name: d.nav.guides, path: 'guides' },
        ]}
        extraGraph={[
          {
            '@type': 'CollectionPage',
            '@id': `${BASE}/fr/guides/#collection`,
            name: FRENCH_HUB.h1,
            description: FRENCH_HUB.description,
            inLanguage: 'fr',
            url: `${BASE}/fr/guides/`,
            mainEntity: itemList,
          },
          itemList,
        ]}
      />
      <section className="hero">
        <div className="container">
          <nav className="crumbs" aria-label="Fil d'Ariane">
            <ol>
              <li>
                <Link to={publicPath('fr')}>{d.nav.home}</Link>
              </li>
              <li aria-current="page">{d.nav.guides}</li>
            </ol>
          </nav>
          <h1>{FRENCH_HUB.h1}</h1>
          <p id="summary" className="lead">
            {FRENCH_HUB.intro}
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <ul>
            {GUIDES.map((guide) => (
              <li key={guide.id}>
                <Link to={publicPath('fr', guide.path)}>{guide.h1}</Link>
                <p>
                  <strong>En bref :</strong> {enBrefText(guide.markdown)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
