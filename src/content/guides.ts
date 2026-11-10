import ge from './articles/fr-geneve.md?raw';
import lu from './articles/fr-luxembourg.md?raw';
import bale from './articles/fr-bale.md?raw';
import deCh from './articles/de-basel.md?raw';
import ticinoIt from './articles/it-ticino.md?raw';
import enGeneva from './articles/en-geneva.md?raw';
import enLuxembourg from './articles/en-luxembourg.md?raw';
import enTrack from './articles/en-track.md?raw';
import { markdownToArticle } from './articleMarkdown.mjs';
import { articleJsonLd } from './articleSchema.mjs';
import meta from './guides.json';

export const SITE = 'https://borderday.com';

export type GuideLang = 'en' | 'fr' | 'de' | 'it';

export type GuideId =
  | 'luxembourg'
  | 'geneva'
  | 'bale'
  | 'deCh'
  | 'ticinoIt'
  | 'enGeneva'
  | 'enLuxembourg'
  | 'enTrack';

export interface GuideMeta {
  id: GuideId;
  lang: GuideLang;
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
  bale,
  deCh,
  ticinoIt,
  enGeneva,
  enLuxembourg,
  enTrack,
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

export function guidesFor(lang: string): Guide[] {
  return GUIDES.filter((guide) => guide.lang === lang);
}

export function guideById(id: GuideId): Guide {
  const guide = GUIDES.find((item) => item.id === id);
  if (!guide) throw new Error(`Unknown guide ${id}`);
  return guide;
}

export function articleLd(guide: Guide) {
  return articleJsonLd(SITE, guide, guide.h1);
}

const MONTHS: Record<GuideLang, string[]> = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  fr: [
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
  ],
  de: [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ],
  it: [
    'gennaio',
    'febbraio',
    'marzo',
    'aprile',
    'maggio',
    'giugno',
    'luglio',
    'agosto',
    'settembre',
    'ottobre',
    'novembre',
    'dicembre',
  ],
};

export function guideLongDate(lang: string, iso: string): string {
  const [year, month, day] = iso.split('-');
  const name = MONTHS[lang as GuideLang]?.[Number(month) - 1];
  if (!name || !day || !year) return iso;
  if (lang === 'de') return `${Number(day)}. ${name} ${year}`;
  return `${Number(day)} ${name} ${year}`;
}

export function frenchLongDate(iso: string): string {
  return guideLongDate('fr', iso);
}
