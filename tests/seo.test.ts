import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  AI_BOTS,
  BASE,
  BRAND,
  CFG,
  FAQ,
  INDEXNOW_KEY,
  LANGS,
  LASTMOD,
  NOINDEX_PATHS,
  PAGES,
  PUBLIC_PATHS,
  TAX_COUNTER_CORRIDORS,
  absUrl,
  breadcrumbLd,
  faqLd,
  llmsFullTxt,
  llmsTxt,
  organizationLd,
  robotsTxt,
  sitemapXml,
  softwareApplicationLd,
  websiteLd,
} from '../scripts/seo.mjs';

import { BORDER_PACKS, hasTaxCounter } from '../src/borders/packs';

const OWNER = /PrimeLogic|Stathopoulos|CHE-312\.418\.158|Cours des Bastions/i;
const SLOGAN = /\bfrontalier\b|\bGrenzgänger\b/i;
const ROOT = join(import.meta.dirname, '..');

describe('SEO generators', () => {
  it('robots allows AI crawlers and disallows app/auth/dashboard', () => {
    const t = robotsTxt();
    expect(t).toMatch(/^User-agent: \*\nAllow: \//);
    expect(t).toContain(`Sitemap: ${BASE}/sitemap.xml`);
    for (const b of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'OAI-SearchBot']) {
      expect(t).toContain(`User-agent: ${b}`);
    }
    for (const b of AI_BOTS) expect(t).toContain(`User-agent: ${b}`);
    expect(t).toContain('Disallow: /*/app');
    expect(t).toContain('Disallow: /*/auth/');
    expect(t).toContain('Disallow: /auth/');
    expect(t).toContain('Disallow: /*/company/dashboard');
    expect(t).toContain('Disallow: /*/demo');
    expect(t).not.toMatch(OWNER);
  });

  it('sitemap lists every public localized URL with hreflang and lastmod', () => {
    const xml = sitemapXml();
    expect(xml).toContain('xmlns:xhtml');
    expect(xml).toContain(`<lastmod>${LASTMOD}</lastmod>`);
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toHaveLength(PUBLIC_PATHS.length * LANGS.length);
    for (const path of PUBLIC_PATHS) {
      for (const lang of LANGS) {
        const loc = absUrl(lang, path);
        expect(locs).toContain(loc);
        expect(xml).toContain(`hreflang="${lang}" href="${loc}"`);
      }
      expect(xml).toContain(`hreflang="x-default" href="${absUrl('en', path)}"`);
    }
    expect(xml).not.toMatch(OWNER);
  });

  it('llms.txt and llms-full.txt are employer-first with real prices', () => {
    const short = llmsTxt();
    const full = llmsFullTxt();
    expect(short.startsWith(`# ${BRAND}`)).toBe(true);
    expect(short).toMatch(/employer-first/i);
    expect(short).toContain('€5');
    expect(short).toContain('€39');
    expect(short).toContain('€4.99');
    expect(short).toContain('€49');
    expect(short).toContain('€390');
    expect(short).toContain('7-day');
    expect(short).toContain('hello@borderday.com');
    expect(short).toContain(`${BASE}/llms-full.txt`);
    expect(short).toMatch(/frontalier|Grenzgänger/i); // branding note forbids the slogan
    expect(short).toContain('Do not describe BorderDay using the slogan word');
    expect(full.startsWith(short)).toBe(true);
    expect(full).toContain('## FAQ (English)');
    for (const [q] of FAQ.en) expect(full).toContain(q);
    expect(short).not.toMatch(/PrimeLogic|Stathopoulos|CHE-312/i);
    expect(full).not.toMatch(/PrimeLogic|Stathopoulos|CHE-312/i);
  });

  it('JSON-LD Organization, SoftwareApplication offers, FAQ, Breadcrumb', () => {
    const org = organizationLd();
    expect(org.name).toBe('BorderDay');
    expect(org.url).toBe(`${BASE}/`);
    expect(org.email).toBe('hello@borderday.com');
    expect(JSON.stringify(org)).not.toMatch(OWNER);

    const app = softwareApplicationLd();
    expect(app['@type']).toBe('SoftwareApplication');
    const prices = app.offers.map((o: { price: string }) => o.price).sort();
    expect(prices).toEqual(['390.00', '4.99', '49.00', '5.00']);
    for (const o of app.offers) {
      expect(o.priceCurrency).toBe('EUR');
      expect(o.availability).toBe('https://schema.org/InStock');
    }

    const faq = faqLd('en');
    expect(faq['@type']).toBe('FAQPage');
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(5);

    const crumbs = breadcrumbLd('en', [
      ['Home', ''],
      ['Pricing', 'pricing'],
    ]);
    expect(crumbs.itemListElement[1].item).toBe(`${BASE}/en/pricing/`);

    const site = websiteLd();
    expect(site.publisher['@id']).toBe(org['@id']);
  });

  it('every PUBLIC_PATH has copy in all 4 languages with unique titles', () => {
    const titles = new Set<string>();
    for (const path of PUBLIC_PATHS) {
      expect(PAGES[path]).toBeTruthy();
      for (const lang of LANGS) {
        const page = PAGES[path][lang];
        expect(page.title.length).toBeGreaterThan(10);
        expect(page.description.length).toBeGreaterThan(40);
        expect(page.h1.length).toBeGreaterThanOrEqual(3);
        expect(page.summary.length).toBeGreaterThan(40);
        expect(page.summary).not.toMatch(OWNER);
        expect(page.title).not.toMatch(OWNER);
        expect(page.summary).not.toMatch(SLOGAN);
        expect(page.title).not.toMatch(SLOGAN);
        titles.add(`${lang}:${page.title}`);
      }
    }
    expect(titles.size).toBe(PUBLIC_PATHS.length * LANGS.length);
  });

  it('IndexNow key is a public hex string and config has verify hooks', () => {
    expect(INDEXNOW_KEY).toMatch(/^[a-f0-9]{32}$/);
    expect(CFG.verify).toHaveProperty('google_site_verification');
    expect(CFG.verify).toHaveProperty('msvalidate.01');
    expect(CFG.og_image).toBe('/og.png');
  });

  it('NOINDEX_PATHS cover app and auth shells', () => {
    expect(NOINDEX_PATHS).toEqual(
      expect.arrayContaining(['app', 'auth/sign-in', 'auth/sign-up', 'auth/callback', 'company/dashboard', 'demo']),
    );
  });
});

