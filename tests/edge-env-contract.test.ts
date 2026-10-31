import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { escapeHtml, isInviteTestAddress } from '../supabase/functions/_shared/invite';

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

describe('bd-send-invite authorisation and logging (H2)', () => {
  const src = readFileSync(resolve(root, 'supabase/functions/bd-send-invite/index.ts'), 'utf8');

  it('checks owner/hr_viewer with the JWT client before the service-role client exists', () => {
    const check = src.indexOf('supabase.from("bd_company_members")');
    const admin = src.indexOf('SUPABASE_SERVICE_ROLE_KEY');
    expect(check).toBeGreaterThan(-1);
    expect(check).toBeLessThan(admin);
    expect(src).toContain('["owner", "hr_viewer"].includes(mem.role)');
    expect(src).toContain('status: 403');
    expect(src.slice(check, src.indexOf('status: 403'))).not.toContain('joinUrl');
  });

  it('logs only the invitation id and dryRun flag', () => {
    const logs = src.match(/console\.\w+\([^\n]*\)/g) ?? [];
    expect(logs.length).toBeGreaterThan(0);
    for (const line of logs) {
      expect(line).toMatch(/invitationId: inv\.id, dryRun: (true|false)/);
      expect(line).not.toMatch(/email|token|joinUrl|\bto:/i);
    }
  });

  it('sends for real only with RESEND_LIVE, a key, and a test address', () => {
    expect(src).toContain('const allowReal = live && !!apiKey;');
    expect(src).toContain('if (!allowReal || !isInviteTestAddress(inv.email))');
  });

  it('allows @borderday.com and the existing test domains', () => {
    for (const email of [
      'hello+bdtest@borderday.com',
      'HELLO@BORDERDAY.COM',
      'a@example.com',
      'a@example.org',
      'a@borderday.test',
    ]) {
      expect(isInviteTestAddress(email)).toBe(true);
    }
  });

  it('refuses every other address, including lookalikes and second recipients', () => {
    for (const email of [
      'person@gmail.com',
      'a@borderday.com.evil.com',
      'a@notborderday.com',
      'a@sub.borderday.com',
      'victim@gmail.com,a@borderday.com',
      'victim@gmail.com; a@borderday.com',
      'Victim <victim@gmail.com> a@borderday.com',
      '@borderday.com',
      '',
    ]) {
      expect(isInviteTestAddress(email)).toBe(false);
    }
  });

  it('escapes the company name in the email body', () => {
    expect(escapeHtml('<a href="x">A&B</a>')).toBe('&lt;a href=&quot;x&quot;&gt;A&amp;B&lt;/a&gt;');
    // The body is built in _shared/inviteEmail.ts; tests/account-cancel-a11y.test.tsx asserts the escaped output.
    const shared = readFileSync(resolve(root, 'supabase/functions/_shared/inviteEmail.ts'), 'utf8');
    expect(shared).toContain('const safe = escapeHtml(company);');
    expect(src).toContain('buildInviteEmail(');
  });
});

describe('bd-customer-portal authorisation (H2)', () => {
  const src = readFileSync(resolve(root, 'supabase/functions/bd-customer-portal/index.ts'), 'utf8');
  it('checks owner/hr_viewer with the JWT client before the service-role client exists', () => {
    const check = src.indexOf('supabase.from("bd_company_members")');
    const admin = src.indexOf('SUPABASE_SERVICE_ROLE_KEY');
    expect(check).toBeGreaterThan(-1);
    expect(check).toBeLessThan(admin);
    expect(src).toContain('["owner", "hr_viewer"].includes(mem.role)');
    expect(src).toContain('status: 403');
  });
});

describe('bd-sync-company-billing authorisation', () => {
  const src = readFileSync(resolve(root, 'supabase/functions/bd-sync-company-billing/index.ts'), 'utf8');
  it('lets any active member trigger the input-free seat sync (acceptInvite runs as the employee)', () => {
    expect(src).toContain('.eq("user_id", user.id).eq("active", true)');
    expect(src).toContain('if (!mem) throw new Error("Forbidden");');
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
