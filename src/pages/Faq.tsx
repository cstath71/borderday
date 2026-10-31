import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';

export default function Faq() {
  const lang = useLang();
  const d = getDict(lang);
  const items = [
    [d.faq.q1, d.faq.a1],
    [d.faq.q2, d.faq.a2],
    [d.faq.q3, d.faq.a3],
    [d.faq.q4, d.faq.a4],
    [d.faq.q5, d.faq.a5],
    [d.faq.q6, d.faq.a6],
    [d.faq.q7, d.faq.a7],
  ] as const;

  return (
    <>
      <Seo lang={lang} title={`${d.faq.title} — BorderDay`} description={d.meta.description} path="faq" />
      <section className="section">
        <div className="container prose">
          <h1>{d.faq.title}</h1>
          {items.map(([q, a]) => (
            <div key={q}>
              <h2>{q}</h2>
              <p>{a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
