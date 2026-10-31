/** ECB euro reference rate snapshot (fetched at build). Never invent rates. */
export const ECB_EUR_CHF = {
  rate: 0.9194,
  date: '2026-10-30',
  source: 'ECB euro foreign exchange reference rate (via frankfurter.app)',
  ecbXml: 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml',
} as const;

export function approxChf(eur: number): number {
  return Math.round(eur * ECB_EUR_CHF.rate * 100) / 100;
}

export function formatApproxChf(eur: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'CHF' }).format(approxChf(eur));
}

export function formatEur(eur: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(eur);
}
