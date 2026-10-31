import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { isCompanyFlatMinimumPrice, resolveCompanyBilling } from "../_shared/companyPricing.ts";

Deno.serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const priceCompanyMonth = Deno.env.get("STRIPE_PRICE_COMPANY_MONTH");
  const priceCompanyYear = Deno.env.get("STRIPE_PRICE_COMPANY_YEAR");
  const priceCompanyMinMonth = Deno.env.get("STRIPE_PRICE_COMPANY_MIN_MONTH");
  const priceCompanyMinYear = Deno.env.get("STRIPE_PRICE_COMPANY_MIN_YEAR");
  if (!stripeKey || !webhookSecret) {
    return new Response(JSON.stringify({ ok: false, message: "Stripe not configured" }), { status: 503 });
  }
  const Stripe = (await import("https://esm.sh/stripe@17.3.1?target=deno")).default;
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-03-31.basil" });
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(raw, sig!, webhookSecret);
  } catch (e) {
    return new Response(`Webhook Error: ${e instanceof Error ? e.message : "bad sig"}`, { status: 400 });
  }
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  function pickCompanyPriceId(interval: "month" | "year", priceKind: "min" | "seat"): string | null {
    if (priceKind === "min") {
      return interval === "year" ? (priceCompanyMinYear || null) : (priceCompanyMinMonth || null);
    }
    return interval === "year" ? (priceCompanyYear || null) : (priceCompanyMonth || null);
  }

  /** When active seats cross the 7/8 boundary, switch subscription item price + qty. */
  async function syncCompanySubscriptionItem(sub: any, activeSeats: number) {
    const item = sub.items?.data?.[0];
    if (!item?.price?.id) return sub;
    const interval = (item.price.recurring?.interval === "year" ? "year" : "month") as "month" | "year";
    const billing = resolveCompanyBilling(activeSeats, interval);
    const targetPriceId = pickCompanyPriceId(interval, billing.priceKind);
    if (!targetPriceId) return sub;
    const needsPrice = item.price.id !== targetPriceId;
    const needsQty = (item.quantity ?? 1) !== billing.quantity;
    const metaSeats = String(billing.seats);
    const metaMode = billing.mode;
    const needsMeta =
      sub.metadata?.active_seats !== metaSeats || sub.metadata?.billing_mode !== metaMode;
    if (!needsPrice && !needsQty && !needsMeta) return sub;
    const updated = await stripe.subscriptions.update(sub.id, {
      items: [{
        id: item.id,
        price: targetPriceId,
        quantity: billing.quantity,
      }],
      metadata: {
        ...(sub.metadata || {}),
        active_seats: metaSeats,
        billing_mode: metaMode,
      },
      proration_behavior: "create_prorations",
    });
    return updated;
  }

  async function upsertFromSubscription(sub: any, opts?: { preferDbSeats?: boolean }) {
    const meta = sub.metadata || {};
    const statusMap: Record<string, string> = {
      trialing: "trialing", active: "active", past_due: "past_due", canceled: "canceled",
      unpaid: "past_due", incomplete: "incomplete", incomplete_expired: "canceled",
    };
    const status = statusMap[sub.status] || "none";
    const companyId = meta.company_id as string | undefined;
    const userId = meta.user_id as string | undefined;
    const plan = (meta.plan as string) || (companyId ? "company" : "individual");
    const priceId = sub.items?.data?.[0]?.price?.id as string | undefined;
    const stripeQty = sub.items?.data?.[0]?.quantity ?? 1;
    const onFlat = isCompanyFlatMinimumPrice(priceId, priceCompanyMinMonth, priceCompanyMinYear);
    // Billed quantity on flat is always 1; real seats live in metadata / bd_companies.seat_count.
    const metaSeats = meta.active_seats != null ? Number(meta.active_seats) : NaN;
    const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
    const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;

    if (companyId) {
      const { data: company } = await admin.from("bd_companies")
        .select("seat_count, stripe_customer_id")
        .eq("id", companyId).maybeSingle();
      const dbSeats = company?.seat_count ?? 0;
      // Prefer DB active-employee count; never overwrite seat_count with flat qty=1.
      let seatCountToStore = dbSeats;
      if (!opts?.preferDbSeats && !onFlat && Number.isFinite(stripeQty) && stripeQty > 0) {
        // Per-seat subscriptions: Stripe quantity tracks seats.
        seatCountToStore = stripeQty;
      } else if (Number.isFinite(metaSeats) && metaSeats >= 0 && dbSeats === 0) {
        seatCountToStore = metaSeats;
      }

      // If we have an active/trialing company sub, align price/qty with current DB seats.
      if ((status === "active" || status === "trialing") && typeof dbSeats === "number") {
        sub = await syncCompanySubscriptionItem(sub, dbSeats);
      }

      await admin.from("bd_companies").update({
        stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
        subscription_status: status,
        // Keep authoritative seat_count from members trigger when on flat or when preferDbSeats.
        ...(onFlat || opts?.preferDbSeats ? {} : { seat_count: seatCountToStore }),
        current_period_end: periodEnd,
        trial_ends_at: trialEnd,
        plan_kind: "company",
      }).eq("id", companyId);
    }

    const billedQty = sub.items?.data?.[0]?.quantity ?? stripeQty;
    await admin.from("bd_subscriptions").upsert({
      company_id: companyId || null,
      user_id: plan === "individual" ? userId : null,
      plan_kind: plan,
      stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
      stripe_subscription_id: sub.id,
      status,
      seat_quantity: billedQty,
      price_id: sub.items?.data?.[0]?.price?.id ?? priceId,
      current_period_end: periodEnd,
      trial_ends_at: trialEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_subscription_id" });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        if (!sub.metadata?.company_id && session.metadata?.company_id) {
          await stripe.subscriptions.update(sub.id, { metadata: session.metadata });
          sub.metadata = session.metadata;
        }
        await upsertFromSubscription(sub, { preferDbSeats: true });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await upsertFromSubscription(event.data.object, { preferDbSeats: true });
      break;
  }
  return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
});
