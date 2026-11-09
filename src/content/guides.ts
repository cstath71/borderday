import ge from './articles/fr-geneve.md?raw';
import lu from './articles/fr-luxembourg.md?raw';
import { markdownToArticle } from './articleMarkdown.mjs';
import { articleJsonLd } from './articleSchema.mjs';
import meta from './guides.json';

export const SITE = 'https://borderday.com';

export type GuideId = 'luxembourg' | 'geneva';

export interface GuideMeta {
  id: GuideId;
  path: string;
  file: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  ogImage?: string;
  about?: string[];
  audience?: string;
  fallbackPath: string;
}

const RAW: Record<GuideId, string> = {
  luxembourg: lu,
  geneva: ge,
};

export interface Guide extends GuideMeta {
  h1: string;
  bodyHtml: string;
  markdown: string;
}

export const GUIDES: Guide[] = (meta as GuideMeta[]).map((guide) => {
  const markdown = RAW[guide.id];
  const parsed = markdownToArticle(markdown);
  return { ...guide, ...parsed, markdown };
});

export function guideById(id: GuideId): Guide {
  const guide = GUIDES.find((item) => item.id === id);
  if (!guide) throw new Error(`Unknown guide ${id}`);
  return guide;
}

export function articleLd(guide: Guide) {
  return articleJsonLd(SITE, guide, guide.h1);
}

const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

export function frenchLongDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  const name = MONTHS[Number(month) - 1];
  if (!name || !day || !year) return iso;
  return `${Number(day)} ${name} ${year}`;
}
