import { describe, expect, it } from 'vitest';
import en from '../src/i18n/en';
import fr from '../src/i18n/fr';
import de from '../src/i18n/de';
import itDict from '../src/i18n/it';

const MARKERS = ['PrimeLogic', 'CHE-312.418.158', 'Cours des Bastions'];

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
    expect(fr.privacy.controllerBody).toMatch(/LPD \/ nLPD/);
    expect(de.privacy.controllerBody).toMatch(/DSG \/ nDSG/);
    expect(itDict.privacy.controllerBody).toMatch(/LPD \/ nLPD/);
  });
});
