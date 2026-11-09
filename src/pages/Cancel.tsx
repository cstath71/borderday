import CancelPanel from '../components/CancelPanel';
import RequestForm from '../components/RequestForm';
import PublicSeo from '../components/PublicSeo';
import { useLang } from '../components/Layout';
import { getDict, t } from '../i18n';
import { useAuth } from '../lib/auth';

/** Permanent cancellation route (H11). Lawyer to confirm it meets § 312k BGB and L215-1-1 (see phase 3 report). */
export default function Cancel() {
  const lang = useLang();
  const d = getDict(lang);
  const auth = useAuth();
  const c = d.cancel;

  return (
    <>
      <PublicSeo path="cancel" />
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <h1>{c.title}</h1>
          <p id="summary">{c.intro}</p>
          <h2>{c.accountTitle}</h2>
          <CancelPanel lang={lang} />
          <h2>{c.linkTitle}</h2>
          <p>{c.linkBody}</p>
          <h2>{c.formTitle}</h2>
          <p>{c.formBody}</p>
          <RequestForm
            d={d}
            lang={lang}
            kind="cancellation"
            to="hello@borderday.com"
            subject={c.mailSubject}
            body={(v) =>
              t(c.mailBody, {
                name: v.name,
                email: v.email,
                reference: v.reference || '—',
                today: new Date().toISOString().slice(0, 10),
              })
            }
            submitLabel={c.submit}
            confirmLabel={c.confirm}
            initialEmail={auth.user?.email ?? ''}
          />
        </div>
      </section>
    </>
  );
}
