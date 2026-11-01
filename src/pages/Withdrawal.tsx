import { Link } from 'react-router-dom';
import RequestForm from '../components/RequestForm';
import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict, t } from '../i18n';
import { useAuth } from '../lib/auth';

/**
 * A3-08: the labelled route to withdraw. It stores the request on the server, shows the time of
 * receipt and emails a receipt. A lawyer must confirm it meets § 356a BGB, and whether Link's order
 * page already discharges this; a live test order must show what Link offers.
 */
export default function Withdrawal() {
  const lang = useLang();
  const d = getDict(lang);
  const auth = useAuth();
  const w = d.withdrawal;

  return (
    <>
      <Seo lang={lang} title={`${w.title} — BorderDay`} description={w.intro} path="withdrawal" />
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <h1>{w.title}</h1>
          <p>{w.intro}</p>
          <RequestForm
            d={d}
            lang={lang}
            kind="withdrawal"
            to="privacy@borderday.com"
            subject={w.mailSubject}
            body={(v) =>
              t(w.mailBody, {
                name: v.name,
                email: v.email,
                reference: v.reference || '—',
                date: v.date || '—',
                today: new Date().toISOString().slice(0, 10),
              })
            }
            submitLabel={w.submit}
            confirmLabel={w.confirm}
            dateLabel={w.orderedOn}
            initialEmail={auth.user?.email ?? ''}
          />
          <h2>{w.howTitle}</h2>
          <p>{w.how}</p>
          <p>{w.linkNote}</p>
          <p>
            {w.scopeNote} <Link to={`/${lang}/terms`}>{d.nav.terms}</Link>
          </p>
        </div>
      </section>
    </>
  );
}
