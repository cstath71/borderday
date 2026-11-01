// `inv.subscription` was removed from Invoice in 2025-03-31.basil, the version this project uses.
// Read both shapes, as the webhook endpoint's own API version may differ from the client's.
type SubscriptionRef = string | { id?: string | null } | null | undefined;

export function invoiceSubscriptionId(inv: {
  subscription?: SubscriptionRef;
  parent?: { subscription_details?: { subscription?: SubscriptionRef } | null } | null;
}): string | null {
  for (const ref of [inv.parent?.subscription_details?.subscription, inv.subscription]) {
    const id = typeof ref === "string" ? ref : ref?.id;
    if (id) return id;
  }
  return null;
}
