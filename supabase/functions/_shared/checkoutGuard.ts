/** Statuses where Stripe is still billing, or will bill: a new checkout would create a second subscription. */
const LIVE_SUBSCRIPTION_STATUSES = new Set(["trialing", "active", "past_due"]);

/**
 * Stripe statuses that mean a Checkout / subscription is already in flight for this customer.
 * "incomplete" is included so a second tab cannot open while the first payment is finishing
 * (AR3-05), before the webhook has written the row the DB guard reads.
 */
export const STRIPE_BLOCKING_SUBSCRIPTION_STATUSES = new Set([
  "trialing",
  "active",
  "past_due",
  "incomplete",
]);

export const ALREADY_SUBSCRIBED_CODE = "already_subscribed";

export function hasLiveSubscription(statuses: Array<string | null | undefined>): boolean {
  return statuses.some((s) => !!s && LIVE_SUBSCRIPTION_STATUSES.has(s));
}

/** Higher rank wins when deriving company.subscription_status from every known row (AR3-05). */
const COMPANY_STATUS_RANK: Record<string, number> = {
  active: 50,
  trialing: 40,
  past_due: 30,
  incomplete: 20,
  canceled: 10,
  none: 0,
};

export type CompanySubBillingRow = {
  status: string | null | undefined;
  stripe_subscription_id?: string | null;
  current_period_end?: string | null;
  trial_ends_at?: string | null;
};

/**
 * Pick the company-facing status (and period / trial dates) from every known subscription,
 * so a late "canceled" webhook cannot mark the company canceled while another sub still bills.
 */
export function companyBillingFromSubscriptions(
  rows: CompanySubBillingRow[],
): { status: string; current_period_end: string | null; trial_ends_at: string | null } {
  let best: CompanySubBillingRow | null = null;
  let bestRank = -1;
  for (const row of rows) {
    const status = row.status || "none";
    const rank = COMPANY_STATUS_RANK[status] ?? 0;
    if (rank > bestRank) {
      bestRank = rank;
      best = row;
    }
  }
  if (!best) {
    return { status: "none", current_period_end: null, trial_ends_at: null };
  }
  return {
    status: best.status || "none",
    current_period_end: best.current_period_end ?? null,
    trial_ends_at: best.trial_ends_at ?? null,
  };
}

/**
 * Statuses that prove a subscription or trial really started. "none" and "incomplete" do not:
 * an abandoned or failed first payment used no trial, unless it recorded a trial end.
 */
const TRIAL_SPENT_STATUSES = new Set(["trialing", "active", "past_due", "canceled"]);

export type SubscriptionHistoryRow = {
  status?: string | null;
  subscription_status?: string | null;
  trial_ends_at?: string | null;
};

/** One free trial per person and per company, including one that was cancelled. */
export function trialAlreadyUsed(rows: SubscriptionHistoryRow[]): boolean {
  return rows.some((r) => {
    const status = r.status ?? r.subscription_status;
    return !!r.trial_ends_at || (!!status && TRIAL_SPENT_STATUSES.has(status));
  });
}

/** The trial fields of subscription_data. Stripe gets neither field when no trial is offered. */
export function subscriptionTrialFields(trialUsed: boolean, trialDays: number) {
  if (trialUsed) return {};
  return {
    trial_period_days: trialDays,
    trial_settings: { end_behavior: { missing_payment_method: "cancel" as const } },
  };
}

/** Company checkouts return to the company's dashboard. Others keep the pricing page and its banner. */
export function checkoutSuccessUrl(siteUrl: string, lang: string, plan: string, companyId?: string): string {
  return plan === "company" && companyId
    ? `${siteUrl}/${lang}/company/${encodeURIComponent(companyId)}/dashboard?checkout=success`
    : `${siteUrl}/${lang}/pricing?checkout=success`;
}
