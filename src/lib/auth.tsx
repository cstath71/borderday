import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { authCallbackUrl, supabase, supabaseConfigured } from './supabase';

type AuthCtx = {
  ready: boolean;
  configured: boolean;
  session: Session | null;
  user: User | null;
  signUpEmail: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signInEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signInMagicLink: (email: string) => Promise<{ error: string | null }>;
  signInGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!supabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);

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

  const signUpEmail = useCallback(async (email: string, password: string, displayName?: string) => {
    if (!supabase) return { error: 'Auth not configured' };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: authCallbackUrl(),
        data: displayName ? { display_name: displayName } : undefined,
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Auth not configured' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signInMagicLink = useCallback(async (email: string) => {
    if (!supabase) return { error: 'Auth not configured' };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: authCallbackUrl() },
    });
    return { error: error?.message ?? null };
  }, []);

  const signInGoogle = useCallback(async () => {
    if (!supabase) return { error: 'Auth not configured' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: authCallbackUrl() },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      ready,
      configured: supabaseConfigured,
      session,
      user: session?.user ?? null,
      signUpEmail,
      signInEmail,
      signInMagicLink,
      signInGoogle,
      signOut,
    }),
    [ready, session, signUpEmail, signInEmail, signInMagicLink, signInGoogle, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}
