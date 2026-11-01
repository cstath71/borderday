import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { handleContractRequest } from "../_shared/contractRequest.ts";
import { corsHeaders } from "../_shared/http.ts";

/**
 * Stores a withdrawal or cancellation request and returns its time of receipt (A3-08). Public on
 * purpose: both forms work signed out. Logs carry no name, address or order reference.
 */
Deno.serve(async (req) => {
  const cors = corsHeaders(req.headers.get("Origin"), Deno.env.get("BD_SITE_URL"));
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { recorded: false, code: "invalid" });
  try {
    const body = await req.json().catch(() => null);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Optional: a signed-in caller's account goes on the record. Anonymous callers carry the anon key.
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      userId = data.user?.id ?? null;
    }

    const from = Deno.env.get("RESEND_FROM") || "BorderDay <hello@borderday.com>";
    const apiKey = Deno.env.get("RESEND_API_KEY_BORDERDAY") || Deno.env.get("RESEND_API_KEY");
    // Same switch as the other functions: set RESEND_LIVE=0 to pause. No key or paused: nothing is sent.
    const live = (Deno.env.get("RESEND_LIVE") ?? "1") === "1";

    const result = await handleContractRequest(body, {
      now: () => new Date(),
      countRequests: async ({ sinceIso, email, receiptsOnly }) => {
        let query = admin.from("bd_contract_requests").select("id", { count: "exact", head: true });
        query = receiptsOnly ? query.gte("receipt_sent_at", sinceIso) : query.gte("received_at", sinceIso);
        if (email) query = query.eq("email", email);
        const { count, error } = await query;
        return error ? null : count ?? 0;
      },
      insert: async (fields, receivedAt) => {
        const { data, error } = await admin.from("bd_contract_requests").insert({
          kind: fields.kind,
          name: fields.name,
          email: fields.email,
          order_reference: fields.orderReference,
          order_date: fields.orderDate,
          lang: fields.lang,
          user_id: userId,
          received_at: receivedAt,
        }).select("id, received_at").single();
        return error || !data ? null : { id: data.id, receivedAt: data.received_at };
      },
      mark: async (id, column, at) => {
        await admin.from("bd_contract_requests").update({ [column]: at }).eq("id", id);
      },
      sendEmail: live && apiKey
        ? async ({ to, replyTo, subject, text }) => {
          const r = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from, to: [to], ...(replyTo ? { reply_to: replyTo } : {}), subject, text }),
          });
          return r.ok;
        }
        : null,
    });
    console.log("[bd-contract-request]", { status: result.status, receipt: result.body.recorded ? result.body.receipt : null });
    return json(result.status, result.body);
  } catch {
    console.log("[bd-contract-request]", { status: 503, receipt: null });
    return json(503, { recorded: false, code: "unavailable" });
  }
});
