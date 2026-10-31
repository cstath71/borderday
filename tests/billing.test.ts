import { describe, expect, it } from 'vitest';
import { companyHasPaidAccess } from '../src/lib/billing';
import { TRIAL_DAYS } from '../src/lib/trial';
import {
  COMPANY_FLAT_MAX_SEATS,
  COMPANY_MIN_EUR_MONTH,
  COMPANY_MIN_EUR_YEAR,
  resolveCompanyBilling,
} from '../src/lib/companyPricing';
import en from '../src/i18n/en';
import fr from '../src/i18n/fr';
import de from '../src/i18n/de';
import itDict from '../src/i18n/it';

describe('companyHasPaidAccess', () => {
  it('allows active and trialing', () => {
    expect(companyHasPaidAccess('active')).toBe(true);
    expect(companyHasPaidAccess('trialing')).toBe(true);
  });
  it('denies none/canceled', () => {
    expect(companyHasPaidAccess('none')).toBe(false);
    expect(companyHasPaidAccess('canceled')).toBe(false);
  });
  it('allows future trial_ends_at', () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(companyHasPaidAccess('none', future)).toBe(true);
  });
});

describe('resolveCompanyBilling monthly', () => {
  it('1 seat → flat €39 qty 1', () => {
    const b = resolveCompanyBilling(1, 'month');
    expect(b).toMatchObject({ mode: 'flat_minimum', priceKind: 'min', quantity: 1, seats: 1, amountEur: 39 });
  });
  it('7 seats → flat €39 qty 1', () => {
    const b = resolveCompanyBilling(7, 'month');
    expect(b).toMatchObject({ mode: 'flat_minimum', priceKind: 'min', quantity: 1, seats: 7, amountEur: 39 });
  });
  it('8 seats → per-seat €40 (8×€5)', () => {
    const b = resolveCompanyBilling(8, 'month');
    expect(b).toMatchObject({ mode: 'per_seat', priceKind: 'seat', quantity: 8, seats: 8, amountEur: 40 });
  });
  it('20 seats → per-seat €100', () => {
    const b = resolveCompanyBilling(20, 'month');
    expect(b).toMatchObject({ mode: 'per_seat', priceKind: 'seat', quantity: 20, seats: 20, amountEur: 100 });
  });
});

describe('resolveCompanyBilling yearly', () => {
  it('1 seat → flat €390 qty 1', () => {
    const b = resolveCompanyBilling(1, 'year');
    expect(b).toMatchObject({ mode: 'flat_minimum', priceKind: 'min', quantity: 1, amountEur: 390 });
  });
  it('7 seats → flat €390 qty 1', () => {
    const b = resolveCompanyBilling(7, 'year');
    expect(b).toMatchObject({ mode: 'flat_minimum', priceKind: 'min', quantity: 1, amountEur: 390 });
  });
  it('8 seats → per-seat €400 (8×€50)', () => {
    const b = resolveCompanyBilling(8, 'year');
    expect(b).toMatchObject({ mode: 'per_seat', priceKind: 'seat', quantity: 8, amountEur: 400 });
  });
  it('20 seats → per-seat €1000', () => {
    const b = resolveCompanyBilling(20, 'year');
    expect(b).toMatchObject({ mode: 'per_seat', priceKind: 'seat', quantity: 20, amountEur: 1000 });
  });
});

describe('company pricing constants', () => {
  it('flat max is 7 and amounts match approved floor', () => {
    expect(COMPANY_FLAT_MAX_SEATS).toBe(7);
    expect(COMPANY_MIN_EUR_MONTH).toBe(39);
    expect(COMPANY_MIN_EUR_YEAR).toBe(390);
  });
});

describe('pricing page copy (no €40 floor)', () => {
  const locales = { en, fr, de, it: itDict } as const;
  for (const [lang, dict] of Object.entries(locales)) {
    it(`${lang}: states €39 minimum, €5/employee, yearly 2 months free; no €40`, () => {
      const p = dict.pricing;
      const blob = [p.companyPrice, p.companyMin, p.companyYearly].join(' | ');
      expect(blob).toMatch(/€?5|5\s*€/);
      expect(blob).toMatch(/€?39|39\s*€/);
      expect(blob.toLowerCase()).toMatch(/2|deux|zwei|due/);
      expect(blob).not.toMatch(/€40|40\s*€|€\s*40/);
    });
  }
});

describe('pricing VAT copy', () => {
  it('en: incl. VAT / excl. VAT', () => {
    expect(en.pricing.individualTax).toBe('incl. VAT');
    expect(en.pricing.companyTax).toBe('excl. VAT');
  });
  it('fr: TVA incluse / hors TVA', () => {
    expect(fr.pricing.individualTax).toBe('TVA incluse');
    expect(fr.pricing.companyTax).toBe('hors TVA');
  });
  it('de: inkl. MWST / zzgl. MWST (Swiss spelling)', () => {
    expect(de.pricing.individualTax).toBe('inkl. MWST');
    expect(de.pricing.companyTax).toBe('zzgl. MWST');
  });
  it('it: IVA inclusa / IVA esclusa', () => {
    expect(itDict.pricing.individualTax).toBe('IVA inclusa');
    expect(itDict.pricing.companyTax).toBe('IVA esclusa');
  });
});

describe('trial length', () => {
  it('is 7 days (not 14)', () => {
    expect(TRIAL_DAYS).toBe(7);
  });
  const locales = { en, fr, de, it: itDict } as const;
  for (const [lang, dict] of Object.entries(locales)) {
    it(`${lang}: pricing/home trial copy says 7, never 14`, () => {
      const blob = [dict.pricing.trialCompany, dict.pricing.trialIndividual, dict.home.waitlistNote].join(' | ');
      expect(blob).toMatch(/\b7\b/);
      expect(blob).not.toMatch(/\b14\b/);
    });
    it(`${lang}: FAQ mentions 7-day trial and EU 14-day withdrawal`, () => {
      expect(dict.faq.a7).toMatch(/\b7\b/);
      expect(dict.faq.a7).toMatch(/\b14\b/);
      expect(dict.terms.s5Body).toMatch(/\b14\b/);
    });
  }
});
