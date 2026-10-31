import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { resolveCompanyBilling } from "../_shared/companyPricing.ts";
import { TRIAL_DAYS } from "../_shared/trial.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
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
    const metadata: Record<string, string> = { plan: body.plan, user_id: user.id, express_start: "1" };
    const lang = (body.lang && /^[a-z]{2}$/.test(body.lang)) ? body.lang : "en";

    if (body.plan === "company") {
      if (!body.companyId) throw new Error("companyId required");
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: mem } = await admin.from("bd_company_members").select("role")
        .eq("company_id", body.companyId).eq("user_id", user.id).eq("active", true).maybeSingle();
      if (!mem || !["owner", "hr_viewer"].includes(mem.role)) throw new Error("Forbidden");
      const { data: company } = await admin.from("bd_companies").select("seat_count").eq("id", body.companyId).single();
      const seats = company?.seat_count ?? 0;
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
      success_url: `${siteUrl}/${lang}/pricing?checkout=success`,
      cancel_url: `${siteUrl}/${lang}/pricing?checkout=cancel`,
      client_reference_id: body.companyId || user.id,
      metadata,
      managed_payments: { enabled: true },
      subscription_data: {
        metadata,
        trial_period_days: TRIAL_DAYS,
        trial_settings: {
          end_behavior: { missing_payment_method: "cancel" },
        },
      },
      allow_promotion_codes: true,
      // Card required up front so trial can convert (or cancel if missing).
      payment_method_collection: "always",
      customer_email: user.email,
      billing_address_collection: "required",
    } as any);

    return new Response(JSON.stringify({ available: true, url: session.url, id: session.id }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ available: false, message: e instanceof Error ? e.message : "error" }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
