import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import {
  authEmailLang,
  buildAuthEmail,
  confirmationUrl,
} from "../_shared/authEmail.ts";
import { logFailure } from "../_shared/http.ts";

/**
 * Supabase Auth Send Email Hook (F23).
 * Locale from user_metadata.lang (set at signup) or redirect_to path (/fr/, …).
 * Requires SEND_EMAIL_HOOK_SECRET (v1,whsec_…) and Resend key; verify_jwt must be false.
 */
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("not allowed", { status: 400 });
  }

  const secretRaw = Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "";
  const hookSecret = secretRaw.replace(/^v1,whsec_/, "");
  if (!hookSecret) {
    logFailure("bd-auth-send-email", new Error("SEND_EMAIL_HOOK_SECRET missing"));
    return new Response(JSON.stringify({ error: { message: "hook secret not configured" } }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  let user: {
    email?: string;
    new_email?: string;
    user_metadata?: Record<string, unknown>;
  };
  let email_data: {
    token?: string;
    token_hash?: string;
    token_new?: string;
    token_hash_new?: string;
    redirect_to?: string;
    email_action_type?: string;
    site_url?: string;
  };
  try {
    const wh = new Webhook(hookSecret);
    const verified = wh.verify(payload, headers) as {
      user: typeof user;
      email_data: typeof email_data;
    };
    user = verified.user;
    email_data = verified.email_data;
  } catch (e) {
    logFailure("bd-auth-send-email", e);
    return new Response(JSON.stringify({ error: { http_code: 401, message: "invalid signature" } }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const to = user.email;
  if (!to) {
    return new Response(JSON.stringify({ error: { message: "missing recipient" } }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const action = email_data.email_action_type || "signup";
  const lang = authEmailLang(user.user_metadata, email_data.redirect_to);
  const projectUrl = Deno.env.get("SUPABASE_URL") || email_data.site_url || "";
  const siteUrl = Deno.env.get("BD_SITE_URL") || "https://borderday.com";

  const apiKey = Deno.env.get("RESEND_API_KEY_BORDERDAY") || Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM") || "BorderDay <hello@borderday.com>";
  if (!apiKey) {
    logFailure("bd-auth-send-email", new Error("RESEND_API_KEY missing"));
    return new Response(JSON.stringify({ error: { message: "mailer not configured" } }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sends: Array<{ to: string; tokenHash: string; token?: string; newEmail?: string }> = [];

  if (action === "email_change" && email_data.token_hash_new && email_data.token_hash) {
    // Secure email change: current address uses token + token_hash_new; new address uses token_new + token_hash.
    sends.push({
      to,
      tokenHash: email_data.token_hash_new,
      token: email_data.token,
      newEmail: user.new_email,
    });
    if (user.new_email) {
      sends.push({
        to: user.new_email,
        tokenHash: email_data.token_hash,
        token: email_data.token_new,
        newEmail: user.new_email,
      });
    }
  } else {
    sends.push({
      to,
      tokenHash: email_data.token_hash || "",
      token: email_data.token,
      newEmail: user.new_email,
    });
  }

  try {
    for (const s of sends) {
      const confirm = s.tokenHash
        ? confirmationUrl({
          projectUrl,
          tokenHash: s.tokenHash,
          type: action,
          redirectTo: email_data.redirect_to || siteUrl,
        })
        : undefined;
      const mail = buildAuthEmail({
        lang,
        action,
        confirmationUrl: confirm,
        token: s.token,
        newEmail: s.newEmail,
      });
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [s.to],
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
        }),
      });
      if (!r.ok) {
        const detail = await r.text();
        throw new Error(`Resend ${r.status}: ${detail.slice(0, 200)}`);
      }
      await r.body?.cancel();
    }
  } catch (e) {
    logFailure("bd-auth-send-email", e);
    return new Response(
      JSON.stringify({ error: { message: e instanceof Error ? e.message : "send failed" } }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
