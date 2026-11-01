import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDict, t, type Lang } from '../i18n';
import { useAuth } from '../lib/auth';
import { openCustomerPortal, planIsCancellable } from '../lib/billing';
import { hasCancellableIndividualPlan, listMyCompanies } from '../lib/companyApi';

type Plans = { companies: Array<{ id: string; name: string }>; individual: boolean };

/** Owners cancel per company; individuals cancel their own plan, through the billing portal. */
export default function CancelPanel({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const c = d.cancel;
  const auth = useAuth();
  const userId = auth.user?.id;
  const [plans, setPlans] = useState<Plans | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    Promise.all([listMyCompanies(), hasCancellableIndividualPlan()])
      .then(([companies, individual]) => {
        if (cancelled) return;
        setPlans({
          companies: companies.filter((m) => m.role === 'owner' && planIsCancellable(m.subscription_status)),
          individual,
        });
      })
      .catch(() => {
        if (!cancelled) setPlans({ companies: [], individual: false });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function open(companyId?: string) {
    setError(false);
    setBusy(true);
    try {
      const res = await openCustomerPortal(companyId, lang);
      if (res.ok) {
        window.location.assign(res.url);
        return;
      }
      setError(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  if (!auth.user) {
    return (
      <p>
        <Link className="btn btn-secondary" to={`/${lang}/auth/sign-in?next=${encodeURIComponent(`/${lang}/cancel`)}`}>
          {c.signIn}
        </Link>
      </p>
    );
  }
  if (!plans) return <p role="status">{d.company.loading}</p>;

  const none = plans.companies.length === 0 && !plans.individual;
  return (
    <>
      <p>{none ? c.noPlans : c.accountBody}</p>
      <div className="toolbar">
        {plans.companies.map((company) => (
          <button key={company.id} type="button" className="btn btn-danger" disabled={busy} onClick={() => void open(company.id)}>
            {t(c.companyButton, { company: company.name })}
          </button>
        ))}
        {plans.individual && (
          <button type="button" className="btn btn-danger" disabled={busy} onClick={() => void open()}>
            {c.individualButton}
          </button>
        )}
      </div>
      {!none && <p className="meta">{c.portalPeriodEnd}</p>}
      {error && (
        <p role="alert" style={{ color: 'var(--danger)' }}>
          {c.portalError}
        </p>
      )}
    </>
  );
}
