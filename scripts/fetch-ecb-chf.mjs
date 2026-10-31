#!/usr/bin/env node
/**
 * Fetch ECB EUR→CHF reference rate (via frankfurter.app, ECB publication) and
 * write config/ecb-eur-chf.json + src/lib/fx.ts. Run before vite build.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const url = 'https://api.frankfurter.app/latest?from=EUR&to=CHF';

const res = await fetch(url, { headers: { 'User-Agent': 'BorderDayBuild/1.0 (+https://borderday.com)' } });
if (!res.ok) throw new Error(`ECB/frankfurter fetch failed: ${res.status}`);
const data = await res.json();
const rate = Number(data.rates?.CHF);
const date = data.date;
if (!Number.isFinite(rate) || !date) throw new Error(`Bad FX payload: ${JSON.stringify(data)}`);

const meta = {
  rate,
  date,
  base: 'EUR',
  quote: 'CHF',
  source: 'ECB euro foreign exchange reference rate via https://api.frankfurter.app (ECB publication)',
  ecbXml: 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml',
  fetchedAt: new Date().toISOString(),
};
mkdirSync(join(ROOT, 'config'), { recursive: true });
writeFileSync(join(ROOT, 'config/ecb-eur-chf.json'), JSON.stringify(meta, null, 2) + '\n');
writeFileSync(
  join(ROOT, 'src/lib/fx.ts'),
  `/** ECB euro reference rate snapshot (fetched at build). Never invent rates. */
export const ECB_EUR_CHF = {
  rate: ${rate},
  date: '${date}',
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
`,
);
console.log(`fetch-ecb-chf: EUR→CHF ${rate} (ECB ref ${date})`);
