/** Language-specific guide indexes. Facts already on the guides; no new figures. */
export const FRENCH_HUB = {
  lang: 'fr',
  path: 'guides',
  title: 'Guides télétravail: Luxembourg, Genève, Bâle | BorderDay',
  description:
    'Trois guides : 34 jours France-Luxembourg ; Genève 40% et 10 jours de missions ; Bâle (accord de 1983) 40%, 10 missions et 45 nuitées. Sources officielles.',
  h1: 'Guides',
  intro:
    'Trois guides en français expliquent comment compter les jours pour une personne qui réside en France et travaille au Luxembourg, à Genève ou à Bâle (cantons de l’accord du 11 avril 1983). Ils reprennent les seuils déjà publiés sur ce site et les sources officielles indiquées sur chaque guide.',
  briefLabel: 'En bref',
  briefColon: ' :',
  briefRe: /\*\*En bref\s*:\*\*\s*(.+)/,
};

export const GERMAN_HUB = {
  lang: 'de',
  path: 'guides',
  title: 'Leitfaden: Nichtrückkehrtage Deutschland-Schweiz | BorderDay',
  description:
    'DE-CH: höchstens 60 Nichtrückkehrtage, mindestens 20% Pendeltage. Volle Homeoffice-Tage sind keines von beidem. Amtliche Quellen.',
  h1: 'Leitfäden',
  intro:
    'Ein Leitfaden auf Deutsch erklärt, wie eine Person mit Wohnsitz in Deutschland und Arbeitsort in der Schweiz Nichtrückkehrtage, Pendeltage und Homeoffice zählt. Er nennt die Schwellen aus den amtlichen Texten, die im Leitfaden mit Zugriffsdatum 9. November 2026 stehen.',
  briefLabel: 'Kurz gesagt',
  briefColon: ':',
  briefRe: /\*\*Kurz gesagt\s*:\*\*\s*(.+)/,
};

export const ITALIAN_HUB = {
  lang: 'it',
  path: 'guides',
  title: 'Guida telelavoro Italia-Ticino | BorderDay',
  description:
    'Fascia di 20 km in Italia, lavoro in Ticino, Grigioni o Vallese: massimo 25% di telelavoro al domicilio e 45 giorni di mancato rientro. Fonti ufficiali.',
  h1: 'Guide',
  intro:
    'Una guida in italiano spiega come contare telelavoro e giorni di mancato rientro per chi vive in Italia e lavora in Ticino. Le stesse regole, indicate nella guida, valgono per i Grigioni e il Vallese nell’area di frontiera. Fonti ufficiali consultate il 9 novembre 2026.',
  briefLabel: 'In breve',
  briefColon: ':',
  briefRe: /\*\*In breve\s*:\*\*\s*(.+)/,
};

export const ENGLISH_HUB = {
  lang: 'en',
  path: 'guides',
  title: 'Guides: cross-border telework days | BorderDay',
  description:
    'Three guides: Geneva 40% telework and 10 mission days; France-Luxembourg 34 days; how employers track cross-border telework days. Official sources.',
  h1: 'Guides',
  intro:
    'Three guides in English explain how to count telework days for someone who lives in France and works in Geneva or Luxembourg, and how employers can keep a day-by-day record. They use the thresholds already on this site and the official sources listed on each guide.',
  briefLabel: 'Short answer',
  briefColon: ':',
  briefRe: /\*\*Short answer\s*:\*\*\s*(.+)/,
};

export const HUB_BY_LANG = {
  en: ENGLISH_HUB,
  fr: FRENCH_HUB,
  de: GERMAN_HUB,
  it: ITALIAN_HUB,
};
