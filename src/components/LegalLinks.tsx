import { Link } from 'react-router-dom';
import type { Dict, Lang } from '../i18n';
import { publicPath } from '../lib/publicPath';

/** Terms, Privacy and withdrawal, one click away wherever someone is about to commit. */
export default function LegalLinks({ d, lang, intro }: { d: Dict; lang: Lang; intro: string }) {
  return (
    <p className="meta">
      {intro} <Link to={publicPath(lang, 'terms')}>{d.nav.terms}</Link>
      {' · '}
      <Link to={publicPath(lang, 'privacy')}>{d.nav.privacy}</Link>
      {' · '}
      <Link to={publicPath(lang, 'dpa')}>{d.nav.dpa}</Link>
      {' · '}
      <Link to={publicPath(lang, 'withdrawal')}>{d.nav.withdraw}</Link>
    </p>
  );
}
