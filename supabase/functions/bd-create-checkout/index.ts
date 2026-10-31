import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const priceCompanyMonth = Deno.env.get("STRIPE_PRICE_COMPANY_MONTH");
  const priceCompanyYear = Deno.env.get("STRIPE_PRICE_COMPANY_YEAR");
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

    const body = await req.json() as { plan: "company" | "individual"; interval: "month" | "year"; companyId?: string };
    let priceId = "";
    let quantity = 1;
    const metadata: Record<string, string> = { plan: body.plan, user_id: user.id };

    if (body.plan === "company") {
      if (!body.companyId) throw new Error("companyId required");
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: mem } = await admin.from("bd_company_members").select("role")
        .eq("company_id", body.companyId).eq("user_id", user.id).eq("active", true).maybeSingle();
      if (!mem || !["owner", "hr_viewer"].includes(mem.role)) throw new Error("Forbidden");
      const { data: company } = await admin.from("bd_companies").select("seat_count").eq("id", body.companyId).single();
      quantity = Math.max(company?.seat_count ?? 0, 8);
      priceId = body.interval === "year" ? (priceCompanyYear || "") : priceCompanyMonth;
      metadata.company_id = body.companyId;
    } else {
      priceId = body.interval === "year" ? (priceIndivYear || "") : (priceIndivMonth || "");
    }
    if (!priceId) {
      return new Response(JSON.stringify({ available: false, message: "Payments not yet available" }), {
        status: 200, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const Stripe = (await import("https://esm.sh/stripe@17.3.1?target=deno")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity }],
      success_url: `${siteUrl}/en/pricing?checkout=success`,
      cancel_url: `${siteUrl}/en/pricing?checkout=cancel`,
      client_reference_id: body.companyId || user.id,
      metadata,
      subscription_data: { metadata, trial_period_days: 14 },
      allow_promotion_codes: true,
      customer_email: user.email,
    } as any);

    return new Response(JSON.stringify({ available: true, url: session.url }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ available: false, message: e instanceof Error ? e.message : "error" }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
