import { getDict, type Lang } from '../i18n';

export type FaqPairs = readonly (readonly [string, string])[];

/** The questions rendered on /:lang/faq/. JSON-LD must use this list. */
export function faqPagePairs(lang: Lang): FaqPairs {
  const d = getDict(lang);
  return [
    [d.faq.q1, d.faq.a1],
    [d.faq.q2, d.faq.a2],
    [d.faq.q3, d.faq.a3],
    [d.faq.q4, d.faq.a4],
    [d.faq.q5, d.faq.a5],
    [d.faq.q6, d.faq.a6],
    [d.faq.q7, d.faq.a7],
    [d.faq.q8, d.faq.a8],
  ];
}

export function employerFaqPairs(lang: Lang, page: 'ticino' | 'geneva' | 'luxembourg'): FaqPairs {
  const d = getDict(lang);
  const p =
    page === 'ticino' ? d.employersTicino : page === 'geneva' ? d.employersGeneva : d.employersLuxembourg;
  return [
    [p.faq1q, p.faq1a],
    [p.faq2q, p.faq2a],
    [p.faq3q, p.faq3a],
    [p.faq4q, p.faq4a],
    [p.faq5q, p.faq5a],
  ];
}
