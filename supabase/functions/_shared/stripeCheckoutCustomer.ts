// AR3-05: reuse one Stripe customer, expire earlier open Checkout sessions, and refuse when
// Stripe already shows a live / incomplete subscription the DB guard has not recorded yet.
import { STRIPE_BLOCKING_SUBSCRIPTION_STATUSES } from "./checkoutGuard.ts";

/** Minimal Stripe surface used here so unit tests can stub without the SDK. */
export type StripeCheckoutClient = {
  customers: {
    retrieve: (id: string) => Promise<{ deleted?: boolean; id?: string } | { deleted: true }>;
    list: (params: { email: string; limit: number }) => Promise<{ data: Array<{ id: string }> }>;
    create: (params: { email: string; metadata?: Record<string, string> }) => Promise<{ id: string }>;
  };
  checkout: {
    sessions: {
      list: (params: {
        customer: string;
        status: string;
        limit: number;
      }) => Promise<{ data: Array<{ id: string }> }>;
      expire: (id: string) => Promise<unknown>;
    };
  };
  subscriptions: {
    list: (params: {
      customer: string;
      status?: string;
      limit: number;
    }) => Promise<{
      data: Array<{
        id: string;
        status: string;
        metadata?: Record<string, string> | null;
      }>;
    }>;
  };
};

export async function resolveStripeCustomerId(
  stripe: StripeCheckoutClient,
  opts: {
    existingId: string | null | undefined;
    email: string;
    metadata?: Record<string, string>;
  },
): Promise<string> {
  if (opts.existingId) {
    try {
      const existing = await stripe.customers.retrieve(opts.existingId);
      if (!("deleted" in existing && existing.deleted)) {
        return opts.existingId;
      }
    } catch {
      // Fall through to email lookup / create.
    }
  }
  const listed = await stripe.customers.list({ email: opts.email, limit: 1 });
  if (listed.data[0]?.id) return listed.data[0].id;
  const created = await stripe.customers.create({
    email: opts.email,
    metadata: opts.metadata,
  });
  return created.id;
}

/** Expire every open Checkout session for this customer so a second tab cannot complete an older one. */
export async function expireOpenCheckoutSessions(
  stripe: StripeCheckoutClient,
  customerId: string,
): Promise<number> {
  const open = await stripe.checkout.sessions.list({
    customer: customerId,
    status: "open",
    limit: 100,
  });
  let expired = 0;
  for (const session of open.data) {
    await stripe.checkout.sessions.expire(session.id);
    expired += 1;
  }
  return expired;
}

/**
 * True when Stripe already has a blocking subscription for this plan / company.
 * Complements the DB guard for the window before the webhook writes.
 */
export async function stripeCustomerHasBlockingSubscription(
  stripe: StripeCheckoutClient,
  customerId: string,
  opts: { plan: "company" | "individual"; companyId?: string; userId?: string },
): Promise<boolean> {
  const listed = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  });
  return listed.data.some((sub) => {
    if (!STRIPE_BLOCKING_SUBSCRIPTION_STATUSES.has(sub.status)) return false;
    const meta = sub.metadata || {};
    if (opts.plan === "company") {
      return !!opts.companyId && meta.company_id === opts.companyId;
    }
    if (meta.company_id) return false;
    if (meta.plan && meta.plan !== "individual") return false;
    if (opts.userId && meta.user_id && meta.user_id !== opts.userId) return false;
    return true;
  });
}
