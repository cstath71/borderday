import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  AI_BOTS,
  BASE,
  BRAND,
  CFG,
  FAQ,
  ALL_GUIDES,
  GUIDE_HUB_LANGS,
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
  hubIndexMarkdown,
  llmsFullTxt,
  llmsTxt,
  sitemapLocs,
  organizationLd,
  robotsTxt,
  sitemapXml,
  softwareApplicationLd,
  websiteLd,
} from '../scripts/seo.mjs';

import { BORDER_PACKS, hasTaxCounter } from '../src/borders/packs';
import { HUB_BY_LANG } from '../src/content/guideHub.mjs';

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
    expect(locs).toHaveLength(SITEMAP_PATHS.length * LANGS.length + GUIDE_HUB_LANGS.length + ALL_GUIDES.length);
    expect(locs).toHaveLength(47);
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
    expect(locs).toContain(`${BASE}/de/guides/`);
    expect(locs).toContain(`${BASE}/it/guides/`);
    expect(locs).toContain(`${BASE}/fr/guides/france-bale-compter-jours-teletravail/`);
    expect(locs).toContain(`${BASE}/de/guides/deutschland-schweiz-grenzgaenger-tage-zaehlen/`);
    expect(locs).toContain(`${BASE}/it/guides/italia-ticino-contare-giorni-telelavoro/`);
    expect(locs).toContain(`${BASE}/en/guides/`);
    expect(locs).toContain(`${BASE}/en/guides/france-geneva-telework-days/`);
    expect(locs).toContain(`${BASE}/en/guides/france-luxembourg-telework-days/`);
    expect(locs).toContain(`${BASE}/en/guides/how-to-track-cross-border-telework-days/`);
    expect(xml).not.toContain(`${BASE}/nl/guides/`);
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
    const locs = sitemapLocs();
    expect(locs).toHaveLength(47);
    expect(locs).toEqual([...sitemapXml().matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]));
    const listed = full.split('## Sitemap\n\n')[1].trim().split('\n').map((line) => line.replace(/^- /, ''));
    expect(listed).toEqual(locs);
    for (const lang of GUIDE_HUB_LANGS) {
      expect(listed).toContain(`${BASE}/${lang}/guides/`);
      expect(short).toContain(`${BASE}/${lang}/guides/`);
      expect(short).toContain(`${absUrl(lang, 'guides')}index.md`);
    }
    for (const guide of ALL_GUIDES) {
      const loc = absUrl(guide.lang || 'fr', guide.path);
      expect(listed).toContain(loc);
      expect(short).toContain(loc);
      expect(short).toContain(`${loc}index.md`);
    }
  });

  it('guide hub index.md lists each guide title, summary and canonical URL', () => {
    for (const lang of GUIDE_HUB_LANGS) {
      const hub = HUB_BY_LANG[lang as 'fr' | 'de' | 'it'];
      const md = hubIndexMarkdown(lang);
      expect(md.startsWith(`# ${hub.h1}\n`)).toBe(true);
      expect(md).toContain(hub.intro);
      const guides = ALL_GUIDES.filter((guide) => (guide.lang || 'fr') === lang);
      expect(guides.length).toBeGreaterThan(0);
      for (const guide of guides) {
        expect(md).toContain(`## ${guide.title}`);
        expect(md).toContain(guide.description);
        expect(md).toContain(absUrl(lang, guide.path));
      }
      expect(md).not.toMatch(OWNER);
      expect(readFileSync(join(ROOT, 'public', lang, 'guides', 'index.md'), 'utf8')).toBe(md);
    }
  });

  it('JSON-LD Organization, SoftwareApplication offers, FAQ, Breadcrumb', () => {
    const org = organizationLd();
    expect(org.name).toBe('BorderDay');
    expect(org.url).toBe(`${BASE}/`);
    expect(org.email).toBe('hello@borderday.com');
    expect(org.description).toBe(
      'BorderDay is a cross-border telework day tracker for employers and employees. It counts telework, on-site and travel day types against published social-security and tax limits: social-security counters on nine border routes, tax counters on seven. Day types only, no GPS. A tracking tool, not tax or legal advice.',
    );
    expect(org.disambiguatingDescription).toBe(
      'A day-type tracker for cross-border telework, on-site and travel days against published tax and social-security limits. Not a residency, 183-day or Schengen travel-day counter.',
    );
    expect(org.alternateName).toBeUndefined();
    expect(org.sameAs).toEqual(['https://www.linkedin.com/company/borderday/']);
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

    const site = websiteLd('en');
    expect(site.publisher['@id']).toBe(org['@id']);
    expect(site.description).toBe(PAGES[''].en.description);
    expect(site.description).toBe(
      'Employer telework day tracker. Social-security counters on nine border routes, tax on seven. Day types only, no GPS. Not a residency or Schengen counter.',
    );
  });

  it('titles stay within 60 characters and descriptions within 155', () => {
    for (const path of SITEMAP_PATHS) {
      for (const lang of LANGS) {
        expect([...PAGES[path][lang].title].length).toBeLessThanOrEqual(60);
        expect([...PAGES[path][lang].description].length).toBeLessThanOrEqual(155);
      }
    }
    for (const hub of Object.values(HUB_BY_LANG)) {
      expect([...hub.title].length).toBeLessThanOrEqual(60);
      expect([...hub.description].length).toBeLessThanOrEqual(155);
    }
    for (const guide of ALL_GUIDES) {
      expect([...guide.title].length).toBeLessThanOrEqual(60);
      const descriptionLength = [...guide.description].length;
      if (guide.id === 'enGeneva') {
        expect(guide.description).toBe(
          'Live in France, work in Geneva? Telework from France stays taxable in Switzerland up to 40% of annual working time, including up to 10 mission days. Sources.',
        );
        expect(descriptionLength).toBe(157);
      } else {
        expect(descriptionLength).toBeLessThanOrEqual(155);
      }
    }
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
        // French HTML titles may use frontalier as the search term. Summaries and other languages stay clear of it.
        if (lang !== 'fr') expect(page.title).not.toMatch(SLOGAN);
        titles.add(`${lang}:${page.title}`);
      }
    }
    expect(titles.size).toBe(PUBLIC_PATHS.length * LANGS.length);
  });

  it('French HTML titles or descriptions use frontalier within the length limits', () => {
    const word = /frontaliers?/i;
    const dash = /[\u2014\u2013]/;
    const pages: Array<[string, 'title' | 'description']> = [
      ['', 'title'],
      ['pricing', 'title'],
      ['faq', 'title'],
      ['for-individuals', 'title'],
      ['employers/ticino', 'description'],
      ['employers/geneva', 'description'],
      ['employers/luxembourg', 'description'],
    ];
    for (const [path, field] of pages) {
      const page = PAGES[path].fr;
      expect(`${page.title} ${page.description}`, path).toMatch(word);
      expect([...page.title].length, path).toBeLessThanOrEqual(60);
      expect([...page.description].length, path).toBeLessThanOrEqual(155);
      expect(page[field], path).not.toMatch(dash);
    }
    const hub = HUB_BY_LANG.fr;
    expect(`${hub.title} ${hub.description}`).toMatch(word);
    expect([...hub.title].length).toBeLessThanOrEqual(60);
    expect(hub.title).not.toMatch(dash);
    for (const id of ['luxembourg', 'geneva', 'bale']) {
      const guide = ALL_GUIDES.find((item) => item.id === id);
      expect(guide, id).toBeTruthy();
      expect(`${guide!.title} ${guide!.description}`, id).toMatch(word);
      expect([...guide!.title].length, id).toBeLessThanOrEqual(60);
      expect([...guide!.description].length, id).toBeLessThanOrEqual(155);
      expect(`${guide!.title} ${guide!.description}`, id).not.toMatch(dash);
    }
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
    expect(short).toMatch(/1983-agreement cantons←France \(40% \/ 10 mission days \/ 45 overnight stays away from the residence state/);
    expect(short).toMatch(/at most one Swiss night per working week/);
    expect(short).toMatch(/extra third-state mission days beyond the 10 and the 40% also count/);
    expect(short).not.toMatch(/45 work nights/);
    expect(short).not.toMatch(/normal rules of the agreement apply/);
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
        if (lang !== 'fr') expect(page.title).not.toMatch(SLOGAN);
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

    const homeLd = JSON.parse(readFileSync(join(dist, 'en/index.html'), 'utf8').match(/application\/ld\+json">([^<]+)</)![1]);
    const org = homeLd['@graph'].find((node: { '@type': string }) => node['@type'] === 'Organization');
    expect(org.description).toContain('tax counters on seven');
    expect(org.disambiguatingDescription).toContain('Not a residency, 183-day or Schengen travel-day counter.');
    expect(org.alternateName).toBeUndefined();
    expect([...sm.matchAll(/<loc>/g)]).toHaveLength(47);
    for (const rel of [
      'en/guides/index.html',
      'en/guides/france-geneva-telework-days/index.html',
      'en/guides/france-luxembourg-telework-days/index.html',
      'en/guides/how-to-track-cross-border-telework-days/index.html',
    ]) {
      const html = readFileSync(join(dist, rel), 'utf8');
      expect(html).toContain('hreflang="en"');
      expect(html).not.toContain('hreflang="fr"');
      if (rel === 'en/guides/index.html') continue;
      expect(html).toMatch(/<time class="article-kicker" datetime="2026-11-10">/);
      expect(html).toMatch(/<p class="lede"><strong>Short answer:<\/strong>/);
    }
    expect(readFileSync(join(dist, 'en/guides/index.md'), 'utf8')).toContain('How to track cross-border telework days | BorderDay');

    // noindex shells
    const appHtml = readFileSync(join(dist, 'en/app/index.html'), 'utf8');
    expect(appHtml).toContain('noindex');

    const full = readFileSync(join(dist, 'llms-full.txt'), 'utf8');
    const listed = full.split('## Sitemap\n\n')[1].trim().split('\n');
    expect(listed).toHaveLength(47);

    for (const guide of ALL_GUIDES) {
      const lang = guide.lang || 'fr';
      const html = readFileSync(join(dist, lang, guide.path, 'index.html'), 'utf8');
      const firstP = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/);
      expect(firstP, guide.path).toBeTruthy();
      const text = firstP![1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
      const lead = guide.lang === 'de' ? 'Kurz gesagt' : guide.lang === 'it' ? 'In breve' : guide.lang === 'en' ? 'Short answer' : 'En bref';
      expect(text.startsWith(lead)).toBe(true);
      expect(html).toContain(`<time class="article-kicker" datetime="${guide.datePublished}">`);
      expect(html).not.toContain('<p class="article-kicker"');
      expect(html).toContain(`"datePublished":"${guide.datePublished}"`);
      expect(html).toContain(`"dateModified":"${guide.dateModified || guide.datePublished}"`);
      expect(readFileSync(join(dist, lang, guide.path, 'index.md'), 'utf8').length).toBeGreaterThan(80);
    }
    for (const lang of GUIDE_HUB_LANGS) {
      expect(readFileSync(join(dist, lang, 'guides', 'index.md'), 'utf8')).toBe(hubIndexMarkdown(lang));
    }
  });
});
