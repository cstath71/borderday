import meta from '../content/guides.json';

type GuidePath = { lang?: string; path: string; fallbackPath: string };

const HUB_LANGS = new Set(['fr', 'de', 'it']);

/**
 * Written guides have no translated URL. Leaving one should land on the
 * existing page for that border in the language the reader chose, or on
 * that language's guide hub when the page is only an index.
 */
export function untranslatedLocalePath(pathname: string, next: string): string | null {
  const hub = pathname.match(/^\/(fr|de|it)\/guides\/?$/);
  if (hub) {
    if (next === hub[1]) return null;
    if (HUB_LANGS.has(next)) return `/${next}/guides/`;
    return `/${next}/`;
  }
  for (const guide of meta as GuidePath[]) {
    const lang = guide.lang || 'fr';
    const base = `/${lang}/${guide.path}`;
    if (pathname !== base && pathname !== `${base}/`) continue;
    if (next === lang) return null;
    if (!guide.fallbackPath) return `/${next}/`;
    return `/${next}/${guide.fallbackPath}/`;
  }
  return null;
}
