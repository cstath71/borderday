import { Link } from 'react-router-dom';
import type { Dict, Lang } from '../i18n';

/** Terms, Privacy and withdrawal, one click away wherever someone is about to commit. */
export default function LegalLinks({ d, lang, intro }: { d: Dict; lang: Lang; intro: string }) {
  return (
    <p className="meta">
      {intro} <Link to={`/${lang}/terms`}>{d.nav.terms}</Link>
      {' · '}
      <Link to={`/${lang}/privacy`}>{d.nav.privacy}</Link>
      {' · '}
      <Link to={`/${lang}/dpa`}>{d.nav.dpa}</Link>
      {' · '}
      <Link to={`/${lang}/withdrawal`}>{d.nav.withdraw}</Link>
    </p>
  );
}
