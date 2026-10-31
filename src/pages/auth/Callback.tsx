import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDict, isLang } from '../../i18n';
import { safeNext, takeRememberedNext } from '../../lib/authNext';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const { lang: langParam } = useParams();
  const lang = isLang(langParam) ? langParam : 'en';
  const d = getDict(lang);
  const nav = useNavigate();
  const [msg, setMsg] = useState(d.auth.completing);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supabase) {
        setMsg(d.auth.notConfigured);
        return;
      }
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error && !cancelled) setMsg(d.auth.callbackFailed);
      }
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) nav(safeNext(takeRememberedNext(), `/${lang}/company/signup`), { replace: true });
      else setMsg(d.auth.callbackFailed);
    })();
    return () => { cancelled = true; };
  }, [lang, nav, d]);

  return (
    <section className="section">
      <div className="container"><p role="status">{msg}</p></div>
    </section>
  );
}
