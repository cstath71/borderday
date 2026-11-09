/** Language-specific guide indexes. Facts already on the guides; no new figures. */
export const FRENCH_HUB = {
  lang: 'fr',
  path: 'guides',
  title: 'Guides : compter les jours de télétravail (Luxembourg, Genève et Bâle) | BorderDay',
  description:
    'Trois guides en français : le seuil fiscal de 34 jours pour la France vers le Luxembourg, 40 % de télétravail avec 10 jours de missions à Genève, et pour Bâle (accord de 1983) 40 % de télétravail, 10 jours de missions et 45 nuitées hors de l’État de résidence. Sources officielles sur chaque guide.',
  h1: 'Guides',
  intro:
    'Trois guides en français expliquent comment compter les jours pour une personne qui réside en France et travaille au Luxembourg, à Genève ou à Bâle (cantons de l’accord du 11 avril 1983). Ils reprennent les seuils déjà publiés sur ce site et les sources officielles indiquées sur chaque guide.',
  briefLabel: 'En bref',
  briefRe: /\*\*En bref\s*:\*\*\s*(.+)/,
};

export const GERMAN_HUB = {
  lang: 'de',
  path: 'guides',
  title: 'Leitfaden: Nichtrückkehrtage und Pendeltage Deutschland–Schweiz | BorderDay',
  description:
    'Leitfaden auf Deutsch: wer in Deutschland wohnt und in der Schweiz arbeitet, zählt höchstens 60 Nichtrückkehrtage und mindestens 20 % Pendeltage. Volle Homeoffice-Tage sind keines von beidem. Amtliche Quellen im Leitfaden.',
  h1: 'Leitfäden',
  intro:
    'Ein Leitfaden auf Deutsch erklärt, wie eine Person mit Wohnsitz in Deutschland und Arbeitsort in der Schweiz Nichtrückkehrtage, Pendeltage und Homeoffice zählt. Er nennt die Schwellen aus den amtlichen Texten, die im Leitfaden mit Zugriffsdatum 9. November 2026 stehen.',
  briefLabel: 'Kurz gesagt',
  briefRe: /\*\*Kurz gesagt\s*:\*\*\s*(.+)/,
};

export const ITALIAN_HUB = {
  lang: 'it',
  path: 'guides',
  title: 'Guida: telelavoro e giorni di mancato rientro (Italia–Ticino) | BorderDay',
  description:
    'Guida in italiano: per chi abita in Italia nella fascia di 20 km e lavora in Ticino, Grigioni o Vallese, al massimo il 25 % di telelavoro al domicilio e 45 giorni di mancato rientro. Fonti ufficiali nella guida.',
  h1: 'Guide',
  intro:
    'Una guida in italiano spiega come contare telelavoro e giorni di mancato rientro per chi vive in Italia e lavora in Ticino. Le stesse regole, indicate nella guida, valgono per i Grigioni e il Vallese nell’area di frontiera. Fonti ufficiali consultate il 9 novembre 2026.',
  briefLabel: 'In breve',
  briefRe: /\*\*In breve\s*:\*\*\s*(.+)/,
};

export const HUB_BY_LANG = {
  fr: FRENCH_HUB,
  de: GERMAN_HUB,
  it: ITALIAN_HUB,
};
