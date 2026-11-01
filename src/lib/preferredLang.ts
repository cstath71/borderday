import { isLang, type Lang } from '../i18n';

const KEY = 'bd_lang';

/** Remembered UI language for signed-out visitors (A2-13). */
export function getPreferredLang(fallback: Lang = 'en'): Lang {
  try {
    const v = localStorage.getItem(KEY);
    if (isLang(v)) return v;
  } catch {
    /* private mode */
  }
  return fallback;
}

export function setPreferredLang(lang: Lang): void {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* private mode */
  }
}
