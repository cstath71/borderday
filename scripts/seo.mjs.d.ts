/** Ambient types for scripts/seo.mjs (used by Vitest). */
export const CFG: {
  base_url: string;
  brand: string;
  indexnow_key: string;
  contact_email: string;
  og_image: string;
  logo: string;
  verify: { google_site_verification: string; 'msvalidate.01': string };
  lastmod: string;
};
export const BASE: string;
export const BRAND: string;
export const INDEXNOW_KEY: string;
export const LANGS: string[];
export const LASTMOD: string;
export const AI_BOTS: string[];
export const PUBLIC_PATHS: string[];
export const ALL_GUIDES: {
  id: string;
  lang?: string;
  path: string;
  file: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  fallbackPath: string;
}[];
export const GUIDE_HUB_LANGS: string[];
export const FRENCH_GUIDES: {
  id: string;
  path: string;
  file: string;
  description: string;
  datePublished: string;
  fallbackPath: string;
}[];
export const NOINDEX_PATHS: string[];
export const IN_SHORT_LABEL: Record<string, string>;
export const PAGES: Record<
  string,
  Record<string, { title: string; description: string; h1: string; summary: string; crumbs: [string, string][] }>
>;
export const FAQ: Record<string, [string, string][]>;
export const PAGE_FAQS: Record<string, Record<string, [string, string][]>>;
export function esc(s: string): string;
export function absUrl(lang: string, path: string): string;
export function pageFile(lang: string, path: string): string;
export function robotsTxt(): string;
export function sitemapEntries(): {
  loc: string;
  lastmod: string;
  alternates: { hreflang: string; href: string }[];
  xDefault: string;
}[];
export function sitemapLocs(): string[];
export function sitemapXml(): string;
export function hubIndexMarkdown(lang: string): string;
export function organizationLd(): Record<string, unknown>;
export function websiteLd(): Record<string, unknown> & { publisher: { '@id': string } };
export function softwareApplicationLd(): {
  '@type': string;
  offers: { price: string; priceCurrency: string; availability: string }[];
};
export function breadcrumbLd(
  lang: string,
  crumbs: [string, string][],
): { itemListElement: { item: string }[] };
export function faqLd(lang: string, pairs?: [string, string][]): { '@type': string; mainEntity: unknown[] };
export function ldScript(graph: unknown[]): string;
export function llmsTxt(): string;
export function llmsFullTxt(): string;
export function verificationMetas(): string;
