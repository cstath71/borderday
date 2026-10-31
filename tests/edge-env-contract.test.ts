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

describe('bd-create-checkout promo / €0 card', () => {
  const src = readFileSync(resolve(root, 'supabase/functions/bd-create-checkout/index.ts'), 'utf8');
  it('allows promotion codes', () => {
    expect(src).toContain('allow_promotion_codes: true');
  });
  it('uses payment_method_collection if_required for €0 due', () => {
    expect(src).toContain('payment_method_collection: "if_required"');
  });
  it('keeps Stripe Tax collection fields', () => {
    expect(src).toContain('automatic_tax: { enabled: true }');
    expect(src).toContain('tax_id_collection: { enabled: true }');
    expect(src).toContain('billing_address_collection: "required"');
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
