import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import en from '../src/i18n/en';
import fr from '../src/i18n/fr';
import de from '../src/i18n/de';
import itDict from '../src/i18n/it';
import { llmsFullTxt, llmsTxt, robotsTxt, sitemapXml, softwareApplicationLd } from '../scripts/seo.mjs';

const MARKERS = ['PrimeLogic', 'CHE-312.418.158', 'Cours des Bastions'];
const OWNER_BANNED = /PrimeLogic|Stathopoulos|CHE-312\.418\.158|Cours des Bastions/i;
const ROOT = join(import.meta.dirname, '..');

function collectStrings(value: unknown, path = ''): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }];
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      collectStrings(v, path ? `${path}.${k}` : k),
    );
  }
  return [];
}

describe('controller identity surface', () => {
  const locales = { en, fr, de, it: itDict } as const;
  for (const [lang, dict] of Object.entries(locales)) {
    it(`${lang}: PrimeLogic only in privacy.controllerBody and terms.providerBody`, () => {
      const hits = collectStrings(dict).filter(({ text }) =>
        MARKERS.some((m) => text.includes(m)),
      );
      const paths = hits.map((h) => h.path).sort();
      expect(paths).toEqual(['privacy.controllerBody', 'terms.providerBody']);
      expect(hits.every((h) => h.text.includes('hello@borderday.com'))).toBe(true);
      expect(hits.some((h) => /Stathopoulos/i.test(h.text))).toBe(false);
    });
  }

  it('role wording present per language', () => {
    expect(en.privacy.controllerTitle).toBe('Data controller');
    expect(fr.privacy.controllerTitle).toBe('Responsable du traitement');
    expect(de.privacy.controllerTitle).toBe('Verantwortlicher');
    expect(itDict.privacy.controllerTitle).toBe('Titolare del trattamento');
    expect(en.terms.providerBody).toMatch(/contracting party/);
    expect(en.terms.providerBody).toMatch(/merchant of record|seller of record/i);
    // Fedlex uses LPD / DSG only (02-translations finding 29); the colloquial nLPD / nDSG are gone.
    expect(fr.privacy.controllerBody).toMatch(/\(LPD\)/);
    expect(de.privacy.controllerBody).toMatch(/\(DSG\)/);
    expect(itDict.privacy.controllerBody).toMatch(/\(LPD\)/);
    for (const d of [en, fr, de, itDict]) {
      expect(d.privacy.controllerBody).not.toMatch(/nLPD|nDSG/);
    }
  });

  it('the controller section covers the whole service, and the business ID uses the local term (M9, finding 30)', () => {
    expect(en.privacy.controllerBody).toMatch(/website, individual plans, user accounts, company account administration, billing/);
    expect(fr.privacy.controllerBody).toMatch(/ce site, les offres individuelles, les comptes utilisateurs/);
    expect(de.privacy.controllerBody).toMatch(/diese Website, Einzelpläne, Benutzerkonten/);
    expect(itDict.privacy.controllerBody).toMatch(/questo sito, i piani individuali, gli account utente/);
    expect(en.privacy.controllerBody).toMatch(/UID CHE-312\.418\.158/);
    expect(fr.privacy.controllerBody).toMatch(/IDE CHE-312\.418\.158/);
    expect(de.privacy.controllerBody).toMatch(/UID CHE-312\.418\.158/);
    expect(itDict.privacy.controllerBody).toMatch(/IDI CHE-312\.418\.158/);
  });

  it('the legal notice names no representative, phone or register number that was not approved (M1)', () => {
    for (const d of [en, fr, de, itDict]) {
      const blob = d.terms.providerBody + d.terms.legalNoticeNote;
      expect(blob).toMatch(/hello@borderday\.com/);
      expect(blob).not.toMatch(/\+\d{2}|CHE-\d{3}\.\d{3}\.\d{3}\.\d|Stathopoulos|Handelsregister|registre du commerce|registro di commercio/i);
    }
  });

  it('SEO generators never mention controller identity', () => {
    for (const blob of [robotsTxt(), sitemapXml(), llmsTxt(), llmsFullTxt(), JSON.stringify(softwareApplicationLd())]) {
      expect(blob).not.toMatch(OWNER_BANNED);
    }
  });

  it('public SEO files on disk (if present) stay clean of controller identity', () => {
    for (const rel of ['public/robots.txt', 'public/sitemap.xml', 'public/llms.txt', 'public/llms-full.txt']) {
      const p = join(ROOT, rel);
      if (!existsSync(p)) continue;
      expect(readFileSync(p, 'utf8')).not.toMatch(OWNER_BANNED);
    }
  });

  it('prerendered dist HTML (if built) keeps PrimeLogic off marketing pages', () => {
    const sample = join(ROOT, 'dist/en/index.html');
    if (!existsSync(sample)) return;
    for (const rel of [
      'en/index.html',
      'en/pricing/index.html',
      'en/faq/index.html',
      'fr/index.html',
      'de/index.html',
      'it/index.html',
      'robots.txt',
      'sitemap.xml',
      'llms.txt',
      'llms-full.txt',
    ]) {
      const text = readFileSync(join(ROOT, 'dist', rel), 'utf8');
      expect(text).not.toMatch(OWNER_BANNED);
    }
    // Privacy/terms prerendered shells use marketing summaries only (full legal body is client-rendered)
    for (const rel of ['en/privacy/index.html', 'en/terms/index.html']) {
      const text = readFileSync(join(ROOT, 'dist', rel), 'utf8');
      // prerender summary must not leak controller; live React page still has it in i18n only
      expect(text).not.toMatch(OWNER_BANNED);
    }
  });
});
