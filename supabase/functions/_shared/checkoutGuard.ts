/** Statuses where Stripe is still billing, or will bill: a new checkout would create a second subscription. */
const LIVE_SUBSCRIPTION_STATUSES = new Set(["trialing", "active", "past_due"]);

export const ALREADY_SUBSCRIBED_CODE = "already_subscribed";

export function hasLiveSubscription(statuses: Array<string | null | undefined>): boolean {
  return statuses.some((s) => !!s && LIVE_SUBSCRIPTION_STATUSES.has(s));
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
