// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LANGS, PAGES, PUBLIC_PATHS, SITEMAP_PATHS, absUrl, llmsTxt, sitemapXml } from '../scripts/seo.mjs';
import { getDict, type Lang } from '../src/i18n';

vi.mock('../src/lib/auth', () => ({
  useAuth: () => ({ ready: true, configured: true, user: null, signingOut: false, signOut: vi.fn(), signOutAndGo: vi.fn() }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('../src/lib/companyApi', async (original) => ({
  ...(await original<typeof import('../src/lib/companyApi')>()),
  listMyCompanies: vi.fn(async () => []),
}));

import App from '../src/App';

const DASH = /[\u2014\u2013]/;
const ROOT = join(import.meta.dirname, '..');

function open(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe('homepage HR desk section', () => {
  it('places the approved English section directly after the hero', () => {
    open('/en/');
    const h2 = screen.getAllByRole('heading', { level: 2 });
    expect(h2[0].textContent).toBe("What BorderDay takes off HR's desk");
    const section = h2[0].closest('section')!;
    const text = section.textContent || '';
    expect(text).toContain(
      'No more spreadsheet of who worked where. Employees log their own day types, BorderDay keeps the counters, and HR sees who is getting close to a limit before it is crossed.',
    );
    expect(text).toContain('No manual reconciliation.');
    expect(text).toContain(
      'Each employee logs telework, on site, work trip or non-working days in a few seconds. HR reads one dashboard instead of chasing emails.',
    );
    expect(text).toContain('Warnings before a limit, not after.');
    expect(text).toContain(
      'Tax and social-security counters warn at 75% and 90% of the applicable limit, so there is time to plan on-site days.',
    );
    expect(text).toContain('Year-end figures ready.');
    expect(text).toContain("Export every employee's days and counters as CSV, ready for your own checks and your filing work.");
    expect(text).toContain('Example: a Geneva employer, November');
    expect(text).toContain('HR creates the company account and invites staff living in France by email link.');
    expect(text).toContain(
      'HR uploads one CSV with the days of 2026 so far. Employees see those days marked as entered by HR and confirm or correct them.',
    );
    expect(text).toContain(
      "The dashboard shows each employee's 40% tax counter and social-security band. Two people near the limit get a heads-up to plan more on-site days in December.",
    );
    expect(text).toContain(
      'In January, HR exports the year as CSV as the working record for the telework-rate attestation filed with the cantonal tax authority.',
    );
    expect(text).toContain('Illustration only. The CSV is a working record, not the attestation itself.');
    expect(within(section).getByRole('link', { name: 'Create company account' }).getAttribute('href')).toBe(
      '/en/company/signup/',
    );
    expect(within(document.querySelector('footer')!).getByRole('link', { name: 'For fiduciaries and payroll providers' }).getAttribute('href')).toBe(
      '/en/fiduciaries/',
    );
  });

  it('shows a translated section on every locale homepage', () => {
    for (const lang of LANGS as Lang[]) {
      open(`/${lang}/`);
      const d = getDict(lang);
      const h2 = screen.getAllByRole('heading', { level: 2 });
      expect(h2[0].textContent).toBe(d.home.hrDeskTitle);
      const section = h2[0].closest('section')!;
      expect(within(section).getByRole('link', { name: d.home.ctaPrimary }).getAttribute('href')).toBe(
        `/${lang}/company/signup/`,
      );
      expect(within(document.querySelector('footer')!).getByRole('link', { name: d.footer.fiduciaries }).getAttribute('href')).toBe(
        `/${lang}/fiduciaries/`,
      );
      cleanup();
    }
  });
});

describe('fiduciaries page', () => {
  it('renders the approved English page and pricing link', () => {
    open('/en/fiduciaries/');
    expect(document.title).toBe(PAGES.fiduciaries.en.title);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Track cross-border days for every client, in one login',
    );
    expect(document.getElementById('summary')?.textContent).toContain(
      "If you run payroll or HR administration for several companies, BorderDay lets you follow each client's cross-border staff from one account, with every client kept fully separate.",
    );
    const body = document.body.textContent || '';
    expect(body).toContain('One account, several clients.');
    expect(body).toContain('Each client stays separate.');
    expect(body).toContain('Load the year so far.');
    expect(body).toContain('Same counters as the employee.');
    expect(body).toContain('The client can stay in charge.');
    expect(body).toContain(
      'Each client company has its own plan: €5 per active employee per month, minimum €39 per month, excl. VAT. Questions about several clients? Write to hello@borderday.com.',
    );
    expect(body).toContain('A data processing agreement applies to each company account. No GPS or device location, only day types.');
    const signup = screen.getAllByRole('link', { name: 'Create a company account' });
    const pricing = screen.getAllByRole('link', { name: 'See company pricing' });
    expect(signup.length).toBeGreaterThan(0);
    expect(pricing.length).toBeGreaterThan(0);
    for (const link of signup) expect(link.getAttribute('href')).toBe('/en/company/signup/');
    for (const link of pricing) expect(link.getAttribute('href')).toBe('/en/pricing/');
    cleanup();

    open('/en/pricing/');
    expect(
      screen.getByRole('link', { name: 'Fiduciary or payroll provider? See how BorderDay works for several clients.' }).getAttribute('href'),
    ).toBe('/en/fiduciaries/');
  });

  it('renders every locale with the same route slug', () => {
    for (const lang of LANGS as Lang[]) {
      open(`/${lang}/fiduciaries/`);
      const d = getDict(lang);
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(d.fiduciaries.heroTitle);
      expect(document.getElementById('summary')?.textContent).toContain(d.fiduciaries.intro);
      expect(screen.getAllByRole('link', { name: d.fiduciaries.ctaPrimary })[0].getAttribute('href')).toBe(
        `/${lang}/company/signup/`,
      );
      expect(screen.getAllByRole('link', { name: d.fiduciaries.ctaPricing })[0].getAttribute('href')).toBe(
        `/${lang}/pricing/`,
      );
      expect(document.title).toBe(PAGES.fiduciaries[lang].title);
      cleanup();

      open(`/${lang}/pricing/`);
      expect(screen.getByRole('link', { name: d.pricing.fiduciaryLink }).getAttribute('href')).toBe(`/${lang}/fiduciaries/`);
      cleanup();
    }
  });
});

describe('fiduciary SEO', () => {
  it('is a public sitemap path in all five locales, with hreflang and llms', () => {
    expect(PUBLIC_PATHS).toContain('fiduciaries');
    expect(SITEMAP_PATHS).toContain('fiduciaries');
    const xml = sitemapXml();
    for (const lang of LANGS) {
      const loc = absUrl(lang, 'fiduciaries');
      expect(xml).toContain(`<loc>${loc}</loc>`);
      expect(xml).toContain(`hreflang="${lang}" href="${loc}"`);
      expect(PAGES.fiduciaries[lang].h1).toBe(getDict(lang as Lang).fiduciaries.heroTitle);
      expect(PAGES.fiduciaries[lang].summary).toBe(getDict(lang as Lang).fiduciaries.intro);
    }
    expect(xml).toContain('hreflang="x-default" href="https://borderday.com/en/fiduciaries/"');
    expect(llmsTxt()).toContain('https://borderday.com/en/fiduciaries/');
    const app = readFileSync(join(ROOT, 'src/App.tsx'), 'utf8');
    expect(app).toContain('path="fiduciaries"');
  });

  it('keeps em and en dashes out of the new copy', () => {
    for (const lang of LANGS as Lang[]) {
      const d = getDict(lang);
      const blob = JSON.stringify({
        hr: {
          hrDeskTitle: d.home.hrDeskTitle,
          hrDeskIntro: d.home.hrDeskIntro,
          hrDesk1Title: d.home.hrDesk1Title,
          hrDesk1Body: d.home.hrDesk1Body,
          hrDesk2Title: d.home.hrDesk2Title,
          hrDesk2Body: d.home.hrDesk2Body,
          hrDesk3Title: d.home.hrDesk3Title,
          hrDesk3Body: d.home.hrDesk3Body,
          hrDeskExampleTitle: d.home.hrDeskExampleTitle,
          hrDeskExample1: d.home.hrDeskExample1,
          hrDeskExample2: d.home.hrDeskExample2,
          hrDeskExample3: d.home.hrDeskExample3,
          hrDeskExample4: d.home.hrDeskExample4,
          hrDeskExampleNote: d.home.hrDeskExampleNote,
        },
        fiduciaries: d.fiduciaries,
        footer: d.footer.fiduciaries,
        pricing: d.pricing.fiduciaryLink,
        seo: PAGES.fiduciaries[lang],
      });
      expect(blob, lang).not.toMatch(DASH);
      expect(blob, lang).not.toMatch(/PrimeLogic|Stathopoulos/i);
    }
  });
});
