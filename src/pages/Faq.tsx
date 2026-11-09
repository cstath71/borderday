import FrenchGuideLinks from '../components/FrenchGuideLinks';
import PublicSeo from '../components/PublicSeo';
import RoutesCovered from '../components/RoutesCovered';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';
import { faqPagePairs } from '../seo/visibleFaq';

export default function Faq() {
  const lang = useLang();
  const d = getDict(lang);
  const items = faqPagePairs(lang);

  return (
    <>
      <PublicSeo path="faq" faq={items} />
      <section className="section">
        <div className="container prose">
          <h1>{d.faq.title}</h1>
          <p id="summary" className="lead"><strong>{d.home.inShortLabel}:</strong> {d.home.inShort}</p>
          <div className="faq" id="faq">
          {items.map(([q, a]) => (
            <div key={q}>
              <h3>{q}</h3>
              <p>{a}</p>
            </div>
          ))}
          </div>
          <FrenchGuideLinks />
        </div>
      </section>
      <RoutesCovered />
    </>
  );
}
