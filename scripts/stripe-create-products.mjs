#!/usr/bin/env node
/**
 * Creates BorderDay products/prices in Stripe TEST mode only.
 * Usage: STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-create-products.mjs
 * DO NOT use livemode keys or the WeddingVenues account.
 *
 * Company: €5/seat/mo (bill min 8 seats ≈ €39 floor); yearly €50/seat (2 months free).
 * Individual: €4.99/mo or €49/yr. Trial: 14 days on Checkout session.
 */
import Stripe from 'stripe';
const key = process.env.STRIPE_SECRET_KEY;
if (!key) { console.error('Set STRIPE_SECRET_KEY=sk_test_...'); process.exit(1); }
if (key.startsWith('sk_live_')) { console.error('Refusing live key'); process.exit(1); }
const stripe = new Stripe(key);
const company = await stripe.products.create({ name: 'BorderDay Company', metadata: { app: 'borderday', plan: 'company' } });
const companyMonth = await stripe.prices.create({ product: company.id, currency: 'eur', unit_amount: 500, recurring: { interval: 'month' }, nickname: 'company-seat-month' });
const companyYear = await stripe.prices.create({ product: company.id, currency: 'eur', unit_amount: 5000, recurring: { interval: 'year' }, nickname: 'company-seat-year' });
const individual = await stripe.products.create({ name: 'BorderDay Individual', metadata: { app: 'borderday', plan: 'individual' } });
const indivMonth = await stripe.prices.create({ product: individual.id, currency: 'eur', unit_amount: 499, recurring: { interval: 'month' }, nickname: 'individual-month' });
const indivYear = await stripe.prices.create({ product: individual.id, currency: 'eur', unit_amount: 4900, recurring: { interval: 'year' }, nickname: 'individual-year' });
console.log(JSON.stringify({
  STRIPE_PRICE_COMPANY_MONTH: companyMonth.id,
  STRIPE_PRICE_COMPANY_YEAR: companyYear.id,
  STRIPE_PRICE_INDIVIDUAL_MONTH: indivMonth.id,
  STRIPE_PRICE_INDIVIDUAL_YEAR: indivYear.id,
}, null, 2));
console.log('\nSet as Supabase secrets with STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, BD_SITE_URL.');
console.log('Webhook: https://uufmlmwgvoqhhtqgrclu.supabase.co/functions/v1/bd-stripe-webhook');
console.log('Managed Payments / VAT: enable Stripe Tax; Stripe as MoR where Managed Payments applies.');
