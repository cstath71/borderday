import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { inviteLang } from '../supabase/functions/_shared/inviteEmail';
import { invoiceSubscriptionId } from '../supabase/functions/_shared/stripeInvoice';

function mapStripeStatus(status: string): string {
  const statusMap: Record<string, string> = {
    trialing: 'trialing', active: 'active', past_due: 'past_due', canceled: 'canceled',
    unpaid: 'past_due', incomplete: 'incomplete', incomplete_expired: 'canceled',
  };
  return statusMap[status] || 'none';
}

describe('stripe status mapping', () => {
  it('maps known statuses', () => {
    expect(mapStripeStatus('active')).toBe('active');
    expect(mapStripeStatus('unpaid')).toBe('past_due');
  });
});

describe('A3-06 renewal reminder', () => {
  const root = resolve(__dirname, '..');
  const webhook = readFileSync(resolve(root, 'supabase/functions/bd-stripe-webhook/index.ts'), 'utf8');
  const checkout = readFileSync(resolve(root, 'supabase/functions/bd-create-checkout/index.ts'), 'utf8');

  it('reads the subscription from the basil shape and the legacy shape', () => {
    expect(invoiceSubscriptionId({ parent: { subscription_details: { subscription: 'sub_new' } } })).toBe('sub_new');
    expect(invoiceSubscriptionId({ parent: { subscription_details: { subscription: { id: 'sub_obj' } } } })).toBe('sub_obj');
    expect(invoiceSubscriptionId({ subscription: 'sub_old' })).toBe('sub_old');
    expect(invoiceSubscriptionId({ subscription: { id: 'sub_old_obj' } })).toBe('sub_old_obj');
  });

  it('returns null when neither shape carries one, so the handler skips the invoice', () => {
    expect(invoiceSubscriptionId({})).toBeNull();
    expect(invoiceSubscriptionId({ subscription: null, parent: null })).toBeNull();
    expect(invoiceSubscriptionId({ parent: { subscription_details: null } })).toBeNull();
    expect(invoiceSubscriptionId({ parent: { subscription_details: { subscription: {} } } })).toBeNull();
  });

  it('the webhook uses the helper, not the removed field', () => {
    expect(webhook).toContain('invoiceSubscriptionId(inv)');
    expect(webhook).not.toMatch(/inv\.subscription\b/);
  });

  it('checkout stores the language on both the session and the subscription', () => {
    const lang = checkout.indexOf('const lang =');
    const metadata = checkout.indexOf('const metadata: Record<string, string>');
    expect(lang).toBeGreaterThan(-1);
    expect(lang).toBeLessThan(metadata);
    expect(checkout.slice(metadata, metadata + 120)).toMatch(/express_start: "1", lang \}/);
    expect(checkout).toMatch(/subscription_data: \{\s*metadata,/);
  });

  it('the reminder link follows that language, and a missing or odd value falls back to English', () => {
    expect(webhook).toContain('${siteUrl}/${inviteLang(opts.lang)}/cancel');
    expect(webhook).not.toContain('/en/cancel');
    expect(webhook).toContain('lang: sub.metadata?.lang');
    expect(inviteLang('nl')).toBe('nl');
    expect(inviteLang(undefined)).toBe('en');
    expect(inviteLang('xx')).toBe('en');
  });
});
