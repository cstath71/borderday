// Stripe webhook bookkeeping (audit-2 A3-16): retries must be safe, a failed write must fail the
// request so Stripe retries, and an old snapshot must not overwrite a newer one.

/** Only these write subscription state, so only these can make an older delivery stale. */
const STATE_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

/** Carries only which write failed: database error text can hold row values, and this is logged. */
export class WebhookWriteError extends Error {
  constructor(readonly what: string) {
    super(`write failed: ${what}`);
  }
}

export function checkWrite(result: { error?: unknown } | null | undefined, what: string): void {
  if (result?.error) throw new WebhookWriteError(what);
}

type StripeEvent = { id: string; type: string; created: number; data: { object: any } };

/** The subscription whose state this event writes, or null if it writes none. */
export function stateSubscriptionId(event: StripeEvent): string | null {
  if (!STATE_EVENTS.has(event.type)) return null;
  const object = event.data.object;
  if (event.type === "checkout.session.completed") {
    const sub = object?.subscription;
    return (typeof sub === "string" ? sub : sub?.id) ?? null;
  }
  return object?.id ?? null;
}

/** "duplicate": already done. "stale": a newer event already wrote this subscription. Else "process". */
export async function beginEvent(admin: any, event: StripeEvent): Promise<"process" | "duplicate" | "stale"> {
  const seen = await admin.from("bd_stripe_events").select("processed_at").eq("event_id", event.id).maybeSingle();
  checkWrite(seen, "read event");
  if (seen.data?.processed_at) return "duplicate";

  const createdAt = new Date(event.created * 1000).toISOString();
  const subscriptionId = stateSubscriptionId(event);
  // A retry of an event that failed part-way finds its row unfinished and runs again.
  const claim = await admin.from("bd_stripe_events").upsert(
    { event_id: event.id, event_type: event.type, stripe_subscription_id: subscriptionId, event_created_at: createdAt },
    { onConflict: "event_id" },
  );
  checkWrite(claim, "record event");

  // checkout.session.completed re-reads the subscription from Stripe, so it is never an old snapshot.
  if (!subscriptionId || event.type === "checkout.session.completed") return "process";
  const newer = await admin.from("bd_stripe_events").select("event_id")
    .eq("stripe_subscription_id", subscriptionId)
    .gt("event_created_at", createdAt)
    .not("processed_at", "is", null)
    .limit(1);
  checkWrite(newer, "read newer events");
  return newer.data?.length ? "stale" : "process";
}

export async function finishEvent(admin: any, event: StripeEvent): Promise<void> {
  const done = await admin.from("bd_stripe_events").update({ processed_at: new Date().toISOString() }).eq("event_id", event.id);
  checkWrite(done, "finish event");
}
