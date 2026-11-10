import { Link } from 'react-router-dom';
import { GUIDES, guideById, type GuideId } from '../content/guides';
import { getDict } from '../i18n';
import { publicPath } from '../lib/publicPath';
import { useLang } from './Layout';

export default function FrenchGuideLinks({
  ids,
  except,
  heading,
}: {
  ids?: readonly GuideId[];
  except?: GuideId;
  heading?: string;
}) {
  const lang = useLang();
  const defaults: Record<string, string> = {
    en: 'Guides in English',
    fr: 'Guides en français',
    de: 'Leitfäden auf Deutsch',
    it: 'Guide in italiano',
  };
  const label = heading ?? defaults[lang] ?? 'Guides';
  const items = GUIDES.filter((guide) => {
    if (guide.lang !== lang) return false;
    if (except && guide.id === except) return false;
    if (ids && !ids.includes(guide.id)) return false;
    return true;
  });
  if (!items.length) return null;
  return (
    <nav className="french-guides" aria-label={label}>
      <h2>{label}</h2>
      <ul>
        {items.map((guide) => (
          <li key={guide.id}>
            <Link className="guide-card" to={publicPath(guide.lang, guide.path)}>
              {guide.h1}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Guide written in one language. On other languages, one labeled line points at that URL only. */
export function ResidentGuideLink({ id, heading }: { id: GuideId; heading: string }) {
  const lang = useLang();
  const guide = guideById(id);
  if (lang === guide.lang) return <FrenchGuideLinks ids={[id]} heading={heading} />;
  const d = getDict(lang);
  const note = guide.lang === 'it' ? d.employersHub.italianGuideNote : d.employersHub.frenchGuideNote;
  const link = guide.lang === 'it' ? d.employersHub.italianGuideLink : d.employersHub.frenchGuideLink;
  return (
    <p>
      {note}{' '}
      <Link to={publicPath(guide.lang, guide.path)}>{link}</Link>
    </p>
  );
}

/** French guide link. On other languages, one labeled line points at the French URL only. */
export function FrenchGuideForResidents({ id, frHeading }: { id: GuideId; frHeading: string }) {
  return <ResidentGuideLink id={id} heading={frHeading} />;
}
