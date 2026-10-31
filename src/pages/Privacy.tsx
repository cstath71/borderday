import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';

export default function Privacy() {
  const lang = useLang();
  const d = getDict(lang);

  return (
    <>
      <Seo lang={lang} title={`${d.privacy.title} — BorderDay`} description={d.privacy.s1Body} path="privacy" />
      <section className="section">
        <div className="container prose">
          <h1>{d.privacy.title}</h1>
          <p>{d.privacy.updated}</p>
          <h2>{d.privacy.controllerTitle}</h2>
          <p>{d.privacy.controllerBody}</p>
          <h2>{d.privacy.s1Title}</h2>
          <p>{d.privacy.s1Body}</p>
          <h2>{d.privacy.s2Title}</h2>
          <p>{d.privacy.s2Body}</p>
          <h2>{d.privacy.s3Title}</h2>
          <p>{d.privacy.s3Body}</p>
          <h2>{d.privacy.s4Title}</h2>
          <p>{d.privacy.s4Body}</p>
          <h2>{d.privacy.s5Title}</h2>
          <p>{d.privacy.s5Body}</p>
          <h2>{d.privacy.s6Title}</h2>
          <p>{d.privacy.s6Body}</p>
          <h2>{d.privacy.s7Title}</h2>
          <p>{d.privacy.s7Body}</p>
          <p>{d.privacy.contact}</p>
        </div>
      </section>
    </>
  );
}
