import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  checkoutSuccessUrl,
  hasLiveSubscription,
  subscriptionTrialFields,
  trialAlreadyUsed,
} from '../supabase/functions/_shared/checkoutGuard';
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

describe('E1 one free trial per person and per company', () => {
  const src = read('supabase/functions/bd-create-checkout/index.ts');

  it.each([
    [{ status: 'canceled' }],
    [{ status: 'active' }],
    [{ status: 'trialing' }],
    [{ status: 'past_due' }],
    [{ subscription_status: 'canceled' }],
    [{ status: 'incomplete', trial_ends_at: '2026-10-08T00:00:00Z' }],
    [{ subscription_status: 'none', trial_ends_at: '2026-10-08T00:00:00Z' }],
  ])('%j has used it', (row) => {
    expect(trialAlreadyUsed([{ status: 'none' }, row])).toBe(true);
  });

  it.each([[[]], [[{ status: 'none' }]], [[{ status: 'incomplete' }]], [[{ subscription_status: 'none', trial_ends_at: null }]]])(
    '%j has not',
    (rows) => {
      expect(trialAlreadyUsed(rows)).toBe(false);
    },
  );

  it('sends Stripe no trial fields at all on a repeat', () => {
    expect(subscriptionTrialFields(true, 7)).toEqual({});
    expect(subscriptionTrialFields(false, 7)).toEqual({
      trial_period_days: 7,
      trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
    });
  });

  it('the function reads the whole history, fails closed, and only then calls Stripe', () => {
    const check = src.indexOf('trialAlreadyUsed(history)');
    expect(check).toBeGreaterThan(-1);
    expect(check).toBeLessThan(src.indexOf('checkout.sessions.create'));
    expect(src).toContain('from("bd_subscriptions")\n      .select("status, trial_ends_at").eq("user_id", user.id)');
    expect(src).toContain('.in("role", ["owner", "hr_viewer"])');
    expect(src).toContain('.in("company_id", companyIds)');
    expect(src.match(/throw new Error\("Could not check the trial history"\)/g)).toHaveLength(3);
    // An employee of a company that once trialled keeps their own individual trial.
    expect(src).not.toMatch(/bd_company_members"\)\s*\.select\("company_id"\)\.eq\("user_id", user\.id\)\s*;/);
    expect(src).not.toMatch(/\btrial_period_days\b/);
  });
});

describe('E8 checkout return page', () => {
  it('a company goes to its dashboard, an individual stays on pricing', () => {
    expect(checkoutSuccessUrl('https://b.test', 'fr', 'company', 'c1')).toBe('https://b.test/fr/company/c1/dashboard?checkout=success');
    expect(checkoutSuccessUrl('https://b.test', 'fr', 'individual')).toBe('https://b.test/fr/pricing?checkout=success');
    expect(checkoutSuccessUrl('https://b.test', 'en', 'company')).toBe('https://b.test/en/pricing?checkout=success');
  });
});
