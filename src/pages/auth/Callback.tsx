import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isLang } from '../../i18n';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const { lang: langParam } = useParams();
  const lang = isLang(langParam) ? langParam : 'en';
  const nav = useNavigate();
  const [msg, setMsg] = useState('Completing sign-in…');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supabase) {
        setMsg('Auth backend is not configured in this build.');
        return;
      }
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error && !cancelled) setMsg(error.message);
      }
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) nav(`/${lang}/company/signup`, { replace: true });
      else setMsg('Could not complete sign-in. Try again.');
    })();
    return () => { cancelled = true; };
  }, [lang, nav]);

  return (
    <section className="section">
      <div className="container"><p>{msg}</p></div>
    </section>
  );
}
