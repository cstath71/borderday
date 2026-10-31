import { supabase, supabaseConfigured } from './supabase';

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; reason: 'not_available' | 'error'; message: string };

/** Company: €5/active employee/mo, min €39; yearly = 10 months (2 free). Individual: €4.99/mo or €49/yr. */
export async function startCheckout(opts: {
  plan: 'company' | 'individual';
  interval: 'month' | 'year';
  companyId?: string;
}): Promise<CheckoutResult> {
  if (!supabaseConfigured || !supabase) {
    return { ok: false, reason: 'not_available', message: 'Payments not yet available' };
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
  const body = res.data as { url?: string; available?: boolean; message?: string } | null;
  if (!body?.url) {
    return {
      ok: false,
      reason: 'not_available',
      message: body?.message || 'Payments not yet available',
    };
  }
  return { ok: true, url: body.url };
}

export async function openCustomerPortal(companyId?: string): Promise<CheckoutResult> {
  if (!supabaseConfigured || !supabase) {
    return { ok: false, reason: 'not_available', message: 'Payments not yet available' };
  }
  const res = await supabase.functions.invoke('bd-customer-portal', {
    body: { companyId },
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

export function companyHasPaidAccess(status: string | null | undefined, trialEndsAt?: string | null): boolean {
  if (status === 'active' || status === 'trialing') return true;
  if (trialEndsAt && new Date(trialEndsAt).getTime() > Date.now()) return true;
  return false;
}
