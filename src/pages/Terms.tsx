import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';

export default function Terms() {
  const lang = useLang();
  const d = getDict(lang);
  const t = d.terms;

  return (
    <>
      <Seo lang={lang} title={`${t.title} — BorderDay`} description={t.s1Body} path="terms" />
      <section className="section">
        <div className="container prose">
          <h1>{t.title}</h1>
          <p>{t.updated}</p>
          <h2>{t.s1Title}</h2>
          <p>{t.s1Body}</p>
          <h2>{t.s2Title}</h2>
          <p>{t.s2Body}</p>
          <h2>{t.s3Title}</h2>
          <p>{t.s3Body}</p>
          <h2>{t.s4Title}</h2>
          <p>{t.s4Body}</p>
          <h2>{t.s5Title}</h2>
          <p>{t.s5Body}</p>
          <h2>{t.s6Title}</h2>
          <p>{t.s6Body}</p>
          <h2>{t.s7Title}</h2>
          <p>{t.s7Body}</p>
          <p>{t.contact}</p>
        </div>
      </section>
    </>
  );
}
