import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import { getDict, isLang, LANGS, type Lang } from '../i18n';
import { useAuth } from '../lib/auth';

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

  return (
    <>
      <a className="skip-link" href="#main">
        {d.nav.skipToContent}
      </a>
      <header className="site-header">
        <div className="container inner">
          <Link to={`/${lang}/`} className="brand" aria-label={d.nav.homeLabel}>
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
            <NavLink to={`/${lang}/`} end>
              {d.nav.home}
            </NavLink>
            <NavLink to={`/${lang}/company/signup`} className="hide-sm">
              {d.nav.forCompanies}
            </NavLink>
            <NavLink to={`/${lang}/for-individuals`} className="hide-sm">
              {d.nav.forIndividuals}
            </NavLink>
            <NavLink to={`/${lang}/app`}>{d.nav.app}</NavLink>
            <NavLink to={`/${lang}/pricing`} className="hide-sm">
              {d.nav.pricing}
            </NavLink>
            {!auth.user && (
              <NavLink to={`/${lang}/auth/sign-in`} className="hide-sm">
                {d.nav.joinWaitlist}
              </NavLink>
            )}
            <NavLink to={`/${lang}/faq`} className="hide-sm">
              {d.nav.faq}
            </NavLink>
            {auth.user && (
              <NavLink to={`/${lang}/account`} className="hide-sm">
                {d.nav.account}
              </NavLink>
            )}
          </nav>
          <form
            className="lang-switch"
            onSubmit={(e) => {
              e.preventDefault();
              const next = new FormData(e.currentTarget).get('lang') as Lang;
              if (!isLang(next) || next === lang) return;
              const path = window.location.pathname.replace(/^\/(en|fr|de|it|nl)(?=\/|$)/, `/${next}`);
              window.location.assign(path.startsWith(`/${next}`) ? path : `/${next}/`);
            }}
          >
            <label>
              <span className="visually-hidden" style={{ position: 'absolute', left: -9999 }}>
                {d.lang.label}
              </span>
              <select
                name="lang"
                aria-label={d.lang.label}
                defaultValue={lang}
              >
                {LANGS.map((l) => (
                  <option key={l} value={l}>
                    {l.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            {/* WCAG 3.2.2: changing the control alone must not navigate. */}
            <button type="submit" className="lang-apply" aria-label={`${d.lang.apply}: ${d.lang.label}`}>
              {d.lang.apply}
            </button>
          </form>
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
            <Link to={`/${lang}/privacy`}>{d.nav.privacy}</Link>
            {' · '}
            <Link to={`/${lang}/dpa`}>{d.nav.dpa}</Link>
            {' · '}
            <Link to={`/${lang}/terms`}>{d.nav.terms}</Link>
            {' · '}
            <Link to={`/${lang}/withdrawal`}>{d.nav.withdraw}</Link>
            {' · '}
            <Link to={`/${lang}/cancel`}>{d.nav.cancel}</Link>
            {' · '}
            <Link to={`/${lang}/account`}>{d.nav.account}</Link>
            {' · '}
            <Link to={`/${lang}/disclaimer`}>{d.nav.disclaimer}</Link>
            <span aria-hidden="true">·</span>
            <Link to={`/${lang}/accessibility`}>{d.nav.accessibility}</Link>
            {' · '}
            <Link to={`/${lang}/pricing`}>{d.nav.pricing}</Link>
            {' · '}
            <Link to={`/${lang}/for-individuals`}>{d.nav.forIndividuals}</Link>
            <p>{d.footer.rights.replace('{year}', String(year))}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
