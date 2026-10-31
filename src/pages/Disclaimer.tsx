import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';

export default function Disclaimer() {
  const lang = useLang();
  const d = getDict(lang);

  return (
    <>
      <Seo lang={lang} title={`${d.disclaimer.title} — BorderDay`} description={d.disclaimer.body} path="disclaimer" />
      <section className="section">
        <div className="container prose">
          <h1>{d.disclaimer.title}</h1>
          <p>{d.disclaimer.body}</p>
          <h2>{d.faq.q8}</h2>
          <p>{d.faq.a8}</p>
        </div>
      </section>
    </>
  );
}
