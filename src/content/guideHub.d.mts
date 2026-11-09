export const FRENCH_HUB: GuideHub;
export const GERMAN_HUB: GuideHub;
export const ITALIAN_HUB: GuideHub;
export const HUB_BY_LANG: Record<'fr' | 'de' | 'it', GuideHub>;

interface GuideHub {
  lang: string;
  path: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  briefLabel: string;
  briefRe: RegExp;
}
