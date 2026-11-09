import { Link } from 'react-router-dom';
import PublicSeo from '../components/PublicSeo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';
import { publicPath } from '../lib/publicPath';

export default function Terms() {
  const lang = useLang();
  const d = getDict(lang);
  const t = d.terms;

  return (
    <>
      <PublicSeo path="terms" />
      <section className="section">
        <div className="container prose">
          <h1>{t.title}</h1>
          <p>{t.updated}</p>
          <h2 id="legal-notice">{t.providerTitle}</h2>
          <p>{t.providerBody}</p>
          <p>{t.legalNoticeNote}</p>
          <h2>{t.s1Title}</h2>
          <p id="summary">{t.s1Body}</p>
          <h2>{t.s2Title}</h2>
          <p>{t.s2Body}</p>
          <p>
            <Link to={publicPath(lang, 'dpa')}>{d.nav.dpa}</Link>
          </p>
          <h2>{t.s3Title}</h2>
          <p>{t.s3Body}</p>
          <p>{t.s3YearlyBody}</p>
          <h2>{t.s4Title}</h2>
          <p>{t.s4Body}</p>
          <h2 id="withdrawal">{t.s5Title}</h2>
          <p>{t.s5Body}</p>
          <p>
            <Link to={publicPath(lang, 'withdrawal')}>{d.nav.withdraw}</Link>
          </p>
          <p>{t.s5EffectsBody}</p>
          <p>{t.s5BusinessBody}</p>
          <h3>{t.s5FormTitle}</h3>
          <p className="pre-line">{t.s5Form}</p>
          <h2>{t.s6Title}</h2>
          <p>{t.s6Body}</p>
          <h2>{t.s7Title}</h2>
          <p>{t.s7Body}</p>
          <h2>{t.s8Title}</h2>
          <p>{t.s8Body}</p>
          <h2>{t.s9Title}</h2>
          <p>{t.s9Body}</p>
          <h2>{t.s10Title}</h2>
          <p>{t.s10Body}</p>
          <p>{t.contact}</p>
        </div>
      </section>
    </>
  );
}
