import PublicSeo from '../components/PublicSeo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';

export default function Accessibility() {
  const lang = useLang();
  const d = getDict(lang);
  const a = d.accessibility;

  return (
    <>
      <PublicSeo path="accessibility" />
      <section className="section">
        <div className="container prose">
          <h1>{a.title}</h1>
          <p className="meta">{a.updated}</p>
          <p id="summary">{a.intro}</p>
          <h2>{a.scopeTitle}</h2>
          <p>{a.scopeBody}</p>
          <h2>{a.statusTitle}</h2>
          <p>{a.statusBody}</p>
          <h2>{a.feedbackTitle}</h2>
          <p>{a.feedbackBody}</p>
        </div>
      </section>
    </>
  );
}
