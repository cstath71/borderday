import { Link } from 'react-router-dom';
import RequestMailForm from '../components/RequestMailForm';
import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict, t } from '../i18n';
import { useAuth } from '../lib/auth';

/**
 * OPEN C5: this is the labelled route to withdraw, not a full § 356a BGB function with its own
 * confirmation mail. A live test order must show whether Link offers one, and a lawyer must confirm.
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
          <RequestMailForm
            d={d}
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
