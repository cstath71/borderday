import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anon);

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url!, anon!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null;

export function siteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL as string | undefined;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'https://borderday.com';
}

/**
 * Where Supabase sends the person back after email/OAuth. Locale and next ride in the URL so the
 * destination is correct, but PKCE still requires the same browser that started sign-in (see Callback).
 * Needs `<site>/**` in the Supabase redirect allow list (docs/GOOGLE_OAUTH.md).
 */
export function authCallbackUrl(lang?: string, next?: string | null): string {
  const query = next ? `?next=${encodeURIComponent(next)}` : '';
  return `${siteOrigin()}${lang ? `/${lang}` : ''}/auth/callback${query}`;
}
