import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  AI_BOTS,
  BASE,
  BRAND,
  CFG,
  FAQ,
  FRENCH_GUIDES,
  INDEXNOW_KEY,
  LANGS,
  SITEMAP_PATHS,
  NOINDEX_PATHS,
  PAGE_FAQS,
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

  it('sitemap lists marketing, employer, pricing, FAQ, individuals and guides', () => {
    const xml = sitemapXml();
    expect(xml).toContain('xmlns:xhtml');
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toHaveLength(SITEMAP_PATHS.length * LANGS.length + 1 + FRENCH_GUIDES.length);
    for (const path of SITEMAP_PATHS) {
      for (const lang of LANGS) {
        const loc = absUrl(lang, path);
        expect(locs).toContain(loc);
        expect(xml).toContain(`hreflang="${lang}" href="${loc}"`);
        const block = xml.split('<url>').find((part) => part.includes(`<loc>${loc}</loc>`));
        expect(block).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
      }
      expect(xml).toContain(`hreflang="x-default" href="${absUrl('en', path)}"`);
    }
    expect(locs).toContain(`${BASE}/fr/guides/`);
    expect(xml).not.toContain(`${BASE}/en/privacy/`);
    expect(xml).not.toContain(`${BASE}/fr/company/signup/`);
    expect(xml).not.toContain(`${BASE}/en/terms/`);
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

  it('every PUBLIC_PATH has copy in all languages with unique titles', () => {
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
    expect(short).toMatch(/1983-agreement cantons←France \(40% \/ 10 mission days \/ 45 work nights/);
    expect(short).toMatch(/Belgium→Luxembourg/);
    expect(short).toMatch(/Germany→Luxembourg/);
    expect(short).toMatch(/No general tax counter:.*France→Belgium \(no day limit\), Netherlands→Belgium/s);
    expect(short).not.toMatch(/No general tax counter:.*Belgium→Luxembourg/s);
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


describe('employer SEO landing pages', () => {
  it('exposes Ticino, Geneva and Luxembourg employer paths in PUBLIC_PATHS and PAGES', () => {
    expect(PUBLIC_PATHS).toEqual(
      expect.arrayContaining(['employers/ticino', 'employers/geneva', 'employers/luxembourg']),
    );
    for (const path of ['employers/ticino', 'employers/geneva', 'employers/luxembourg']) {
      expect(PAGES[path]).toBeTruthy();
      for (const lang of LANGS) {
        const page = PAGES[path][lang];
        expect(page.title).not.toMatch(SLOGAN);
        expect(page.summary).not.toMatch(SLOGAN);
        expect(page.summary).not.toMatch(OWNER);
      }
    }
  });

  it('Luxembourg employer copy covers FR, BE and DE routes with 34-day tax and 50% SS', () => {
    for (const lang of LANGS) {
      const blob = `${PAGES['employers/luxembourg'][lang].title} ${PAGES['employers/luxembourg'][lang].description} ${PAGES['employers/luxembourg'][lang].h1} ${PAGES['employers/luxembourg'][lang].summary}`;
      expect(blob).toMatch(/34/);
      expect(blob).toMatch(/50%/);
      expect(blob.toLowerCase()).toMatch(/france|frankreich|francia|frankrijk/);
      expect(blob.toLowerCase()).toMatch(/belgium|belgien|belgio|belgië|belgique/);
      expect(blob.toLowerCase()).toMatch(/germany|deutschland|germania|duitsland|allemagne/);
    }
  });

  it('Ticino employer copy covers Italy route with 25% telework and 45 non-return days', () => {
    for (const lang of LANGS) {
      const blob = `${PAGES['employers/ticino'][lang].title} ${PAGES['employers/ticino'][lang].description} ${PAGES['employers/ticino'][lang].h1} ${PAGES['employers/ticino'][lang].summary}`;
      expect(blob).toMatch(/25%/);
      expect(blob).toMatch(/45/);
      expect(blob.toLowerCase()).toMatch(/ital|italien|italia/);
      expect(blob.toLowerCase()).toMatch(/ticino|tessin/);
    }
  });

  it('PAGE_FAQS provide five Q&A pairs per employer page and language', () => {
    for (const path of ['employers/ticino', 'employers/geneva', 'employers/luxembourg']) {
      expect(PAGE_FAQS[path]).toBeTruthy();
      for (const lang of LANGS) {
        const pairs = PAGE_FAQS[path][lang];
        expect(pairs).toHaveLength(5);
        const ld = faqLd(lang, pairs);
        expect(ld.mainEntity).toHaveLength(5);
      }
    }
  });

  it('llms.txt lists the employer landing URLs', () => {
    const short = llmsTxt();
    expect(short).toContain(`${BASE}/en/employers/ticino/`);
    expect(short).toContain(`${BASE}/en/employers/geneva/`);
    expect(short).toContain(`${BASE}/en/employers/luxembourg/`);
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
        expect(title!.replaceAll('&amp;', '&')).toBe(PAGES[path][lang].title);
        seenTitles.add(`${lang}:${title}`);
        expect(html).toContain(`rel="canonical" href="${absUrl(lang, path)}"`);
        expect(html).toContain('hreflang="x-default"');
        expect(html).toContain('application/ld+json');
        expect(html).toContain('id="summary"');
        expect(html).toContain('/og.png');
        const legal = ['privacy', 'terms', 'dpa'].includes(path);
        if (!legal) expect(html).not.toMatch(/PrimeLogic|Stathopoulos/i);
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
