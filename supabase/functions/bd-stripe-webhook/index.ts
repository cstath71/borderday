import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    return new Response(JSON.stringify({ ok: false, message: "Stripe not configured" }), { status: 503 });
  }
  const Stripe = (await import("https://esm.sh/stripe@17.3.1?target=deno")).default;
  const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(raw, sig!, webhookSecret);
  } catch (e) {
    return new Response(`Webhook Error: ${e instanceof Error ? e.message : "bad sig"}`, { status: 400 });
  }
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  async function upsertFromSubscription(sub: any) {
    const meta = sub.metadata || {};
    const statusMap: Record<string, string> = {
      trialing: "trialing", active: "active", past_due: "past_due", canceled: "canceled",
      unpaid: "past_due", incomplete: "incomplete", incomplete_expired: "canceled",
    };
    const status = statusMap[sub.status] || "none";
    const companyId = meta.company_id as string | undefined;
    const userId = meta.user_id as string | undefined;
    const plan = (meta.plan as string) || (companyId ? "company" : "individual");
    const seatQty = sub.items?.data?.[0]?.quantity ?? 1;
    const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
    const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
    if (companyId) {
      await admin.from("bd_companies").update({
        stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
        subscription_status: status, seat_count: seatQty, current_period_end: periodEnd,
        trial_ends_at: trialEnd, plan_kind: "company",
      }).eq("id", companyId);
    }
    await admin.from("bd_subscriptions").upsert({
      company_id: companyId || null,
      user_id: plan === "individual" ? userId : null,
      plan_kind: plan,
      stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
      stripe_subscription_id: sub.id, status, seat_quantity: seatQty,
      price_id: sub.items?.data?.[0]?.price?.id, current_period_end: periodEnd,
      trial_ends_at: trialEnd, updated_at: new Date().toISOString(),
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
        await upsertFromSubscription(sub);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await upsertFromSubscription(event.data.object);
      break;
  }
  return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
});
