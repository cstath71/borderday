import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { isCompanyFlatMinimumPrice, resolveCompanyBilling } from "../_shared/companyPricing.ts";
import { inviteLang } from "../_shared/inviteEmail.ts";
import { beginEvent, checkWrite, finishEvent, WebhookWriteError } from "../_shared/stripeEvents.ts";
import { invoiceSubscriptionId } from "../_shared/stripeInvoice.ts";

Deno.serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const priceCompanyMonth = Deno.env.get("STRIPE_PRICE_COMPANY_MONTH");
  const priceCompanyYear = Deno.env.get("STRIPE_PRICE_COMPANY_YEAR");
  const priceCompanyMinMonth = Deno.env.get("STRIPE_PRICE_COMPANY_MIN_MONTH");
  const priceCompanyMinYear = Deno.env.get("STRIPE_PRICE_COMPANY_MIN_YEAR");
  const priceIndivYear = Deno.env.get("STRIPE_PRICE_INDIVIDUAL_YEAR");
  if (!stripeKey || !webhookSecret) {
    return new Response(JSON.stringify({ ok: false, message: "Stripe not configured" }), { status: 503 });
  }
  const Stripe = (await import("https://esm.sh/stripe@18.5.0?target=deno")).default;
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-03-31.basil" });
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: any;
  try {
    // Deno SubtleCrypto requires the async verifier (sync constructEvent → 400).
    event = await stripe.webhooks.constructEventAsync(raw, sig!, webhookSecret);
  } catch (e) {
    return new Response("Webhook signature verification failed", { status: 400 });
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

  function periodEndIso(sub: any): string | null {
    // basil: current_period_* moved onto subscription items
    const item = sub.items?.data?.[0];
    const unix = item?.current_period_end ?? sub.current_period_end ?? sub.trial_end ?? null;
    return unix ? new Date(unix * 1000).toISOString() : null;
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
    const metaSeats = meta.active_seats != null ? Number(meta.active_seats) : NaN;
    const periodEnd = periodEndIso(sub);
    const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;

    if (companyId) {
      const companyRead = await admin.from("bd_companies")
        .select("seat_count, stripe_customer_id")
        .eq("id", companyId).maybeSingle();
      checkWrite(companyRead, "read company");
      const dbSeats = companyRead.data?.seat_count ?? 0;
      let seatCountToStore = dbSeats;
      if (!opts?.preferDbSeats && !onFlat && Number.isFinite(stripeQty) && stripeQty > 0) {
        seatCountToStore = stripeQty;
      } else if (Number.isFinite(metaSeats) && metaSeats >= 0 && dbSeats === 0) {
        seatCountToStore = metaSeats;
      }

      if ((status === "active" || status === "trialing") && typeof dbSeats === "number") {
        sub = await syncCompanySubscriptionItem(sub, dbSeats);
      }

      checkWrite(await admin.from("bd_companies").update({
        stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
        subscription_status: status,
        ...(onFlat || opts?.preferDbSeats ? {} : { seat_count: seatCountToStore }),
        current_period_end: periodEnd,
        trial_ends_at: trialEnd,
        plan_kind: "company",
      }).eq("id", companyId), "update company");
    }

    const billedQty = sub.items?.data?.[0]?.quantity ?? stripeQty;
    checkWrite(await admin.from("bd_subscriptions").upsert({
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
    }, { onConflict: "stripe_subscription_id" }), "upsert subscription");
  }

  /** Consumer safeguard (H12): remind before yearly individual renewal. Honours RESEND_LIVE. */
  async function sendConsumerReminder(opts: {
    kind: "yearly_renewal" | "trial_ending";
    to: string;
    subscriptionId: string;
    renewOnIso: string | null;
    /** Checkout language from subscription metadata. Text is English until translated templates exist; the link follows it. */
    lang: unknown;
  }) {
    const from = Deno.env.get("RESEND_FROM") || "BorderDay <hello@borderday.com>";
    const apiKey = Deno.env.get("RESEND_API_KEY_BORDERDAY") || Deno.env.get("RESEND_API_KEY");
    // Live email approved 2026-10-31 (Gus t415u). Default on; set RESEND_LIVE=0 to pause.
    const live = (Deno.env.get("RESEND_LIVE") ?? "1") === "1";
    const siteUrl = Deno.env.get("BD_SITE_URL") || "https://borderday.com";
    const cancelUrl = `${siteUrl}/${inviteLang(opts.lang)}/cancel`;
    const renewOn = opts.renewOnIso
      ? new Date(opts.renewOnIso).toLocaleDateString("en-GB", { timeZone: "Europe/Zurich" })
      : "the renewal date";
    const subject = opts.kind === "yearly_renewal"
      ? "BorderDay: your yearly plan renews soon"
      : "BorderDay: your free trial ends soon";
    const text = opts.kind === "yearly_renewal"
      ? `Your BorderDay individual yearly plan (€49 incl. VAT) renews on ${renewOn} unless you cancel.\n\nCancel anytime: ${cancelUrl}\n(or use Cancel subscription in the footer / your Link order tools).\n\nAfter the first year you can cancel a renewed plan at any time; unused-period refunds apply where mandatory consumer law requires them.\n\n— BorderDay`
      : `Your BorderDay free trial ends on ${renewOn}. After that, the plan you chose is charged automatically and renews until you cancel.\n\nCancel before the trial ends and nothing is charged: ${cancelUrl}\n\n— BorderDay`;
    if (!live || !apiKey) {
      console.log("[bd-stripe-webhook] reminder dry-run", { kind: opts.kind, subscriptionId: opts.subscriptionId });
      return;
    }
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject,
        text,
      }),
    });
    console.log("[bd-stripe-webhook] reminder", { kind: opts.kind, subscriptionId: opts.subscriptionId, ok: r.ok });
  }

  async function customerEmail(customerRef: string | { id?: string } | null): Promise<string | null> {
    if (!customerRef) return null;
    const id = typeof customerRef === "string" ? customerRef : customerRef.id;
    if (!id) return null;
    const cust = await stripe.customers.retrieve(id);
    if (cust.deleted) return null;
    return (cust as { email?: string | null }).email || null;
  }

  function isIndividualYearly(sub: any): boolean {
    const meta = sub.metadata || {};
    const plan = (meta.plan as string) || (meta.company_id ? "company" : "individual");
    if (plan === "company") return false;
    const item = sub.items?.data?.[0];
    const interval = item?.price?.recurring?.interval;
    const priceId = item?.price?.id as string | undefined;
    if (interval === "year") return true;
    if (priceIndivYear && priceId === priceIndivYear) return true;
    return false;
  }

  try {
    const state = await beginEvent(admin, event);
    if (state === "duplicate") {
      return new Response(JSON.stringify({ received: true, duplicate: true }), { headers: { "Content-Type": "application/json" } });
    }
    if (state === "process") {
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
        case "invoice.upcoming": {
          const inv = event.data.object;
          const subId = invoiceSubscriptionId(inv);
          if (!subId) break;
          const sub = await stripe.subscriptions.retrieve(subId);
          if (!isIndividualYearly(sub)) break;
          const email = await customerEmail(sub.customer);
          if (!email) break;
          const renewUnix = inv.next_payment_attempt || inv.period_end || null;
          const renewOnIso = renewUnix ? new Date(renewUnix * 1000).toISOString() : periodEndIso(sub);
          await sendConsumerReminder({ kind: "yearly_renewal", to: email, subscriptionId: sub.id, renewOnIso, lang: sub.metadata?.lang });
          break;
        }
        case "customer.subscription.trial_will_end": {
          const sub = event.data.object;
          const email = await customerEmail(sub.customer);
          if (!email) break;
          const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
          await sendConsumerReminder({ kind: "trial_ending", to: email, subscriptionId: sub.id, renewOnIso: trialEnd, lang: sub.metadata?.lang });
          break;
        }
      }
    }
    await finishEvent(admin, event);
  } catch (e) {
    // Non-200 makes Stripe retry. Log which write failed, never the error text: it can hold row values.
    const what = e instanceof WebhookWriteError ? e.what : "handler error";
    console.error("[bd-stripe-webhook] failed", { eventId: event.id, type: event.type, what });
    return new Response(JSON.stringify({ received: false }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
});
