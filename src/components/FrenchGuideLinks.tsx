import { Link } from 'react-router-dom';
import { GUIDES, guideById, type GuideId } from '../content/guides';
import { getDict } from '../i18n';
import { publicPath } from '../lib/publicPath';
import { useLang } from './Layout';

export default function FrenchGuideLinks({
  ids,
  except,
  heading = 'Guides en français',
}: {
  ids?: readonly GuideId[];
  except?: GuideId;
  heading?: string;
}) {
  const lang = useLang();
  if (lang !== 'fr') return null;
  const items = GUIDES.filter((guide) => {
    if (except && guide.id === except) return false;
    if (ids && !ids.includes(guide.id)) return false;
    return true;
  });
  if (!items.length) return null;
  return (
    <nav className="french-guides" aria-label={heading}>
      <h2>{heading}</h2>
      <ul>
        {items.map((guide) => (
          <li key={guide.id}>
            <Link className="guide-card" to={publicPath('fr', guide.path)}>
              {guide.h1}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** French guide link. On other languages, one labeled line points at the French URL only. */
export function FrenchGuideForResidents({ id, frHeading }: { id: GuideId; frHeading: string }) {
  const lang = useLang();
  if (lang === 'fr') return <FrenchGuideLinks ids={[id]} heading={frHeading} />;
  const d = getDict(lang);
  const guide = guideById(id);
  return (
    <p>
      {d.employersHub.frenchGuideNote}{' '}
      <Link to={publicPath('fr', guide.path)}>{d.employersHub.frenchGuideLink}</Link>
    </p>
  );
}
