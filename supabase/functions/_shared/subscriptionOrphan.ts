/** AR3-10: bd_subscriptions_check requires company rows to have company_id and individual rows to have user_id. */

export type PlanKind = "company" | "individual";

/** Accept only the two enum values; empty/missing falls back from company_id presence. */
export function normalizePlanKind(raw: unknown, hasCompanyId: boolean): PlanKind | null {
  if (raw === "company" || raw === "individual") return raw;
  if (raw == null || raw === "") return hasCompanyId ? "company" : "individual";
  return null;
}

/**
 * Decide whether an upsert would satisfy bd_subscriptions_check.
 * Orphans (deleted company / deleted user) must be acknowledged without writing.
 */
export function subscriptionWriteAction(opts: {
  plan: PlanKind;
  companyId: string | null | undefined;
  userId: string | null | undefined;
  companyExists: boolean;
  userExists: boolean;
}): "upsert" | "orphan_ack" {
  if (opts.plan === "company") {
    if (!opts.companyId || !opts.companyExists) return "orphan_ack";
    return "upsert";
  }
  if (!opts.userId || !opts.userExists) return "orphan_ack";
  return "upsert";
}
