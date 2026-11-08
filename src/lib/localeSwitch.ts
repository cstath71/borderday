import meta from '../content/guides.json';

type GuidePath = { path: string; fallbackPath: string };

/**
 * French guides have no translated URL. Leaving one should land on the
 * existing page for that border in the language the reader chose.
 */
export function untranslatedLocalePath(pathname: string, next: string): string | null {
  if (next === 'fr') return null;
  for (const guide of meta as GuidePath[]) {
    const base = `/fr/${guide.path}`;
    if (pathname === base || pathname === `${base}/`) {
      return `/${next}/${guide.fallbackPath}/`;
    }
  }
  return null;
}
