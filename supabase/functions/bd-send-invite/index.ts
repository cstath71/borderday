import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  companyCanEmailInvites,
  escapeIlike,
  INVITE_COOLDOWN_MS,
  inviteSendBlock,
  isInviteTestAddress,
  isSendableInviteAddress,
  MAX_INVITE_EMAILS_PER_HOUR,
} from "../_shared/invite.ts";
import { buildInviteEmail, inviteLang, joinUrlFor } from "../_shared/inviteEmail.ts";

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
    const { data: inv } = await admin.from("bd_invitations").select("*, bd_companies(name, subscription_status, trial_ends_at)")
      .eq("id", body.invitationId).eq("company_id", body.companyId).eq("status", "pending").single();
    if (!inv) throw new Error("Invite not found");
    // A3-03: invite email goes out from our domain, so it needs a paying or trialing company.
    if (!companyCanEmailInvites(inv.bd_companies?.subscription_status, inv.bd_companies?.trial_ends_at)) {
      return new Response(JSON.stringify({ sent: false, code: "no_access", error: "Emailing invites requires an active plan or trial" }), {
        status: 402, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
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

    // Counts real sends, not invitation rows, so re-sending one invite cannot dodge the caps.
    // MAX_INVITE_EMAILS_PER_HOUR applies per company and per inviting user.
    const since = new Date(Date.now() - INVITE_COOLDOWN_MS).toISOString();
    const sentInLastHour = () =>
      admin.from("bd_invitations").select("id", { count: "exact", head: true }).gte("email_sent_at", since);
    const [company, inviter, recipient] = await Promise.all([
      sentInLastHour().eq("company_id", body.companyId),
      sentInLastHour().eq("invited_by", user.id),
      sentInLastHour().eq("company_id", body.companyId).ilike("email", escapeIlike(inv.email)),
    ]);
    // Fail closed: a missing count must not read as zero sends.
    if (company.error || inviter.error || recipient.error) throw new Error("Could not check invite limits");
    let block = inviteSendBlock({ company: company.count ?? 0, user: inviter.count ?? 0, recipient: recipient.count ?? 0 });

    // Claim before sending, so parallel calls for one invite cannot both go out.
    if (!block) {
      const { data: claimed, error: claimError } = await admin.from("bd_invitations")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", inv.id).or(`email_sent_at.is.null,email_sent_at.lt."${since}"`)
        .select("id").maybeSingle();
      if (claimError) throw new Error("Could not check invite limits");
      if (!claimed) block = "cooldown";
    }
    if (block) {
      console.log("[bd-send-invite]", { invitationId: inv.id, dryRun: false, ok: false });
      return new Response(JSON.stringify({ sent: false, code: block, error: "Rate limited" }), {
        status: 429, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const email = buildInviteEmail({ lang, companyName: inv.bd_companies?.name, joinUrl, siteUrl });
    let accepted = false;
    try {
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
      accepted = r.ok;
      const result = await r.json();
      console.log("[bd-send-invite]", { invitationId: inv.id, dryRun: false, ok: r.ok });
      return new Response(JSON.stringify({ sent: r.ok, dryRun: false, result, joinUrl }), {
        status: r.ok ? 200 : 502, headers: { ...cors, "Content-Type": "application/json" },
      });
    } finally {
      // Resend took nothing, so give the slot back and let HR retry.
      if (!accepted) await admin.from("bd_invitations").update({ email_sent_at: inv.email_sent_at ?? null }).eq("id", inv.id);
    }
  } catch (e) {
    return new Response(JSON.stringify({ sent: false, error: e instanceof Error ? e.message : "error" }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
