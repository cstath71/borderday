// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { BORDER_PACKS } from '../src/borders/packs';
import Faq from '../src/pages/Faq';
import Home from '../src/pages/Home';
import EmployersGeneva from '../src/pages/employers/Geneva';
import EmployersLuxembourg from '../src/pages/employers/Luxembourg';
import EmployersTicino from '../src/pages/employers/Ticino';
import FrenchGuide from '../src/pages/guides/FrenchGuide';
import { publicPath } from '../src/lib/publicPath';
import heads from '../src/seo/heads.json';
import { LANGS, PAGES, organizationLd, sitemapXml } from '../scripts/seo.mjs';

const ROOT = join(import.meta.dirname, '..');
const PACK_IDS = /geneva_fr|luxembourg_fr|luxembourg_be|luxembourg_de|ticino_it/;
const PUBLIC_TAIL =
  '(?:pricing|faq|for-individuals|privacy|dpa|disclaimer|accessibility|terms|withdrawal|cancel|company\\/signup|employers\\/(?:ticino|geneva|luxembourg)|guides(?:\\/(?:france-(?:luxembourg|geneve|bale)-compter-jours-teletravail|deutschland-schweiz-grenzgaenger-tage-zaehlen|italia-ticino-contare-giorni-telelavoro|france-geneva-telework-days|france-luxembourg-telework-days|how-to-track-cross-border-telework-days))?)';

afterEach(() => {
  cleanup();
  document.head.querySelectorAll('link[data-hreflang], link[rel="canonical"], script#bd-jsonld, meta[name="description"]').forEach((node) => node.remove());
  document.title = '';
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

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('trailing-slash public links', () => {
  it('publicPath always ends with a slash', () => {
    expect(publicPath('en')).toBe('/en/');
    expect(publicPath('fr', 'pricing')).toBe('/fr/pricing/');
    expect(publicPath('de', '/employers/geneva/')).toBe('/de/employers/geneva/');
  });

  it('fails if a public-page link in src omits the trailing slash', () => {
    const bad: string[] = [];
    const re = new RegExp(String.raw`/\$\{[A-Za-z]+\}\/${PUBLIC_TAIL}(?!\/)`, 'g');
    for (const file of walk(join(ROOT, 'src'))) {
      const text = readFileSync(file, 'utf8');
      for (const match of text.matchAll(re)) {
        bad.push(`${file.slice(ROOT.length)}: ${match[0]}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('home links to indexable pages use a trailing slash', () => {
    at('/en/', <Home />);
    const hrefs = [...document.querySelectorAll('a')].map((a) => a.getAttribute('href') || '');
    const publicHrefs = hrefs.filter((href) => href.startsWith('/en/') && !href.includes('/auth/') && !href.endsWith('/app'));
    expect(publicHrefs.length).toBeGreaterThan(3);
    for (const href of publicHrefs) expect(href.split('?')[0].endsWith('/'), href).toBe(true);
  });
});

describe('one title source', () => {
  it('heads.json matches scripts/seo.mjs and Seo writes those tags', () => {
    for (const path of Object.keys(PAGES)) {
      for (const lang of LANGS) {
        const row = (heads as Record<string, Record<string, { title: string; description: string }>>)[path][lang];
        expect(row.title).toBe(PAGES[path][lang].title);
        expect(row.description).toBe(PAGES[path][lang].description);
      }
    }
    at('/fr/faq', <Faq />);
    expect(document.title).toBe(PAGES.faq.fr.title);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(PAGES.faq.fr.description);
  });
});

describe('visible FAQ and headings', () => {
  it('home JSON-LD has no FAQPage; the FAQ page uses the visible questions', () => {
    at('/en/', <Home />);
    const home = JSON.parse(document.getElementById('bd-jsonld')!.textContent!)['@graph'];
    expect(home.some((node: { '@type': string }) => node['@type'] === 'FAQPage')).toBe(false);
    expect(document.body.textContent).toContain('Routes covered:');
    cleanup();

    at('/fr/faq', <Faq />);
    const questions = screen.getAllByRole('heading', { level: 3 }).map((node) => node.textContent);
    const graph = JSON.parse(document.getElementById('bd-jsonld')!.textContent!)['@graph'];
    const faq = graph.find((node: { '@type': string }) => node['@type'] === 'FAQPage');
    expect(faq.mainEntity.map((item: { name: string }) => item.name)).toEqual(questions);
  });

  it('employer headings do not show pack ids', () => {
    for (const [path, Page] of [
      ['/en/employers/geneva', EmployersGeneva],
      ['/fr/employers/luxembourg', EmployersLuxembourg],
      ['/it/employers/ticino', EmployersTicino],
    ] as const) {
      at(path, <Page />);
      const headings = screen.getAllByRole('heading').map((node) => node.textContent || '');
      expect(headings.join('\n')).not.toMatch(PACK_IDS);
      cleanup();
    }
  });

  it('each French guide shows a visible FAQ', () => {
    at('/fr/guides/france-luxembourg-compter-jours-teletravail', <FrenchGuide id="luxembourg" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Questions fréquentes' })).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThanOrEqual(4);
    const graph = JSON.parse(document.getElementById('bd-jsonld')!.textContent!)['@graph'];
    expect(graph.some((node: { '@type': string }) => node['@type'] === 'FAQPage')).toBe(true);
    expect(document.title).toContain('34 jours de télétravail');
  });
});

describe('sources and discovery', () => {
  it('adds the Luxembourg circular only on the France pack source list', () => {
    const url =
      'https://impotsdirects.public.lu/dam-assets/fr/legislation/circulaires/circulaire-du-directeur-des-contributions-lg-conv-di-n-61-du-24-juin-2026.pdf';
    const fr = BORDER_PACKS.find((pack) => pack.id === 'luxembourg_fr')!;
    const tax = fr.counters.find((counter) => counter.kind === 'tax')!;
    expect(tax.sources.some((source) => source.url === url)).toBe(true);
    expect(tax.limit).toBe(34);
    for (const id of ['luxembourg_be', 'luxembourg_de']) {
      const pack = BORDER_PACKS.find((item) => item.id === id)!;
      const sources = pack.counters.flatMap((counter) => counter.sources.map((source) => source.url));
      expect(sources).not.toContain(url);
    }
    at('/de/employers/luxembourg', <EmployersLuxembourg />);
    expect(document.body.textContent).toContain('Circulaire L.G. Conv. D.I. n° 61');
    expect(screen.getByRole('link', { name: /Circulaire L\.G\. Conv\. D\.I\. n° 61/ }).getAttribute('href')).toBe(url);
    expect(screen.getByText(/A French guide for staff living in France is available|Ein französischer Leitfaden/)).toBeTruthy();
  });

  it('Organization sameAs is the BorderDay LinkedIn page', () => {
    expect(organizationLd().sameAs).toEqual(['https://www.linkedin.com/company/borderday/']);
    const xml = sitemapXml();
    expect(xml).toContain('https://borderday.com/fr/guides/');
    expect(xml).not.toContain('/privacy/');
  });

  it('app and auth pages are lazy-loaded', () => {
    const app = readFileSync(join(ROOT, 'src/App.tsx'), 'utf8');
    expect(app).toContain("lazy(() => import('./pages/AppPage'))");
    expect(app).toContain("lazy(() => import('./pages/auth/SignIn'))");
    expect(app).toContain("lazy(() => import('./pages/company/Dashboard'))");
    expect(app).not.toContain("import AppPage from");
  });
});
