const SITE_ORIGINS = ["https://borderday.com", "https://www.borderday.com"];
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * Browser access is limited to the site and local development. These calls use bearer tokens, not
 * cookies, so this narrows the surface rather than authorises anything: every function still
 * checks the caller. Requests without an Origin (server to server) get the site origin.
 */
export function corsHeaders(origin: string | null, siteUrl?: string): Record<string, string> {
  const allowed = [...SITE_ORIGINS, ...(siteUrl ? [siteUrl.replace(/\/$/, "")] : [])];
  const match = origin && (allowed.includes(origin) || LOCAL_ORIGIN.test(origin));
  return {
    "Access-Control-Allow-Origin": match ? origin : SITE_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

/** What a client sees when a call fails. The detail stays in the function logs. */
export const GENERIC_ERROR = "Could not complete this request";

/** Log the kind of failure only: error messages from Stripe and others can quote addresses. */
export function logFailure(fn: string, e: unknown): void {
  const err = e as { name?: string; code?: string; type?: string; statusCode?: number } | null;
  console.error(`[${fn}]`, { name: err?.name ?? "error", code: err?.code, type: err?.type, status: err?.statusCode });
}
