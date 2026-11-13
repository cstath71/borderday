// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LANGS, PAGES } from '../scripts/seo.mjs';
import { getDict, type Lang } from '../src/i18n';

const auth = vi.hoisted(() => ({
  value: {
    ready: true,
    configured: true,
    user: null as null | { id: string; email: string },
    signingOut: false,
    signOut: vi.fn(),
    signOutAndGo: vi.fn(),
  },
}));
vi.mock('../src/lib/auth', () => ({ useAuth: () => auth.value, AuthProvider: ({ children }: { children: ReactNode }) => children }));
vi.mock('../src/lib/companyApi', async (original) => ({
  ...(await original<typeof import('../src/lib/companyApi')>()),
  listMyCompanies: vi.fn(async () => []),
}));

import App from '../src/App';

const DASH = /[\u2014\u2013]/;
const CAVEAT: Record<Lang, { record: RegExp; attestation: RegExp }> = {
  en: { record: /working record/, attestation: /not the attestation itself/ },
  fr: { record: /document de travail/, attestation: /pas l’attestation elle-même/ },
  de: { record: /Arbeitsunterlage/, attestation: /nicht die Bescheinigung selbst/ },
  it: { record: /documento di lavoro/, attestation: /non l’attestazione stessa/ },
  nl: { record: /werkdocument/, attestation: /niet het attest zelf/ },
};

function open(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  document.head.querySelectorAll('link[data-hreflang], link[rel="canonical"], script#bd-jsonld, meta[name="description"]').forEach((node) => node.remove());
  document.title = '';
});