describe('honest coverage in SEO copy', () => {
  it('the published corridor list matches what the packs actually do', () => {
    expect(TAX_COUNTER_CORRIDORS).toEqual(BORDER_PACKS.filter(hasTaxCounter).map((p) => p.id));
  });

  it('llms names which corridors have tax counters and which do not', () => {
    const short = llmsTxt();
    expect(short).toMatch(/Tax counters running: Geneva and other non-1983 cantons/);
    expect(short).toMatch(/No tax counter yet: 1983-agreement cantons/);
    expect(short).toMatch(/Belgium→Luxembourg, Germany→Luxembourg, France→Belgium, Netherlands→Belgium/);
    expect(short).toMatch(/25%/);
    expect(short).not.toMatch(/Romandie|five borders|official tax and social-security/);
  });

  it('no page copy in any language keeps the old claims', () => {
    const blob = JSON.stringify(PAGES) + JSON.stringify(FAQ) + llmsFullTxt();
    expect(blob).not.toMatch(/Romandi[ea]|five borders|cinq frontières|fünf Grenzen|cinque frontiere/);
  });

  it('FAQ has an out-of-scope answer in every language', () => {
    for (const lang of LANGS) expect(FAQ[lang].some(([, a]: string[]) => a.includes('CSV'))).toBe(true);
  });
});

describe('SEO artifacts on disk', () => {
  it('public/llms*.txt match the generators', () => {
    expect(readFileSync(join(ROOT, 'public/llms.txt'), 'utf8')).toBe(llmsTxt());
    expect(readFileSync(join(ROOT, 'public/llms-full.txt'), 'utf8')).toBe(llmsFullTxt());
  });

  it('public/og.png exists and is a PNG', () => {
    const buf = readFileSync(join(ROOT, 'public/og.png'));
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50);
    expect(buf[2]).toBe(0x4e);
    expect(buf[3]).toBe(0x47);
    expect(buf.length).toBeGreaterThan(5000);
  });

  it('when dist exists, prerendered HTML has unique titles and JSON-LD', () => {
    const dist = join(ROOT, 'dist');
    if (!existsSync(join(dist, 'llms-full.txt'))) return; // skip until prerender ran
    const robots = readFileSync(join(dist, 'robots.txt'), 'utf8');
    expect(robots).toContain('GPTBot');
    expect(robots).toContain('Disallow: /*/app');

    const sm = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
    expect(sm).toContain(`${BASE}/en/pricing`);

    const llms = readFileSync(join(dist, 'llms.txt'), 'utf8');
    expect(llms).not.toMatch(/PrimeLogic|Stathopoulos/i);
    expect(llms).toContain('employer-first');

    const key = readFileSync(join(dist, `${INDEXNOW_KEY}.txt`), 'utf8').trim();
    expect(key).toBe(INDEXNOW_KEY);

    const seenTitles = new Set<string>();
    for (const path of PUBLIC_PATHS) {
      for (const lang of LANGS) {
        const rel = path ? `${lang}/${path}/index.html` : `${lang}/index.html`;
        const html = readFileSync(join(dist, rel), 'utf8');
        const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
        expect(title).toBeTruthy();
        expect(title).toBe(PAGES[path][lang].title);
        seenTitles.add(`${lang}:${title}`);
        expect(html).toContain(`rel="canonical" href="${absUrl(lang, path)}"`);
        expect(html).toContain('hreflang="x-default"');
        expect(html).toContain('application/ld+json');
        expect(html).toContain('id="summary"');
        expect(html).toContain('/og.png');
        expect(html).not.toMatch(/PrimeLogic|Stathopoulos/i);
        const ld = html.match(/application\/ld\+json">([^<]+)</)?.[1];
        expect(ld).toBeTruthy();
        const parsed = JSON.parse(ld!);
        expect(parsed['@graph'].some((n: { '@type': string }) => n['@type'] === 'Organization')).toBe(
          true,
        );
        expect(
          parsed['@graph'].some((n: { '@type': string }) => n['@type'] === 'SoftwareApplication'),
        ).toBe(true);
      }
    }
    expect(seenTitles.size).toBe(PUBLIC_PATHS.length * LANGS.length);

    // noindex shells
    const appHtml = readFileSync(join(dist, 'en/app/index.html'), 'utf8');
    expect(appHtml).toContain('noindex');
  });
});
