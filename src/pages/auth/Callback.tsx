import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDict, isLang } from '../../i18n';
import { callbackDestination, forgetRememberedNext, peekRememberedNext } from '../../lib/authNext';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const { lang: langParam } = useParams();
  const lang = isLang(langParam) ? langParam : 'en';
  const d = getDict(lang);
  const nav = useNavigate();
  const [msg, setMsg] = useState(d.auth.completing);
  const [showPkceFallback, setShowPkceFallback] = useState(false);

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
        if (error && !cancelled) {
          // PKCE verifier lives on the device that started sign-in; another device cannot finish the exchange.
          setMsg(d.auth.callbackPkceHint);
          setShowPkceFallback(true);
        }
      }
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        const target = callbackDestination({
          urlNext: url.searchParams.get('next'),
          remembered: peekRememberedNext(),
          lang: isLang(langParam) ? langParam : null,
        });
        forgetRememberedNext();
        nav(target, { replace: true });
      } else if (!cancelled) {
        setMsg(d.auth.callbackPkceHint);
        setShowPkceFallback(true);
      }
    })();
    return () => { cancelled = true; };
  }, [lang, langParam, nav, d]);

  return (
    <section className="section">
      <div className="container">
        <p role="status">{msg}</p>
        {showPkceFallback && (
          <p>
            <Link to={`/${lang}/auth/sign-in`}>{d.auth.signInTitle}</Link>
            {' · '}
            <Link to={`/${lang}/auth/sign-up`}>{d.auth.signUpTitle}</Link>
          </p>
        )}
      </div>
    </section>
  );
}
