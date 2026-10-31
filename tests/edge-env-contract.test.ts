import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '..');

describe('bd-send-invite Resend env', () => {
  const src = readFileSync(resolve(root, 'supabase/functions/bd-send-invite/index.ts'), 'utf8');
  it('prefers RESEND_API_KEY_BORDERDAY, falls back to RESEND_API_KEY', () => {
    expect(src).toMatch(/RESEND_API_KEY_BORDERDAY/);
    expect(src).toMatch(/Deno\.env\.get\("RESEND_API_KEY_BORDERDAY"\)\s*\|\|\s*Deno\.env\.get\("RESEND_API_KEY"\)/);
  });
  it('defaults From to BorderDay <hello@borderday.com> when RESEND_FROM unset', () => {
    expect(src).toContain('BorderDay <hello@borderday.com>');
    expect(src).not.toContain('invites@borderday.com');
  });
  it('keeps RESEND_LIVE gate (no real invites until approved)', () => {
    expect(src).toContain('RESEND_LIVE');
    expect(src).toMatch(/RESEND_LIVE"\)\s*===\s*"1"/);
  });
});

describe('bd-create-checkout Managed Payments + trial', () => {
  const src = readFileSync(resolve(root, 'supabase/functions/bd-create-checkout/index.ts'), 'utf8');
  const trialSrc = readFileSync(resolve(root, 'supabase/functions/_shared/trial.ts'), 'utf8');
  it('enables Managed Payments and omits forbidden tax/PM params', () => {
    expect(src).toContain('managed_payments: { enabled: true }');
    expect(src).not.toMatch(/automatic_tax\s*:/);
    expect(src).not.toMatch(/tax_id_collection\s*:/);
    expect(src).not.toMatch(/payment_method_types\s*:/);
  });
  it('allows promotion codes and requires billing address', () => {
    expect(src).toContain('allow_promotion_codes: true');
    expect(src).toContain('billing_address_collection: "required"');
  });
  it('requires a payment method and cancels trial if missing', () => {
    expect(src).toContain('payment_method_collection: "always"');
    expect(src).toContain('missing_payment_method: "cancel"');
  });
  it('uses shared TRIAL_DAYS = 7', () => {
    expect(trialSrc).toMatch(/export const TRIAL_DAYS = 7/);
    expect(src).toContain('trial_period_days: TRIAL_DAYS');
    expect(src).not.toMatch(/trial_period_days:\s*14/);
  });
});

describe('bd-stripe-webhook Deno signature verify', () => {
  const src = readFileSync(resolve(root, 'supabase/functions/bd-stripe-webhook/index.ts'), 'utf8');
  it('uses constructEventAsync (SubtleCrypto)', () => {
    expect(src).toContain('constructEventAsync');
    expect(src).not.toMatch(/constructEvent\(/);
  });
});

describe('Stripe API version (Managed Payments)', () => {
  for (const fn of ['bd-create-checkout', 'bd-customer-portal', 'bd-stripe-webhook', 'bd-sync-company-billing'] as const) {
    it(`${fn} uses 2025-03-31.basil`, () => {
      const src = readFileSync(resolve(root, `supabase/functions/${fn}/index.ts`), 'utf8');
      expect(src).toContain('apiVersion: "2025-03-31.basil"');
      expect(src).not.toContain('2024-11-20.acacia');
    });
  }
});
