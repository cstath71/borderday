import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import { getDict, isLang, LANGS, type Lang } from '../i18n';
import { useAuth } from '../lib/auth';
import { untranslatedLocalePath } from '../lib/localeSwitch';
import { setPreferredLang } from '../lib/preferredLang';
import { publicPath } from '../lib/publicPath';

export function useLang(): Lang {
  const { lang } = useParams();
  return isLang(lang) ? lang : 'en';
}

export default function Layout() {
  const lang = useLang();
  const d = getDict(lang);
  const year = new Date().getFullYear();
  const auth = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    setPreferredLang(lang);
  }, [lang]);

  return (
    <>
      <a className="skip-link" href="#main">
        {d.nav.skipToContent}
      </a>
      <header className="site-header">
        <div className="container inner">
          <Link to={publicPath(lang)} className="brand" aria-label={d.nav.homeLabel}>
            <img src="/logo-header.png" alt="BorderDay" width={232} height={68} />
          </Link>
          <button
            type="button"
            className="btn btn-ghost nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {d.nav.menu}
          </button>
          <nav id="main-nav" className={`nav ${menuOpen ? 'open' : ''}`} aria-label={d.nav.mainLabel}>
            <NavLink to={publicPath(lang)} end>
              {d.nav.home}
            </NavLink>
            <NavLink to={publicPath(lang, 'company/signup')} className="hide-sm">
              {d.nav.forCompanies}
            </NavLink>
            <NavLink to={publicPath(lang, 'for-individuals')} className="hide-sm">
              {d.nav.forIndividuals}
            </NavLink>
            <NavLink to={`/${lang}/app`}>{d.nav.app}</NavLink>
            <NavLink to={publicPath(lang, 'pricing')} className="hide-sm">
              {d.nav.pricing}
            </NavLink>
            {(lang === 'en' || lang === 'fr' || lang === 'de' || lang === 'it') && (
              <NavLink to={publicPath(lang, 'guides')} className="hide-sm">
                {d.nav.guides}
              </NavLink>
            )}
            {!auth.user && (
              <NavLink to={`/${lang}/auth/sign-in`} className="hide-sm">
                {d.nav.joinWaitlist}
              </NavLink>
            )}
            <NavLink to={publicPath(lang, 'faq')} className="hide-sm">
              {d.nav.faq}
            </NavLink>
            {auth.user && (
              <NavLink to={`/${lang}/account`} className="hide-sm">
                {d.nav.account}
              </NavLink>
            )}
            {auth.user && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  void auth.signOutAndGo(lang);
                }}
              >
                {d.auth.signOut}
              </button>
            )}
          </nav>
          <label className="lang-switch">
            <span className="visually-hidden" style={{ position: 'absolute', left: -9999 }}>
              {d.lang.label}
            </span>
            <select
              aria-label={d.lang.label}
              value={lang}
              onChange={(e) => {
                const next = e.target.value as Lang;
                if (!isLang(next) || next === lang) return;
                setPreferredLang(next);
                // F28: keep selected calendar day across instant language remount.
                try {
                  const d = sessionStorage.getItem('bd_selected_date');
                  if (d) sessionStorage.setItem('bd_selected_date_keep', d);
                } catch { /* private mode */ }
                const path =
                  untranslatedLocalePath(window.location.pathname, next) ??
                  window.location.pathname.replace(/^\/(en|fr|de|it|nl)(?=\/|$)/, `/${next}`);
                const qs = window.location.search || '';
                window.location.assign((path.startsWith(`/${next}`) ? path : `/${next}/`) + qs);
              }}
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container inner">
          <div>
            <strong>BorderDay</strong>
            <p>{d.footer.tagline}</p>
          </div>
          <div>
            <Link to={publicPath(lang, 'employers/ticino')}>{d.employersHub.linkTicino}</Link>
            {' · '}
            <Link to={publicPath(lang, 'employers/geneva')}>{d.employersHub.linkGeneva}</Link>
            {' · '}
            <Link to={publicPath(lang, 'employers/luxembourg')}>{d.employersHub.linkLuxembourg}</Link>
            {(lang === 'en' || lang === 'fr' || lang === 'de' || lang === 'it') && (
              <>
                {' · '}
                <Link to={publicPath(lang, 'guides')}>{d.nav.guides}</Link>
              </>
            )}
            {' · '}
            <Link to={publicPath(lang, 'privacy')}>{d.nav.privacy}</Link>
            {' · '}
            <Link to={publicPath(lang, 'dpa')}>{d.nav.dpa}</Link>
            {' · '}
            <Link to={publicPath(lang, 'terms')}>{d.nav.terms}</Link>
            {' · '}
            <Link to={publicPath(lang, 'withdrawal')}>{d.nav.withdraw}</Link>
            {' · '}
            <Link to={publicPath(lang, 'cancel')}>{d.nav.cancel}</Link>
            {' · '}
            <Link to={`/${lang}/account`}>{d.nav.account}</Link>
            {' · '}
            <Link to={publicPath(lang, 'disclaimer')}>{d.nav.disclaimer}</Link>
            {' · '}
            <Link to={publicPath(lang, 'accessibility')}>{d.nav.accessibility}</Link>
            {' · '}
            <Link to={publicPath(lang, 'pricing')}>{d.nav.pricing}</Link>
            {' · '}
            <Link to={publicPath(lang, 'for-individuals')}>{d.nav.forIndividuals}</Link>
            <p>{d.footer.rights.replace('{year}', String(year))}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
