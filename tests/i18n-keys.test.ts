import { describe, expect, it } from 'vitest';
import en from '../src/i18n/en';
import fr from '../src/i18n/fr';
import de from '../src/i18n/de';
import itDict from '../src/i18n/it';

function flatKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix];
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object') keys.push(...flatKeys(v, p));
    else keys.push(p);
  }
  return keys.sort();
}

describe('i18n key parity', () => {
  const enKeys = flatKeys(en);
  it('FR has identical keys to EN', () => {
    expect(flatKeys(fr)).toEqual(enKeys);
  });
  it('DE has identical keys to EN', () => {
    expect(flatKeys(de)).toEqual(enKeys);
  });
  it('IT has identical keys to EN', () => {
    expect(flatKeys(itDict)).toEqual(enKeys);
  });
  it('branding strings avoid frontalier slogan', () => {
    const brandy = [
      en.meta.tagline,
      en.home.heroTitle,
      fr.meta.tagline,
      de.meta.tagline,
      itDict.meta.tagline,
      en.home.heroBody,
      fr.home.heroBody,
      de.home.heroBody,
      itDict.home.heroBody,
    ].join(' ');
    expect(brandy.toLowerCase()).not.toMatch(/\bfrontalier/);
    expect(brandy.toLowerCase()).not.toMatch(/\bgrenzgänger/);
  });
});
