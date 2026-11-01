import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { companyBillingFromSubscriptions, hasLiveSubscription } from '../supabase/functions/_shared/checkoutGuard';
import {
  expireOpenCheckoutSessions,
  resolveStripeCustomerId,
  stripeCustomerHasBlockingSubscription,
} from '../supabase/functions/_shared/stripeCheckoutCustomer';

const read = (path: string) => readFileSync(resolve(__dirname, '..', path), 'utf8');

describe('AR3-05 company status from all live subscriptions', () => {
  it('keeps the company active when a canceled sub arrives while another is active', () => {
    expect(
      companyBillingFromSubscriptions([
        { status: 'canceled', stripe_subscription_id: 'sub_a', current_period_end: '2026-01-01T00:00:00Z' },
        { status: 'active', stripe_subscription_id: 'sub_b', current_period_end: '2027-01-01T00:00:00Z', trial_ends_at: null },
      ]),
    ).toEqual({
      status: 'active',
      current_period_end: '2027-01-01T00:00:00Z',
      trial_ends_at: null,
    });
  });

  it('prefers trialing over past_due and incomplete over canceled', () => {
    expect(companyBillingFromSubscriptions([
      { status: 'past_due' },
      { status: 'trialing', current_period_end: '2026-12-01T00:00:00Z' },
    ]).status).toBe('trialing');
    expect(companyBillingFromSubscriptions([
      { status: 'canceled' },
      { status: 'incomplete' },
    ]).status).toBe('incomplete');
  });

  it('returns none when there are no rows', () => {
    expect(companyBillingFromSubscriptions([])).toEqual({
      status: 'none',
      current_period_end: null,
      trial_ends_at: null,
    });
  });
});

describe('AR3-05 Stripe customer reuse and open-session expiry', () => {
  it('reuses an existing customer id when Stripe still has it', async () => {
    const stripe = {
      customers: {
        retrieve: vi.fn(async () => ({ id: 'cus_1' })),
        list: vi.fn(),
        create: vi.fn(),
      },
      checkout: { sessions: { list: vi.fn(), expire: vi.fn() } },
      subscriptions: { list: vi.fn() },
    };
    await expect(resolveStripeCustomerId(stripe, { existingId: 'cus_1', email: 'a@b.test' })).resolves.toBe('cus_1');
    expect(stripe.customers.list).not.toHaveBeenCalled();
  });

  it('falls back to email list then create', async () => {
    const stripe = {
      customers: {
        retrieve: vi.fn(async () => ({ deleted: true as const })),
        list: vi.fn(async () => ({ data: [] as Array<{ id: string }> })),
        create: vi.fn(async () => ({ id: 'cus_new' })),
      },
      checkout: { sessions: { list: vi.fn(), expire: vi.fn() } },
      subscriptions: { list: vi.fn() },
    };
    await expect(resolveStripeCustomerId(stripe, {
      existingId: 'cus_gone',
      email: 'a@b.test',
      metadata: { user_id: 'u1' },
    })).resolves.toBe('cus_new');
    expect(stripe.customers.create).toHaveBeenCalledWith({
      email: 'a@b.test',
      metadata: { user_id: 'u1' },
    });
  });

  it('expires every open Checkout session for the customer', async () => {
    const expire = vi.fn(async () => ({}));
    const stripe = {
      customers: { retrieve: vi.fn(), list: vi.fn(), create: vi.fn() },
      checkout: {
        sessions: {
          list: vi.fn(async () => ({ data: [{ id: 'cs_1' }, { id: 'cs_2' }] })),
          expire,
        },
      },
      subscriptions: { list: vi.fn() },
    };
    await expect(expireOpenCheckoutSessions(stripe, 'cus_1')).resolves.toBe(2);
    expect(expire).toHaveBeenCalledWith('cs_1');
    expect(expire).toHaveBeenCalledWith('cs_2');
  });

  it('blocks when Stripe already has an incomplete individual subscription', async () => {
    const stripe = {
      customers: { retrieve: vi.fn(), list: vi.fn(), create: vi.fn() },
      checkout: { sessions: { list: vi.fn(), expire: vi.fn() } },
      subscriptions: {
        list: vi.fn(async () => ({
          data: [{ id: 'sub_x', status: 'incomplete', metadata: { plan: 'individual', user_id: 'u1' } }],
        })),
      },
    };
    await expect(stripeCustomerHasBlockingSubscription(stripe, 'cus_1', {
      plan: 'individual',
      userId: 'u1',
    })).resolves.toBe(true);
  });

  it('does not treat another company subscription as blocking', async () => {
    const stripe = {
      customers: { retrieve: vi.fn(), list: vi.fn(), create: vi.fn() },
      checkout: { sessions: { list: vi.fn(), expire: vi.fn() } },
      subscriptions: {
        list: vi.fn(async () => ({
          data: [{ id: 'sub_x', status: 'active', metadata: { plan: 'company', company_id: 'other' } }],
        })),
      },
    };
    await expect(stripeCustomerHasBlockingSubscription(stripe, 'cus_1', {
      plan: 'company',
      companyId: 'mine',
    })).resolves.toBe(false);
  });
});

describe('AR3-05 checkout wiring', () => {
  const src = read('supabase/functions/bd-create-checkout/index.ts');
  const webhook = read('supabase/functions/bd-stripe-webhook/index.ts');

  it('reuses a Stripe customer, expires open sessions, and still runs the DB guard first', () => {
    const guard = src.indexOf('hasLiveSubscription([');
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(src.indexOf('esm.sh/stripe'));
    expect(src).toContain('resolveStripeCustomerId');
    expect(src).toContain('expireOpenCheckoutSessions');
    expect(src).toContain('stripeCustomerHasBlockingSubscription');
    expect(src).toContain('customer: customerId');
    expect(src).not.toContain('customer_email:');
    expect(src).toContain('stripeCheckoutCustomer');
  });

  it('webhook derives company status from all subscriptions', () => {
    expect(webhook).toContain('companyBillingFromSubscriptions');
    expect(webhook).toContain('read company subscriptions');
  });

  it('DB live guard still treats incomplete alone as not live', () => {
    expect(hasLiveSubscription(['incomplete', 'canceled'])).toBe(false);
  });
});
