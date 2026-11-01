import { Link } from 'react-router-dom';
import { useLang } from '../../components/Layout';
import { getDict } from '../../i18n';

const ORDER = ['ticino', 'geneva', 'luxembourg'] as const;

type Id = (typeof ORDER)[number];

export default function EmployerRelatedLinks({ current }: { current: Id }) {
  const lang = useLang();
  const d = getDict(lang);
  const labels: Record<Id, string> = {
    ticino: d.employersHub.linkTicino,
    geneva: d.employersHub.linkGeneva,
    luxembourg: d.employersHub.linkLuxembourg,
  };
  return (
    <div className="related-employers" style={{ marginTop: '1.5rem' }}>
      <h2>{d.employersHub.title}</h2>
      <ul>
        {ORDER.filter((id) => id !== current).map((id) => (
          <li key={id}>
            <Link to={`/${lang}/employers/${id}`}>{labels[id]}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
