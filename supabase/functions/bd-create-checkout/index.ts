import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  ALREADY_SUBSCRIBED_CODE,
  checkoutSuccessUrl,
  hasLiveSubscription,
  subscriptionTrialFields,
  trialAlreadyUsed,
} from "../_shared/checkoutGuard.ts";
import { resolveCompanyBilling } from "../_shared/companyPricing.ts";
import { TRIAL_DAYS } from "../_shared/trial.ts";
import { corsHeaders, GENERIC_ERROR, logFailure } from "../_shared/http.ts";

const CHECKOUT_LOCALES = ["en", "fr", "de", "it", "nl"];

Deno.serve(async (req) => {
  const cors = corsHeaders(req.headers.get("Origin"), Deno.env.get("BD_SITE_URL"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const priceCompanyMonth = Deno.env.get("STRIPE_PRICE_COMPANY_MONTH");
  const priceCompanyYear = Deno.env.get("STRIPE_PRICE_COMPANY_YEAR");
  const priceCompanyMinMonth = Deno.env.get("STRIPE_PRICE_COMPANY_MIN_MONTH");
  const priceCompanyMinYear = Deno.env.get("STRIPE_PRICE_COMPANY_MIN_YEAR");
  const priceIndivMonth = Deno.env.get("STRIPE_PRICE_INDIVIDUAL_MONTH");
  const priceIndivYear = Deno.env.get("STRIPE_PRICE_INDIVIDUAL_YEAR");
  const siteUrl = Deno.env.get("BD_SITE_URL") || "https://borderday.com";

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

    const body = await req.json() as {
      plan: "company" | "individual";
      interval: "month" | "year";
      companyId?: string;
      lang?: string;
      expressStartAcknowledged?: boolean;
    };
    if (!body.expressStartAcknowledged) {
      return new Response(JSON.stringify({ available: false, message: "Express start acknowledgement required" }), {
        status: 200, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    let priceId = "";
    let quantity = 1;
    const lang = (body.lang && /^[a-z]{2}$/.test(body.lang)) ? body.lang : "en";
    // lang: which language to use for this subscription's reminder emails.
    const metadata: Record<string, string> = { plan: body.plan, user_id: user.id, express_start: "1", lang };
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const recordedStatuses: Array<string | null> = [];

    if (body.plan === "company") {
      if (!body.companyId) throw new Error("companyId required");
      const { data: mem } = await admin.from("bd_company_members").select("role")
        .eq("company_id", body.companyId).eq("user_id", user.id).eq("active", true).maybeSingle();
      if (!mem || !["owner", "hr_viewer"].includes(mem.role)) throw new Error("Forbidden");
      const { data: company, error: companyError } = await admin.from("bd_companies")
        .select("seat_count, subscription_status, trial_ends_at").eq("id", body.companyId).single();
      if (companyError) throw new Error("Could not check the existing subscription");
      recordedStatuses.push(company.subscription_status);
      const seats = company.seat_count ?? 0;
      const billing = resolveCompanyBilling(seats, body.interval === "year" ? "year" : "month");
      quantity = billing.quantity;
      if (billing.priceKind === "min") {
        priceId = body.interval === "year" ? (priceCompanyMinYear || "") : (priceCompanyMinMonth || "");
      } else {
        priceId = body.interval === "year" ? (priceCompanyYear || "") : priceCompanyMonth;
      }
      metadata.company_id = body.companyId;
      metadata.active_seats = String(billing.seats);
      metadata.billing_mode = billing.mode;
    } else {
      priceId = body.interval === "year" ? (priceIndivYear || "") : (priceIndivMonth || "");
    }
    if (!priceId) {
      return new Response(JSON.stringify({ available: false, message: "Payments not yet available" }), {
        status: 200, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // A3-05: a second session would mean a second customer, plan and free trial. What the webhook has
    // recorded is enough (Gus: nobody has paid yet), so no live Stripe lookup. If it cannot be read, refuse.
    const subscriptions = admin.from("bd_subscriptions").select("status");
    const { data: subs, error: subsError } = await (body.plan === "company"
      ? subscriptions.eq("company_id", body.companyId!)
      : subscriptions.eq("user_id", user.id).eq("plan_kind", "individual"));
    if (subsError) throw new Error("Could not check the existing subscription");
    if (hasLiveSubscription([...recordedStatuses, ...(subs ?? []).map((s) => s.status)])) {
      return new Response(JSON.stringify({
        available: false,
        code: ALREADY_SUBSCRIBED_CODE,
        message: "This plan already has a subscription. No new checkout was started.",
      }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // E1: one free trial per company and per person, cancelled ones included. Company subscription rows
    // have no user_id, so "this person" also means the companies they run or ran (never mere employee
    // memberships). If the history cannot be read, refuse rather than hand out a second trial.
    const { data: ownSubs, error: ownSubsError } = await admin.from("bd_subscriptions")
      .select("status, trial_ends_at").eq("user_id", user.id);
    if (ownSubsError) throw new Error("Could not check the trial history");
    const { data: ranCompanies, error: ranError } = await admin.from("bd_company_members")
      .select("company_id").eq("user_id", user.id).in("role", ["owner", "hr_viewer"]);
    if (ranError) throw new Error("Could not check the trial history");
    const companyIds = [...new Set([
      ...(ranCompanies ?? []).map((m) => m.company_id as string),
      ...(body.plan === "company" ? [body.companyId!] : []),
    ])];
    const history = [...(ownSubs ?? [])] as Array<Record<string, string | null>>;
    if (companyIds.length > 0) {
      const [companyRows, companySubs] = await Promise.all([
        admin.from("bd_companies").select("subscription_status, trial_ends_at").in("id", companyIds),
        admin.from("bd_subscriptions").select("status, trial_ends_at").in("company_id", companyIds),
      ]);
      if (companyRows.error || companySubs.error) throw new Error("Could not check the trial history");
      history.push(...(companyRows.data ?? []), ...(companySubs.data ?? []));
    }
    const trialUsed = trialAlreadyUsed(history);
    metadata.trial_offered = trialUsed ? "0" : "1";

    // stripe@18+ understands managed_payments; API version must be 2025-03-31.basil+
    const Stripe = (await import("https://esm.sh/stripe@18.5.0?target=deno")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-03-31.basil" });

    // Managed Payments (MoR): managed_payments[enabled]=true.
    // Must NOT send automatic_tax, tax_id_collection, or payment_method_types
    // (docs.stripe.com/payments/managed-payments/update-checkout).
    // Allowed and kept: billing_address_collection, payment_method_collection,
    // allow_promotion_codes, subscription_data (trial + trial_settings + metadata).
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity }],
      success_url: checkoutSuccessUrl(siteUrl, lang, body.plan, body.companyId),
      cancel_url: `${siteUrl}/${lang}/pricing?checkout=cancel`,
      client_reference_id: body.companyId || user.id,
      metadata,
      managed_payments: { enabled: true },
      subscription_data: {
        metadata,
        ...subscriptionTrialFields(trialUsed, TRIAL_DAYS),
      },
      allow_promotion_codes: true,
      // Card required up front so a trial can convert (or cancel if missing).
      payment_method_collection: "always",
      customer_email: user.email,
      billing_address_collection: "required",
      // Otherwise the page follows the browser. Not on the Managed Payments unsupported list.
      ...(CHECKOUT_LOCALES.includes(lang) ? { locale: lang } : {}),
    } as any);

    return new Response(JSON.stringify({ available: true, url: session.url, id: session.id }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    logFailure("bd-create-checkout", e);
    return new Response(JSON.stringify({ available: false, message: GENERIC_ERROR }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
