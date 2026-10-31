import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { getDict, isLang, LANGS, type Lang } from '../i18n';

export function useLang(): Lang {
  const { lang } = useParams();
  return isLang(lang) ? lang : 'en';
}

export default function Layout() {
  const lang = useLang();
  const d = getDict(lang);
  const year = new Date().getFullYear();

  return (
    <>
      <header className="site-header">
        <div className="container inner">
          <Link to={`/${lang}/`} className="brand" aria-label="BorderDay home">
            <img src="/logo-header.png" alt="BorderDay" width={160} height={47} />
          </Link>
          <nav className="nav" aria-label="Main">
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
            <NavLink to={`/${lang}/auth/sign-in`} className="hide-sm">
              {d.nav.joinWaitlist}
            </NavLink>
            <NavLink to={`/${lang}/faq`} className="hide-sm">
              {d.nav.faq}
            </NavLink>
            <label className="lang-switch">
              <span className="visually-hidden" style={{ position: 'absolute', left: -9999 }}>
                {d.lang.label}
              </span>
              <select
                aria-label={d.lang.label}
                value={lang}
                onChange={(e) => {
                  const next = e.target.value as Lang;
                  const path = window.location.pathname.replace(/^\/(en|fr|de|it)/, `/${next}`);
                  window.location.assign(path || `/${next}/`);
                }}
              >
                {LANGS.map((l) => (
                  <option key={l} value={l}>
                    {d.lang[l]}
                  </option>
                ))}
              </select>
            </label>
          </nav>
        </div>
      </header>
      <main>
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
            <Link to={`/${lang}/terms`}>{d.nav.terms}</Link>
            {' · '}
            <Link to={`/${lang}/withdrawal`}>{d.nav.withdraw}</Link>
            {' · '}
            <Link to={`/${lang}/disclaimer`}>{d.nav.disclaimer}</Link>
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
