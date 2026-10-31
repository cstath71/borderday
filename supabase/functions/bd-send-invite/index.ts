import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { isInviteTestAddress, isSendableInviteAddress } from "../_shared/invite.ts";
import { buildInviteEmail, inviteLang, joinUrlFor } from "../_shared/inviteEmail.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Cap real Resend traffic per company and per inviting user (last 60 minutes). */
const MAX_INVITE_EMAILS_PER_HOUR = 30;

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
    const body = await req.json() as { invitationId: string; companyId: string; lang?: string };

    // Checked with the caller's JWT, before the service-role client can see the token.
    const { data: mem } = await supabase.from("bd_company_members").select("role")
      .eq("company_id", body.companyId).eq("user_id", user.id).eq("active", true).maybeSingle();
    if (!mem || !["owner", "hr_viewer"].includes(mem.role)) {
      return new Response(JSON.stringify({ sent: false, error: "Forbidden" }), {
        status: 403, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: inv } = await admin.from("bd_invitations").select("*, bd_companies(name)")
      .eq("id", body.invitationId).eq("company_id", body.companyId).eq("status", "pending").single();
    if (!inv) throw new Error("Invite not found");
    const siteUrl = Deno.env.get("BD_SITE_URL") || "https://borderday.com";
    const lang = inviteLang(body.lang);
    const joinUrl = joinUrlFor(siteUrl, lang, inv.token);
    const from = Deno.env.get("RESEND_FROM") || "BorderDay <hello@borderday.com>";
    const apiKey = Deno.env.get("RESEND_API_KEY_BORDERDAY") || Deno.env.get("RESEND_API_KEY");
    // Live email approved 2026-10-31 (Gus t415u). Default on; set RESEND_LIVE=0 to pause.
    // When live: any single-recipient address. When paused: test mailboxes only (if a key is set).
    const live = (Deno.env.get("RESEND_LIVE") ?? "1") === "1";
    const emailOk = live ? isSendableInviteAddress(inv.email) : isInviteTestAddress(inv.email);
    const allowReal = !!apiKey && emailOk && (live || isInviteTestAddress(inv.email));

    if (!allowReal) {
      console.log("[bd-send-invite]", { invitationId: inv.id, dryRun: true });
      return new Response(JSON.stringify({ sent: false, dryRun: true, joinUrl }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const [{ count: companyCount }, { count: userCount }] = await Promise.all([
      admin.from("bd_invitations").select("id", { count: "exact", head: true })
        .eq("company_id", body.companyId).gte("created_at", since),
      admin.from("bd_invitations").select("id", { count: "exact", head: true })
        .eq("invited_by", user.id).gte("created_at", since),
    ]);
    if ((companyCount ?? 0) > MAX_INVITE_EMAILS_PER_HOUR || (userCount ?? 0) > MAX_INVITE_EMAILS_PER_HOUR) {
      console.log("[bd-send-invite]", { invitationId: inv.id, dryRun: false, ok: false });
      return new Response(JSON.stringify({ sent: false, error: "Rate limited" }), {
        status: 429, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const email = buildInviteEmail({ lang, companyName: inv.bd_companies?.name, joinUrl, siteUrl });
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [inv.email],
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });
    const result = await r.json();
    console.log("[bd-send-invite]", { invitationId: inv.id, dryRun: false, ok: r.ok });
    return new Response(JSON.stringify({ sent: r.ok, dryRun: false, result, joinUrl }), {
      status: r.ok ? 200 : 502, headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ sent: false, error: e instanceof Error ? e.message : "error" }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
