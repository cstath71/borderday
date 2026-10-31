import en, { type Dict } from './en';
import fr from './fr';
import de from './de';
import it from './it';

export type Lang = 'en' | 'fr' | 'de' | 'it';
export const LANGS: Lang[] = ['en', 'fr', 'de', 'it'];

const DICTS: Record<Lang, Dict> = { en, fr, de, it };

export function isLang(s: string | undefined): s is Lang {
  return s === 'en' || s === 'fr' || s === 'de' || s === 'it';
}

export function getDict(lang: Lang): Dict {
  return DICTS[lang];
}

/** Simple {key} interpolation. */
export function t(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

export type { Dict };
