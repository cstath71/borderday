// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { GUIDES, type GuideId } from '../src/content/guides';
import { untranslatedLocalePath } from '../src/lib/localeSwitch';
import Home from '../src/pages/Home';
import FrenchGuide from '../src/pages/guides/FrenchGuide';
import GuidesHub from '../src/pages/guides/Hub';
import { BASE, PAGES, hubIndexMarkdown, llmsFullTxt, llmsTxt, sitemapXml } from '../scripts/seo.mjs';

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

const EN_GUIDES: { id: GuideId; path: string; faq: number }[] = [
  { id: 'enGeneva', path: '/en/guides/france-geneva-telework-days', faq: 8 },
  { id: 'enLuxembourg', path: '/en/guides/france-luxembourg-telework-days', faq: 7 },
  { id: 'enTrack', path: '/en/guides/how-to-track-cross-border-telework-days', faq: 0 },
];

describe('English guides', () => {
  it('opens with the short answer, dated 2026-11-10, and Article JSON-LD', () => {
    for (const item of EN_GUIDES) {
      at(item.path, <FrenchGuide id={item.id} />);
      const first = document.querySelector('.article-prose p');
      expect(first?.classList.contains('lede')).toBe(true);
      expect(first?.textContent?.startsWith('Short answer:')).toBe(true);
      expect(document.querySelector('time')?.getAttribute('datetime')).toBe('2026-11-10');
      const graph = JSON.parse(document.getElementById('bd-jsonld')!.textContent!)['@graph'];
      const article = graph.find((node: { '@type': string }) => node['@type'] === 'Article');
      expect(article.datePublished).toBe('2026-11-10');
      expect(article.citation.length).toBeGreaterThan(3);
      expect(article.citation.every((url: string) => url.startsWith('http') && !url.includes('borderday.com'))).toBe(true);
      expect(article.about.some((node: { name: string }) => node.name === 'cross-border telework')).toBe(true);
      const faq = graph.find((node: { '@type': string }) => node['@type'] === 'FAQPage');
      if (item.faq) expect(faq.mainEntity).toHaveLength(item.faq);
      else expect(faq).toBeUndefined();
      const langs = [...document.querySelectorAll('link[data-hreflang]')].map((node) => node.getAttribute('hreflang'));
      expect(langs).toEqual(['en', 'x-default']);
      expect(GUIDES.find((guide) => guide.id === item.id)?.markdown).not.toMatch(/\[[A-Z]+(?:-[A-Z]+)?\d+\]/);
      cleanup();
    }
  });

  it('is not an alternate of the French guides', () => {
    const xml = sitemapXml();
    const loc = `${BASE}/en/guides/france-geneva-telework-days/`;
    const block = xml.split('<url>').find((part) => part.includes(`<loc>${loc}</loc>`));
    expect(block).toContain('hreflang="en"');
    expect(block).not.toContain('hreflang="fr"');
    expect(untranslatedLocalePath('/en/guides/france-geneva-telework-days/', 'fr')).toBe('/fr/employers/geneva/');
    expect(untranslatedLocalePath('/fr/guides/france-geneve-compter-jours-teletravail/', 'en')).toBe(
      '/en/employers/geneva/',
    );
  });

  it('lists the three guides on the English hub', () => {
    at('/en/guides/', <GuidesHub />);
    expect(screen.getByRole('heading', { level: 1, name: 'Guides' })).toBeTruthy();
    for (const item of EN_GUIDES) {
      expect(document.querySelector(`a[href="${item.path}/"]`)).toBeTruthy();
    }
    expect(document.body.textContent).toContain('Short answer:');
    expect(document.body.textContent).not.toContain('Short answer :');
    const md = hubIndexMarkdown('en');
    expect(md.startsWith('# Guides\n')).toBe(true);
    expect(md).toContain('Short answer:');
    expect(md).toContain(`${BASE}/en/guides/how-to-track-cross-border-telework-days/`);
  });

  it('keeps brief-label spacing and lists the English guides for crawlers', () => {
    const de = GUIDES.find((guide) => guide.id === 'deCh')!;
    const it = GUIDES.find((guide) => guide.id === 'ticinoIt')!;
    const fr = GUIDES.find((guide) => guide.id === 'geneva')!;
    expect(de.markdown).toContain('**Kurz gesagt:**');
    expect(de.markdown).not.toContain('Kurz gesagt :');
    expect(it.markdown).toContain('**In breve:**');
    expect(it.markdown).not.toContain('In breve :');
    expect(fr.markdown).toContain('**En bref :**');
    const llms = llmsTxt();
    expect(llms).not.toContain('Kurz gesagt :');
    expect(llms).not.toContain('In breve :');
    expect(llms).toContain('En bref (France');
    expect(llms).not.toContain('En bref :');
    const sitemap = llmsFullTxt().split('## Sitemap\n')[1];
    expect(sitemap).toContain(`${BASE}/en/privacy/`);
    expect(sitemap).toContain(`${BASE}/en/guides/`);
    expect(sitemap).toContain(`${BASE}/en/guides/france-geneva-telework-days/`);
    expect(sitemap).toContain(`${BASE}/en/guides/france-luxembourg-telework-days/`);
    expect(sitemap).toContain(`${BASE}/en/guides/how-to-track-cross-border-telework-days/`);
    expect(sitemap).not.toContain(`${BASE}/fr/guides/`);
  });

  it('puts the approved Organization and WebSite descriptions on the homepage', () => {
    at('/en/', <Home />);
    const graph = JSON.parse(document.getElementById('bd-jsonld')!.textContent!)['@graph'];
    const org = graph.find((node: { '@type': string }) => node['@type'] === 'Organization');
    expect(org.description).toContain('social-security counters on nine border routes, tax counters on seven');
    expect(org.disambiguatingDescription).toContain('Not a residency, 183-day or Schengen travel-day counter.');
    expect(org.alternateName).toBeUndefined();
    expect(org.sameAs).toEqual(['https://www.linkedin.com/company/borderday/']);
    const site = graph.find((node: { '@type': string }) => node['@type'] === 'WebSite');
    expect(site.description).toBe(PAGES[''].en.description);
  });
});
