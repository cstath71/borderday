/** Statuses where Stripe is still billing, or will bill: a new checkout would create a second subscription. */
const LIVE_SUBSCRIPTION_STATUSES = new Set(["trialing", "active", "past_due"]);

export const ALREADY_SUBSCRIBED_CODE = "already_subscribed";

export function hasLiveSubscription(statuses: Array<string | null | undefined>): boolean {
  return statuses.some((s) => !!s && LIVE_SUBSCRIPTION_STATUSES.has(s));
}
