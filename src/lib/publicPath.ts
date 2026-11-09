/**
 * In-app href for an indexable page. Always the trailing-slash form that
 * canonicals and the sitemap use. GitHub Pages still 301s the no-slash URL;
 * public links should not ask for that redirect.
 */
export function publicPath(lang: string, path = ''): string {
  const clean = String(path).replace(/^\/+|\/+$/g, '');
  if (!clean) return `/${lang}/`;
  return `/${lang}/${clean}/`;
}
