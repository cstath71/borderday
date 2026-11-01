import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import type { Session, User } from '@supabase/supabase-js';
import { authCallbackUrl, supabase, supabaseConfigured } from './supabase';

/** Page language and destination to come back to after an email link or Google. */
export type AuthReturn = { lang: string; next: string };

type AuthCtx = {
  ready: boolean;
  configured: boolean;
  session: Session | null;
  user: User | null;
  /** True while signOutAndGo is in flight — auth guards must not bounce to sign-in. */
  signingOut: boolean;
  signUpEmail: (email: string, password: string, displayName?: string, back?: AuthReturn) => Promise<{ error: string | null }>;
  signInEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signInMagicLink: (email: string, back?: AuthReturn) => Promise<{ error: string | null }>;
  signInGoogle: (back?: AuthReturn) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /** Clear session then land on /<lang>/ without a flash through sign-in guards. */
  signOutAndGo: (lang: string) => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!supabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const signingOutRef = useRef(false);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUpEmail = useCallback(async (email: string, password: string, displayName?: string, back?: AuthReturn) => {
    if (!supabase) return { error: 'Auth not configured' };
    const name = displayName?.trim();
    const lang = back?.lang && ['en', 'fr', 'de', 'it', 'nl'].includes(back.lang) ? back.lang : 'en';
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: authCallbackUrl(back?.lang, back?.next),
        // F23: locale for confirmation / auth emails (hook or templates read user_metadata.lang).
        data: { ...(name ? { display_name: name } : {}), lang },
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Auth not configured' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signInMagicLink = useCallback(async (email: string, back?: AuthReturn) => {
    if (!supabase) return { error: 'Auth not configured' };
    const lang = back?.lang && ['en', 'fr', 'de', 'it', 'nl'].includes(back.lang) ? back.lang : 'en';
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: authCallbackUrl(back?.lang, back?.next),
        // F23: locale for magic-link auth emails (hook / templates read user_metadata.lang).
        data: { lang },
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signInGoogle = useCallback(async (back?: AuthReturn) => {
    if (!supabase) return { error: 'Auth not configured' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: authCallbackUrl(back?.lang, back?.next) },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const signOutAndGo = useCallback(async (lang: string) => {
    const dest = `/${lang}/`;
    // F33: flush so signingOut is true before onAuthStateChange / guards re-render.
    signingOutRef.current = true;
    flushSync(() => setSigningOut(true));
    try {
      if (supabase) await supabase.auth.signOut();
    } finally {
      window.location.replace(dest);
    }
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      ready,
      configured: supabaseConfigured,
      session,
      user: session?.user ?? null,
      signingOut,
      signUpEmail,
      signInEmail,
      signInMagicLink,
      signInGoogle,
      signOut,
      signOutAndGo,
    }),
    [ready, session, signingOut, signUpEmail, signInEmail, signInMagicLink, signInGoogle, signOut, signOutAndGo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}
