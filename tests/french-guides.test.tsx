// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { htmlPlain, markdownPlain, markdownToArticle } from '../src/content/articleMarkdown.mjs';
import { GUIDES, type GuideId } from '../src/content/guides';
import { untranslatedLocalePath } from '../src/lib/localeSwitch';
import ForIndividuals from '../src/pages/ForIndividuals';
import EmployersGeneva from '../src/pages/employers/Geneva';
import EmployersLuxembourg from '../src/pages/employers/Luxembourg';
import FrenchGuide from '../src/pages/guides/FrenchGuide';
import Home from '../src/pages/Home';
import { frenchGuideDocumentParts } from '../scripts/prerender.mjs';
import { absUrl, BASE, FRENCH_GUIDES, LANGS, llmsTxt, sitemapXml } from '../scripts/seo.mjs';

const ROOT = join(import.meta.dirname, '..');
const PRIVATE = /PrimeLogic|Stathopoulos|NOTE INTERNE|url_article_public|status:\s*DRAFT/;

afterEach(() => {
  cleanup();
  document.head.querySelectorAll('link[data-hreflang], link[rel="canonical"], script#bd-jsonld').forEach((node) => node.remove());
});

function at(path: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/:lang/*" element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('approved French guide text', () => {
  it('renders each article with the same words as the approved markdown', () => {
    for (const guide of GUIDES) {
      const onDisk = readFileSync(join(ROOT, 'src/content/articles', guide.file), 'utf8');
      expect(onDisk).toBe(guide.markdown);
      expect(onDisk).not.toMatch(PRIVATE);
      expect(onDisk).not.toContain('\u2014');
      const parsed = markdownToArticle(onDisk);
      expect(parsed.h1).toBe(guide.h1);
      expect(htmlPlain(`${parsed.h1} ${parsed.bodyHtml}`)).toBe(markdownPlain(onDisk));
      expect(parsed.bodyHtml).not.toContain('<script');
      const urls = [...onDisk.matchAll(/\]\((https?:[^)]+)\)/g)].map((match) => match[1]);
      expect(urls.length).toBeGreaterThanOrEqual(8);
      for (const url of urls) expect(parsed.bodyHtml).toContain(`href="${url}"`);
      if (guide.id === 'geneva') {
        const sentence = guide.description.replace(/ Sources officielles : ge\.ch et AFC\.$/, '');
        const folded = sentence[0].toLowerCase() + sentence.slice(1);
        const plain = markdownPlain(onDisk);
        expect(plain.includes(sentence) || plain.includes(folded)).toBe(true);
        expect(guide.description).toContain('Sources officielles : ge.ch et AFC.');
      } else if (guide.id === 'luxembourg') {
        expect(guide.description).toContain('34 jours');
        expect(onDisk).toContain('34 jours');
        expect(guide.title).toContain('34 jours de télétravail');
      }
    }
  });

  it('keeps the clauses that only changed long dashes for punctuation', () => {
    const lu = GUIDES.find((guide) => guide.id === 'luxembourg')!;
    const ge = GUIDES.find((guide) => guide.id === 'geneva')!;
    expect(lu.markdown).toContain('## 5. Ce que BorderDay peut consigner, et ce qu’il ne fait pas');
    expect(ge.markdown).toContain('## 1. De quoi parle-t-on, et de quoi il ne s’agit pas');
    expect(ge.markdown).toContain('## 3. Comment l’employeur genevois décompte, et pourquoi votre journal doit s’y aligner');
    expect(ge.markdown).toContain('semaine : illustration d’un rythme, pas d’un plafond hebdomadaire autonome.');
    expect(ge.markdown).toContain('Annemasse\u2013Gen\u00e8ve');
    expect(lu.markdown).toContain('L.G. \u2013 Conv. D.I.');
  });
});

describe('French-only routes and discovery', () => {
  it('publishes the French guide URLs and no translated copies', () => {
    expect(FRENCH_GUIDES.map((guide) => guide.path)).toEqual([
      'guides/france-luxembourg-compter-jours-teletravail',
      'guides/france-geneve-compter-jours-teletravail',
      'guides/france-bale-compter-jours-teletravail',
    ]);
    const xml = sitemapXml();
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    for (const guide of FRENCH_GUIDES) {
      const loc = absUrl('fr', guide.path);
      expect(locs.filter((item) => item.includes(guide.path))).toEqual([loc]);
      const block = xml.split('<url>').find((part) => part.includes(`<loc>${loc}</loc>`));
      expect(block).toContain(`<lastmod>${guide.datePublished}</lastmod>`);
      expect(block).toContain(`hreflang="fr" href="${loc}"`);
      expect(block).toContain(`hreflang="x-default" href="${loc}"`);
      expect(block).not.toContain('hreflang="en"');
      expect(block).not.toContain('hreflang="de"');
      expect(block).not.toContain('hreflang="it"');
      expect(block).not.toContain('hreflang="nl"');
    }
    for (const lang of LANGS) {
      if (lang === 'fr' || lang === 'de' || lang === 'it') continue;
      expect(xml).not.toContain(`${BASE}/${lang}/guides/`);
    }
    const llms = llmsTxt();
    expect(llms).toContain(absUrl('fr', 'guides/france-luxembourg-compter-jours-teletravail'));
    expect(llms).toContain(absUrl('fr', 'guides/france-geneve-compter-jours-teletravail'));
    expect(llms).toContain(absUrl('fr', 'guides/france-bale-compter-jours-teletravail'));
    expect(llms).toContain('no translated version');
    expect(llms).not.toContain('/en/guides/');
    expect(llms).not.toMatch(PRIVATE);
  });

  it('static head is French, canonical, and an Article', () => {
    for (const guide of GUIDES) {
      const parts = frenchGuideDocumentParts(guide, guide.h1, guide.bodyHtml);
      const loc = `${BASE}/${guide.lang}/${guide.path}/`;
      expect(parts.title).toBe(guide.title);
      expect(parts.head).toContain(guide.ogImage || '/og.png');
      expect(parts.head).toContain(`rel="canonical" href="${loc}"`);
      expect(parts.head).toContain(`hreflang="${guide.lang}"`);
      expect(parts.head).toContain(`hreflang="x-default" href="${loc}"`);
      expect(parts.head).not.toContain('hreflang="en"');
      expect(parts.head).toContain('og:type" content="article"');
      expect(parts.body).toContain(guide.h1);
      if (guide.lang === 'fr') expect(parts.body).toContain(guide.id === 'luxembourg' ? '34 jours' : '40 %');
      const article = parts.graph.find((node) => node['@type'] === 'Article');
      expect(article.inLanguage).toBe(guide.lang);
      expect(article.datePublished).toBe(guide.datePublished);
      expect(article.author).toEqual({ '@id': `${BASE}/#org` });
      expect(JSON.stringify(article)).not.toMatch(PRIVATE);
    }
  });

  it('shows the Luxembourg guide in French and sends other languages to the employer page', () => {
    at('/fr/guides/france-luxembourg-compter-jours-teletravail', <FrenchGuide id="luxembourg" />);
    expect(screen.getByRole('heading', { level: 1, name: /travailler au Luxembourg/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Légifrance' }).getAttribute('href')).toBe(
      'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051529100',
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${BASE}/fr/guides/france-luxembourg-compter-jours-teletravail/`,
    );
    const langs = [...document.querySelectorAll('link[data-hreflang]')].map((node) => node.getAttribute('hreflang'));
    expect(langs).toEqual(['fr', 'x-default']);
    const graph = JSON.parse(document.getElementById('bd-jsonld')!.textContent!)['@graph'];
    expect(graph.some((node: { '@type': string }) => node['@type'] === 'Article')).toBe(true);
    expect(document.body.textContent).not.toMatch(/€|4,99/);
    cleanup();

    render(
      <MemoryRouter initialEntries={['/de/guides/france-luxembourg-compter-jours-teletravail']}>
        <Routes>
          <Route path="/:lang/guides/france-luxembourg-compter-jours-teletravail" element={<FrenchGuide id="luxembourg" />} />
          <Route path="/:lang/employers/luxembourg" element={<h1>Employer page</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Employer page' })).toBeTruthy();
  });

  it('shows the Geneva guide and its official ge.ch source', () => {
    at('/fr/guides/france-geneve-compter-jours-teletravail', <FrenchGuide id="geneva" />);
    expect(screen.getByRole('heading', { level: 1, name: /travailler à Genève/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Vue d.ensemble/ }).getAttribute('href')).toBe(
      'https://www.ge.ch/imposition-du-teletravail-personnes-frontalieres',
    );
    expect(screen.getByRole('navigation', { name: 'Autres guides' })).toBeTruthy();
  });

  it('links the guides from French pages and leaves English pages alone', () => {
    at('/fr/', <Home />);
    expect(screen.getByRole('link', { name: /travailler au Luxembourg/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /travailler à Genève/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /travailler à Bâle/ })).toBeTruthy();
    cleanup();

    at('/en/', <Home />);
    expect(screen.getByRole('heading', { level: 1, name: /One place for every border/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /travailler au Luxembourg/ })).toBeNull();
    cleanup();

    at('/fr/for-individuals', <ForIndividuals />);
    expect(screen.getAllByRole('link', { name: /travailler au Luxembourg|travailler à Genève|travailler à Bâle/ })).toHaveLength(3);
    cleanup();

    at('/en/for-individuals', <ForIndividuals />);
    expect(screen.queryByRole('link', { name: /travailler au Luxembourg/ })).toBeNull();
    cleanup();

    at('/fr/employers/luxembourg', <EmployersLuxembourg />);
    expect(screen.getByRole('link', { name: /travailler au Luxembourg/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /travailler à Genève/ })).toBeNull();
    cleanup();

    at('/en/employers/luxembourg', <EmployersLuxembourg />);
    expect(screen.queryByText('Pour les salariés qui résident en France')).toBeNull();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Luxembourg/i);
    cleanup();

    at('/en/employers/geneva', <EmployersGeneva />);
    expect(screen.queryByRole('link', { name: /travailler à Genève/ })).toBeNull();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Geneva|Genève/i);
  });

  it('language switch from a guide opens the existing employer page', () => {
    const lu = '/fr/guides/france-luxembourg-compter-jours-teletravail/';
    const ge = '/fr/guides/france-geneve-compter-jours-teletravail';
    for (const lang of ['en', 'de', 'it', 'nl'] as const) {
      expect(untranslatedLocalePath(lu, lang)).toBe(`/${lang}/employers/luxembourg/`);
      expect(untranslatedLocalePath(ge, lang)).toBe(`/${lang}/employers/geneva/`);
    }
    expect(untranslatedLocalePath('/fr/guides/', 'en')).toBe('/en/');
    expect(untranslatedLocalePath('/fr/guides', 'de')).toBe('/de/guides/');
    expect(untranslatedLocalePath('/fr/guides/', 'it')).toBe('/it/guides/');
    expect(untranslatedLocalePath('/de/guides/', 'nl')).toBe('/nl/');
    expect(untranslatedLocalePath('/fr/guides/france-bale-compter-jours-teletravail/', 'de')).toBe('/de/');
    expect(untranslatedLocalePath('/it/guides/italia-ticino-contare-giorni-telelavoro/', 'fr')).toBe('/fr/employers/ticino/');
    expect(untranslatedLocalePath(lu, 'fr')).toBeNull();
    expect(untranslatedLocalePath('/fr/pricing/', 'de')).toBeNull();
    expect(untranslatedLocalePath('/en/pricing/', 'fr')).toBeNull();
  });
});

describe('Basel, Germany and Ticino guides', () => {
  it('keeps the approved wording, product limits, and official cross-links', () => {
    const bale = GUIDES.find((guide) => guide.id === 'bale')!;
    const de = GUIDES.find((guide) => guide.id === 'deCh')!;
    const it = GUIDES.find((guide) => guide.id === 'ticinoIt')!;
    for (const guide of [bale, de, it]) {
      expect(guide.markdown).not.toContain("'");
      expect(guide.markdown).not.toContain('ß');
      expect(guide.markdown).not.toMatch(/3 h|110 km/);
      expect(guide.datePublished).toBe('2026-11-09');
    }
    expect(bale.markdown).toContain('https://borderday.com/fr/guides/france-geneve-compter-jours-teletravail/');
    expect(bale.markdown).toContain('BorderDay ne distingue pas une mission en France d’une mission dans un État tiers');
    expect(bale.markdown).toContain('n’applique pas la règle des 20 %');
    expect(de.markdown).toContain('100 Kilometer');
    expect(de.markdown).toContain('1,5 Stunden');
    expect(de.markdown).toContain('regelmässig');
    expect(it.markdown).toContain('240');
    expect(it.markdown).toContain('SFI');
    expect(it.markdown).not.toMatch(/FSIO|regole normali dell’accordo/);
  });
});

describe('guide ids stay the approved routes', () => {
  it('publishes the five written guides', () => {
    const ids: GuideId[] = GUIDES.map((guide) => guide.id);
    expect(ids).toEqual(['luxembourg', 'geneva', 'bale', 'deCh', 'ticinoIt']);
  });
});
