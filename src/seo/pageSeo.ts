import type { Lang } from '../i18n';
import heads from './heads.json';

export interface PageHead {
  title: string;
  description: string;
  summary: string;
}

/** Titles and descriptions copied from scripts/seo.mjs. tests/seo.test.ts fails if they drift. */
export function pageSeo(lang: Lang, path: string): PageHead {
  const row = (heads as Record<string, Record<string, PageHead>>)[path]?.[lang];
  if (!row?.title || !row.description) throw new Error(`Missing SEO head for ${lang} ${path}`);
  return row;
}
