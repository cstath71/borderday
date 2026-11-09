const PLACES = new Set([
  'France',
  'Luxembourg',
  'Genève',
  'Geneva',
  'Bâle',
  'Basel',
  'Deutschland',
  'Schweiz',
  'Italia',
  'Italy',
  'Ticino',
]);

/** Official http(s) links in a guide, excluding BorderDay's own pages. */
export function officialCitations(markdown) {
  const urls = [...String(markdown).matchAll(/\]\((https?:[^)\s]+)\)/g)].map((match) => match[1]);
  return [...new Set(urls.filter((url) => !url.includes('borderday.com')))];
}

function aboutNode(name) {
  return { '@type': PLACES.has(name) ? 'Place' : 'Thing', name };
}

/** Article JSON-LD shared by the page and the static prerender. Brand publisher only. */
export function articleJsonLd(base, guide, h1) {
  const root = String(base).replace(/\/$/, '');
  const lang = guide.lang || 'fr';
  const url = `${root}/${lang}/${guide.path}/`;
  const imagePath = guide.ogImage || '/og.png';
  const citation = guide.markdown ? officialCitations(guide.markdown) : guide.citation;
  const about = Array.isArray(guide.about) ? guide.about.map(aboutNode) : undefined;
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: h1,
    description: guide.description,
    inLanguage: lang,
    datePublished: guide.datePublished,
    dateModified: guide.dateModified || guide.datePublished,
    image: `${root}${imagePath}`,
    author: { '@id': `${root}/#org` },
    publisher: { '@id': `${root}/#org` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isAccessibleForFree: true,
    ...(citation?.length ? { citation } : {}),
    ...(about?.length ? { about } : {}),
    ...(guide.audience
      ? { audience: { '@type': 'Audience', audienceType: guide.audience } }
      : {}),
  };
}
