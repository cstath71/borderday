import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const body = await req.json() as { invitationId: string; companyId: string };
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: inv } = await admin.from("bd_invitations").select("*, bd_companies(name)")
      .eq("id", body.invitationId).eq("company_id", body.companyId).single();
    if (!inv) throw new Error("Invite not found");
    const siteUrl = Deno.env.get("BD_SITE_URL") || "https://borderday.com";
    const joinUrl = `${siteUrl}/en/join/${inv.token}`;
    const from = Deno.env.get("RESEND_FROM") || "BorderDay <invites@borderday.com>";
    const apiKey = Deno.env.get("RESEND_API_KEY");
    const live = Deno.env.get("RESEND_LIVE") === "1";
    const allowReal = live && !!apiKey;
    const isTestAddr = /@(example\.com|example\.org|borderday\.test)$/i.test(inv.email);

    if (!allowReal || !isTestAddr) {
      console.log("[bd-send-invite] DRY RUN", { to: inv.email, joinUrl });
      return new Response(JSON.stringify({ sent: false, dryRun: true, joinUrl }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [inv.email],
        subject: `You're invited to ${inv.bd_companies?.name || "BorderDay"}`,
        html: `<p>You have been invited to join <strong>${inv.bd_companies?.name || "a company"}</strong> on BorderDay.</p><p><a href="${joinUrl}">Accept invitation</a></p>`,
      }),
    });
    const result = await r.json();
    return new Response(JSON.stringify({ sent: r.ok, dryRun: false, result, joinUrl }), {
      status: r.ok ? 200 : 502, headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ sent: false, error: e instanceof Error ? e.message : "error" }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
