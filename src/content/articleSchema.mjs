/** Article JSON-LD shared by the page and the static prerender. Brand publisher only. */
export function articleJsonLd(base, guide, h1) {
  const root = String(base).replace(/\/$/, '');
  const url = `${root}/fr/${guide.path}/`;
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: h1,
    description: guide.description,
    inLanguage: 'fr',
    datePublished: guide.datePublished,
    dateModified: guide.datePublished,
    image: `${root}/og.png`,
    author: { '@id': `${root}/#org` },
    publisher: { '@id': `${root}/#org` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isAccessibleForFree: true,
  };
}
