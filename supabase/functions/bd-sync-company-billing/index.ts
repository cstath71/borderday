import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { resolveCompanyBilling } from "../_shared/companyPricing.ts";
import { corsHeaders, GENERIC_ERROR, logFailure } from "../_shared/http.ts";

/**
 * Align a company's Stripe subscription item with current active seat_count.
 * Call after members join/leave (or from HR dashboard). Switches between
 * flat minimum (≤7 seats) and per-seat (≥8) prices.
 */
Deno.serve(async (req) => {
  const cors = corsHeaders(req.headers.get("Origin"), Deno.env.get("BD_SITE_URL"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const priceCompanyMonth = Deno.env.get("STRIPE_PRICE_COMPANY_MONTH");
  const priceCompanyYear = Deno.env.get("STRIPE_PRICE_COMPANY_YEAR");
  const priceCompanyMinMonth = Deno.env.get("STRIPE_PRICE_COMPANY_MIN_MONTH");
  const priceCompanyMinYear = Deno.env.get("STRIPE_PRICE_COMPANY_MIN_YEAR");
  if (!stripeKey || !priceCompanyMonth) {
    return new Response(JSON.stringify({ available: false, message: "Payments not yet available" }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) throw new Error("Unauthorized");

    const body = await req.json() as { companyId?: string };
    if (!body.companyId) throw new Error("companyId required");

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: mem } = await admin.from("bd_company_members").select("role")
      .eq("company_id", body.companyId).eq("user_id", user.id).eq("active", true).maybeSingle();
    // Any active member: acceptInvite calls this as the new employee. The sync takes no input,
    // it only aligns Stripe with the server-side seat_count.
    if (!mem) throw new Error("Forbidden");

    const { data: company } = await admin.from("bd_companies")
      .select("seat_count, subscription_status")
      .eq("id", body.companyId).single();
    if (!company) throw new Error("Company not found");

    const { data: subRow } = await admin.from("bd_subscriptions")
      .select("stripe_subscription_id, status")
      .eq("company_id", body.companyId)
      .in("status", ["active", "trialing", "past_due"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!subRow?.stripe_subscription_id) {
      return new Response(JSON.stringify({ available: true, synced: false, reason: "no_subscription" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const Stripe = (await import("https://esm.sh/stripe@18.5.0?target=deno")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-03-31.basil" });
    const sub = await stripe.subscriptions.retrieve(subRow.stripe_subscription_id);
    const item = sub.items?.data?.[0];
    if (!item?.price?.id) throw new Error("No subscription item");

    const interval = (item.price.recurring?.interval === "year" ? "year" : "month") as "month" | "year";
    const billing = resolveCompanyBilling(company.seat_count ?? 0, interval);
    const targetPriceId = billing.priceKind === "min"
      ? (interval === "year" ? priceCompanyMinYear : priceCompanyMinMonth)
      : (interval === "year" ? priceCompanyYear : priceCompanyMonth);
    if (!targetPriceId) {
      return new Response(JSON.stringify({ available: false, message: "Price not configured" }), {
        status: 200, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const needsPrice = item.price.id !== targetPriceId;
    const needsQty = (item.quantity ?? 1) !== billing.quantity;
    if (!needsPrice && !needsQty) {
      await stripe.subscriptions.update(sub.id, {
        metadata: {
          ...(sub.metadata || {}),
          active_seats: String(billing.seats),
          billing_mode: billing.mode,
          company_id: body.companyId,
        },
      });
      return new Response(JSON.stringify({
        available: true, synced: true, changed: false, mode: billing.mode, quantity: billing.quantity, seats: billing.seats,
      }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    const updated = await stripe.subscriptions.update(sub.id, {
      items: [{ id: item.id, price: targetPriceId, quantity: billing.quantity }],
      metadata: {
        ...(sub.metadata || {}),
        active_seats: String(billing.seats),
        billing_mode: billing.mode,
        company_id: body.companyId,
      },
      proration_behavior: "create_prorations",
    });

    await admin.from("bd_subscriptions").update({
      seat_quantity: billing.quantity,
      price_id: targetPriceId,
      updated_at: new Date().toISOString(),
    }).eq("stripe_subscription_id", updated.id);

    return new Response(JSON.stringify({
      available: true,
      synced: true,
      changed: true,
      mode: billing.mode,
      quantity: billing.quantity,
      seats: billing.seats,
      priceId: targetPriceId,
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    logFailure("bd-sync-company-billing", e);
    return new Response(JSON.stringify({ available: false, message: GENERIC_ERROR }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
