import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hasLiveSubscription } from '../supabase/functions/_shared/checkoutGuard';
import { startCheckout } from '../src/lib/billing';

const invoke = vi.hoisted(() => vi.fn());
vi.mock('../src/lib/supabase', () => ({
  supabaseConfigured: true,
  supabase: {
    auth: { getSession: async () => ({ data: { session: { access_token: 't' } } }) },
    functions: { invoke },
  },
}));

const read = (path: string) => readFileSync(resolve(__dirname, '..', path), 'utf8');

describe('A3-05 duplicate subscription guard', () => {
  it.each(['active', 'trialing', 'past_due'])('%s blocks a new checkout', (status) => {
    expect(hasLiveSubscription(['canceled', status])).toBe(true);
  });

  it.each([[['none']], [['canceled', 'incomplete']], [[]], [[null, undefined]]])('%j does not', (statuses) => {
    expect(hasLiveSubscription(statuses)).toBe(false);
  });

  it('the function checks both the company and subscription rows before Stripe is touched', () => {
    const src = read('supabase/functions/bd-create-checkout/index.ts');
    const guard = src.indexOf('hasLiveSubscription([');
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(src.indexOf('esm.sh/stripe'));
    expect(guard).toBeLessThan(src.indexOf('checkout.sessions.create'));
    expect(src).toContain('recordedStatuses.push(company.subscription_status)');
    expect(src).toContain('subscriptions.eq("user_id", user.id).eq("plan_kind", "individual")');
    expect(src).not.toMatch(/customers\.(list|search)/);
    // A failed read must refuse, not fall through to a new session.
    expect(src).toContain('if (subsError) throw');
    expect(src).toContain('if (companyError) throw');
  });

  describe('startCheckout', () => {
    beforeEach(() => invoke.mockReset());
    const opts = { plan: 'individual', interval: 'month', expressStartAcknowledged: true } as const;

    it('reports the refusal so Pricing can say why', async () => {
      invoke.mockResolvedValue({ data: { available: false, code: 'already_subscribed', message: 'x' }, error: null });
      expect(await startCheckout(opts)).toEqual({ ok: false, reason: 'already_subscribed', message: 'x' });
    });

    it('still returns the session url otherwise', async () => {
      invoke.mockResolvedValue({ data: { available: true, url: 'https://checkout.example' }, error: null });
      expect(await startCheckout(opts)).toEqual({ ok: true, url: 'https://checkout.example' });
    });
  });
});