describe('homepage HR desk section', () => {
  it('uses the approved English copy verbatim', () => {
    const h = getDict('en').home;
    expect(h.hrDeskTitle).toBe("What BorderDay takes off HR's desk");
    expect(h.hrDeskIntro).toBe(
      'No more spreadsheet of who worked where. Employees log their own day types, BorderDay keeps the counters, and HR sees who is getting close to a limit before it is crossed.',
    );
    expect(h.hrDesk1Title).toBe('No manual reconciliation.');
    expect(h.hrDesk1Body).toBe(
      'Each employee logs telework, on site, work trip or non-working days in a few seconds. HR reads one dashboard instead of chasing emails.',
    );
    expect(h.hrDesk2Title).toBe('Warnings before a limit, not after.');
    expect(h.hrDesk2Body).toBe(
      'Tax and social-security counters warn at 75% and 90% of the applicable limit, so there is time to plan on-site days.',
    );
    expect(h.hrDesk3Title).toBe('Year-end figures ready.');
    expect(h.hrDesk3Body).toBe(
      "Export every employee's days and counters as CSV, ready for your own checks and your filing work.",
    );
    expect(h.hrDeskExampleTitle).toBe('Example: a Geneva employer, November');
    expect(h.hrDeskExample1).toBe('HR creates the company account and invites staff living in France by email link.');
    expect(h.hrDeskExample2).toBe(
      'HR uploads one CSV with the days of 2026 so far. Employees see those days marked as entered by HR and confirm or correct them.',
    );
    expect(h.hrDeskExample3).toBe(
      "The dashboard shows each employee's 40% tax counter and social-security band. Two people near the limit get a heads-up to plan more on-site days in December.",
    );
    expect(h.hrDeskExample4).toBe(
      'In January, HR exports the year as CSV as the working record for the telework-rate attestation filed with the cantonal tax authority.',
    );
    expect(h.hrDeskExampleNote).toBe('Illustration only. The CSV is a working record, not the attestation itself.');
    expect(h.ctaPrimary).toBe('Create company account');
  });

  it.each(LANGS)('%s: sits directly after the hero and reuses the company signup CTA', (lang) => {
    open(`/${lang}/`);
    const d = getDict(lang);
    const h1 = screen.getByRole('heading', { level: 1 });
    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s[0].textContent).toBe(d.home.hrDeskTitle);
    expect(h1.compareDocumentPosition(h2s[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const section = h2s[0].closest('section')!;
    expect(within(section).getByText(d.home.hrDeskIntro)).toBeTruthy();
    expect(within(section).getByRole('heading', { level: 3, name: d.home.hrDeskExampleTitle })).toBeTruthy();
    expect(within(section).getAllByRole('listitem')).toHaveLength(4);
    expect(within(section).getByText(d.home.hrDeskExampleNote)).toBeTruthy();
    expect(within(section).getByRole('link', { name: d.home.ctaPrimary }).getAttribute('href')).toBe(
      `/${lang}/company/signup/`,
    );
    const fresh = [d.home.hrDeskTitle, d.home.hrDeskIntro, d.home.hrDesk1Body, d.home.hrDeskExampleNote].join(' ');
    expect(fresh).not.toMatch(DASH);
    expect(d.home.hrDeskExampleNote).toMatch(CAVEAT[lang].record);
    expect(d.home.hrDeskExampleNote).toMatch(CAVEAT[lang].attestation);
    expect(d.home.hrDeskExample4).toMatch(CAVEAT[lang].record);
  });
});

describe('fiduciaries page', () => {
  it('uses the approved English page copy verbatim', () => {
    const p = getDict('en').fiduciaries;
    expect(p.heroTitle).toBe('Track cross-border days for every client, in one login');
    expect(p.intro).toBe(
      "If you run payroll or HR administration for several companies, BorderDay lets you follow each client's cross-border staff from one account, with every client kept fully separate.",
    );
    expect(p.point1Title).toBe('One account, several clients.');
    expect(p.point1Body).toBe(
      'You can be HR for several companies with the same login, and pick the client from a list when you sign in.',
    );
    expect(p.point2Title).toBe('Each client stays separate.');
    expect(p.point2Body).toBe(
      'Each company has its own employees, its own dashboard and its own CSV export. Data is never mixed between clients.',
    );
    expect(p.point3Title).toBe('Load the year so far.');
    expect(p.point3Body).toBe(
      'For a client joining late in the year, upload one CSV of past days. Employees see the days marked as entered by HR and can confirm or correct them.',
    );
    expect(p.point4Title).toBe('Same counters as the employee.');
    expect(p.point4Body).toBe(
      'Tax and social-security counters on the supported border routes, with warnings at 75% and 90% of a limit.',
    );
    expect(p.point5Title).toBe('The client can stay in charge.');
    expect(p.point5Body).toBe(
      'The client company can be the owner and invite you as HR, or you can set up the company account and invite their staff.',
    );
    expect(p.pricing).toBe(
      'Each client company has its own plan: €5 per active employee per month, minimum €39 per month, excl. VAT. Questions about several clients? Write to hello@borderday.com.',
    );
    expect(p.dataProtection).toBe(
      'A data processing agreement applies to each company account. No GPS or device location, only day types.',
    );
    expect(p.ctaAccount).toBe('Create a company account');
    expect(getDict('en').home.ctaSecondary).toBe('See company pricing');
    expect(getDict('en').pricing.fiduciaryLink).toBe(
      'Fiduciary or payroll provider? See how BorderDay works for several clients.',
    );
  });

  it.each(LANGS)('%s: route, SEO, CTAs, footer and pricing link', (lang) => {
    open(`/${lang}/fiduciaries/`);
    const d = getDict(lang);
    const page = PAGES.fiduciaries[lang];
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(d.fiduciaries.heroTitle);
    expect(document.getElementById('summary')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(d.fiduciaries.intro);
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByRole('link', { name: d.fiduciaries.ctaAccount }).getAttribute('href')).toBe(
      `/${lang}/company/signup/`,
    );
    expect(screen.getByRole('link', { name: d.home.ctaSecondary }).getAttribute('href')).toBe(`/${lang}/pricing/`);
    const footer = document.querySelector('footer')!;
    expect(within(footer).getByRole('link', { name: d.fiduciaries.footerLink }).getAttribute('href')).toBe(
      `/${lang}/fiduciaries/`,
    );
    expect(document.title).toBe(page.title);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(page.description);
    expect(page.h1).toBe(d.fiduciaries.heroTitle);
    expect(page.summary).toBe(d.fiduciaries.intro);
    const blob = JSON.stringify(d.fiduciaries) + d.pricing.fiduciaryLink + d.home.hrDeskTitle;
    expect(blob).not.toMatch(DASH);
    const reviewed =
      lang === 'fr'
        ? blob.replaceAll('jours frontaliers', '').replaceAll('les frontaliers', '')
        : lang === 'de'
          ? blob.replaceAll('Grenzgängertage', '')
          : blob;
    expect(reviewed).not.toMatch(/frontalier|grenzgänger|grenzgaenger|grensarbeider/i);
    cleanup();

    open(`/${lang}/pricing/`);
    expect(screen.getByRole('link', { name: d.pricing.fiduciaryLink }).getAttribute('href')).toBe(
      `/${lang}/fiduciaries/`,
    );
  });
});
