import { supabase, supabaseConfigured } from './supabase';

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; reason: 'not_available' | 'error' | 'already_subscribed'; message: string };

/** Company: €5/active employee/mo, flat €39 for 1–7 seats; yearly = 10 months (2 free). Individual: €4.99/mo or €49/yr. */
export async function startCheckout(opts: {
  plan: 'company' | 'individual';
  interval: 'month' | 'year';
  companyId?: string;
  lang?: string;
  /** Individual (B2C) only: customer expressly asked to start during the withdrawal period and acknowledged the statutory right ends only on full performance. */
  expressStartAcknowledged?: boolean;
}): Promise<CheckoutResult> {
  if (!supabaseConfigured || !supabase) {
    return { ok: false, reason: 'not_available', message: 'Payments not yet available' };
  }
  if (opts.plan === 'individual' && !opts.expressStartAcknowledged) {
    return { ok: false, reason: 'error', message: 'Express start acknowledgement required' };
  }
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return { ok: false, reason: 'error', message: 'Sign in required' };
  }
  const res = await supabase.functions.invoke('bd-create-checkout', {
    body: opts,
  });
  if (res.error) {
    const msg = res.error.message || 'Checkout failed';
    if (/not.?available|not configured|STRIPE/i.test(msg)) {
      return { ok: false, reason: 'not_available', message: 'Payments not yet available' };
    }
    return { ok: false, reason: 'error', message: msg };
  }
  const body = res.data as { url?: string; available?: boolean; code?: string; message?: string } | null;
  if (body?.code === 'already_subscribed') {
    return { ok: false, reason: 'already_subscribed', message: body.message || 'Already subscribed' };
  }
  if (!body?.url) {
    return {
      ok: false,
      reason: body?.available === false && body?.message && !/not yet available/i.test(body.message)
        ? 'error'
        : 'not_available',
      message: body?.message || 'Payments not yet available',
    };
  }
  return { ok: true, url: body.url };
}

export async function openCustomerPortal(companyId?: string, lang?: string): Promise<CheckoutResult> {
  if (!supabaseConfigured || !supabase) {
    return { ok: false, reason: 'not_available', message: 'Payments not yet available' };
  }
  const res = await supabase.functions.invoke('bd-customer-portal', {
    body: { companyId, lang },
  });
  if (res.error) {
    return { ok: false, reason: 'not_available', message: 'Payments not yet available' };
  }
  const body = res.data as { url?: string; message?: string } | null;
  if (!body?.url) {
    return { ok: false, reason: 'not_available', message: body?.message || 'Payments not yet available' };
  }
  return { ok: true, url: body.url };
}

/**
 * Whether there is a plan left to cancel. Wider than paid access on purpose: a past_due customer has
 * lost access but is still being billed, and must be able to stop it.
 */
export function planIsCancellable(status: string | null | undefined): boolean {
  return !!status && status !== 'none' && status !== 'canceled';
}

export function companyHasPaidAccess(status: string | null | undefined, trialEndsAt?: string | null): boolean {
  if (status === 'active' || status === 'trialing') return true;
  if (trialEndsAt && new Date(trialEndsAt).getTime() > Date.now()) return true;
  return false;
}

export type PlanStatus =
  | { key: 'planTrialing' | 'planActive'; date: string }
  | { key: 'planActiveNoDate' | 'planPastDue' | 'planCanceled' | 'planNone' };

/**
 * The line on the HR dashboard. "Ends on" stays neutral on purpose: BorderDay does not store whether a
 * plan cancelled in the portal will renew, so it never says "renews on".
 */
export function planStatus(
  company: { subscription_status?: string | null; trial_ends_at?: string | null; current_period_end?: string | null },
  now = Date.now(),
): PlanStatus {
  const status = company.subscription_status;
  const trialEnd = company.trial_ends_at;
  if (status === 'past_due') return { key: 'planPastDue' };
  if (status === 'active') {
    return company.current_period_end ? { key: 'planActive', date: company.current_period_end } : { key: 'planActiveNoDate' };
  }
  // Same rule as companyHasPaidAccess: a trial end in the future gives access whatever the status says.
  if (trialEnd && new Date(trialEnd).getTime() > now) return { key: 'planTrialing', date: trialEnd };
  if (status === 'trialing') {
    return company.current_period_end ? { key: 'planTrialing', date: company.current_period_end } : { key: 'planActiveNoDate' };
  }
  return status === 'canceled' ? { key: 'planCanceled' } : { key: 'planNone' };
}
