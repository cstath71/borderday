import PublicSeo from '../components/PublicSeo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';

export default function Disclaimer() {
  const lang = useLang();
  const d = getDict(lang);

  return (
    <>
      <PublicSeo path="disclaimer" />
      <section className="section">
        <div className="container prose">
          <h1>{d.disclaimer.title}</h1>
          <p id="summary">{d.disclaimer.body}</p>
          <h2>{d.faq.q8}</h2>
          <p>{d.faq.a8}</p>
        </div>
      </section>
    </>
  );
}
