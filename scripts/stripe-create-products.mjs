#!/usr/bin/env node
/**
 * Creates BorderDay products/prices in Stripe TEST mode only.
 * Usage: STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-create-products.mjs
 * DO NOT use livemode keys or the WeddingVenues account.
 *
 * Company:
 *   - Flat minimum: €39/mo (lookup company-min-month) / €390/yr (company-min-year) for 1–7 active employees
 *   - Per seat: €5/seat/mo (company-seat-month) / €50/seat/yr (company-seat-year) when seats ≥ 8
 *   Yearly = 10 × monthly (2 months free).
 * Individual: €4.99/mo or €49/yr (tax_behavior inclusive).
 * Company prices: tax_behavior exclusive. Account default: exclusive.
 * Checkout: automatic_tax + tax_id_collection + billing_address_collection required.
 * Trial: 14 days on Checkout session.
 */
import Stripe from 'stripe';
const key = process.env.STRIPE_SECRET_KEY;
if (!key) { console.error('Set STRIPE_SECRET_KEY=sk_test_...'); process.exit(1); }
if (key.startsWith('sk_live_')) { console.error('Refusing live key'); process.exit(1); }
const stripe = new Stripe(key);
const company = await stripe.products.create({
  name: 'BorderDay Company',
  metadata: { app: 'borderday', plan: 'company' },
});
const companyMinMonth = await stripe.prices.create({
  product: company.id, currency: 'eur', unit_amount: 3900, recurring: { interval: 'month' },
  nickname: 'company-min-month', lookup_key: 'company-min-month', tax_behavior: 'exclusive',
  metadata: { billing: 'flat_minimum', covers_seats: '1-7' },
});
const companyMinYear = await stripe.prices.create({
  product: company.id, currency: 'eur', unit_amount: 39000, recurring: { interval: 'year' },
  nickname: 'company-min-year', lookup_key: 'company-min-year', tax_behavior: 'exclusive',
  metadata: { billing: 'flat_minimum', covers_seats: '1-7' },
});
const companyMonth = await stripe.prices.create({
  product: company.id, currency: 'eur', unit_amount: 500, recurring: { interval: 'month' },
  nickname: 'company-seat-month', lookup_key: 'company-seat-month', tax_behavior: 'exclusive',
  metadata: { billing: 'per_seat' },
});
const companyYear = await stripe.prices.create({
  product: company.id, currency: 'eur', unit_amount: 5000, recurring: { interval: 'year' },
  nickname: 'company-seat-year', lookup_key: 'company-seat-year', tax_behavior: 'exclusive',
  metadata: { billing: 'per_seat' },
});
const individual = await stripe.products.create({
  name: 'BorderDay Individual',
  metadata: { app: 'borderday', plan: 'individual' },
});
const indivMonth = await stripe.prices.create({
  product: individual.id, currency: 'eur', unit_amount: 499, recurring: { interval: 'month' },
  nickname: 'individual-month', lookup_key: 'individual-month', tax_behavior: 'inclusive',
});
const indivYear = await stripe.prices.create({
  product: individual.id, currency: 'eur', unit_amount: 4900, recurring: { interval: 'year' },
  nickname: 'individual-year', lookup_key: 'individual-year', tax_behavior: 'inclusive',
});
console.log(JSON.stringify({
  STRIPE_PRICE_COMPANY_MIN_MONTH: companyMinMonth.id,
  STRIPE_PRICE_COMPANY_MIN_YEAR: companyMinYear.id,
  STRIPE_PRICE_COMPANY_MONTH: companyMonth.id,
  STRIPE_PRICE_COMPANY_YEAR: companyYear.id,
  STRIPE_PRICE_INDIVIDUAL_MONTH: indivMonth.id,
  STRIPE_PRICE_INDIVIDUAL_YEAR: indivYear.id,
}, null, 2));
console.log('\nSet as Supabase secrets with STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, BD_SITE_URL.');
console.log('Webhook: https://uufmlmwgvoqhhtqgrclu.supabase.co/functions/v1/bd-stripe-webhook');
console.log('Checkout: seats ≤7 → flat min qty 1; seats ≥8 → seat price × seats.');
console.log('Portal: company lists seat month/year only (Stripe allows one price per interval per product); flat↔seat is app seat-sync.');
console.log('Managed Payments / VAT: enable Stripe Tax; Stripe as MoR where Managed Payments applies.');
