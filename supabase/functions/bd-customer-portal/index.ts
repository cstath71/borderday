import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const siteUrl = Deno.env.get("BD_SITE_URL") || "https://borderday.com";
  if (!stripeKey) {
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const body = await req.json().catch(() => ({})) as { companyId?: string };
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let customerId: string | null = null;
    if (body.companyId) {
      const { data } = await admin.from("bd_companies").select("stripe_customer_id").eq("id", body.companyId).single();
      customerId = data?.stripe_customer_id ?? null;
    } else {
      const { data } = await admin.from("bd_subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
      customerId = data?.stripe_customer_id ?? null;
    }
    if (!customerId) {
      return new Response(JSON.stringify({ available: false, message: "No billing customer yet" }), {
        status: 200, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const Stripe = (await import("https://esm.sh/stripe@17.3.1?target=deno")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-03-31.basil" });
    const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${siteUrl}/en/pricing` });
    return new Response(JSON.stringify({ available: true, url: portal.url }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ available: false, message: e instanceof Error ? e.message : "error" }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
