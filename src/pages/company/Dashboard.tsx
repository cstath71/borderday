import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import DashboardView from '../../components/company/DashboardView';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import { buildDashboardRows } from '../../company/buildRows';
import type { EmployeeDashboardRow } from '../../company/dashboardMath';
import type { Invitation } from '../../company/types';
import { getDict } from '../../i18n';
import { useAuth } from '../../lib/auth';
import { companyHasPaidAccess } from '../../lib/billing';
import * as api from '../../lib/companyApi';

type Loaded = {
  name: string;
  paid: boolean;
  rows: EmployeeDashboardRow[];
  invites: Invitation[];
};

type State =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'error' }
  | { status: 'ready'; data: Loaded };

export default function CompanyDashboard() {
  const lang = useLang();
  const d = getDict(lang);
  const auth = useAuth();
  const location = useLocation();
  const { companyId } = useParams();
  const year = new Date().getFullYear();
  const userId = auth.user?.id;
  const [state, setState] = useState<State>({ status: 'loading' });
  const [companies, setCompanies] = useState<api.MyCompany[] | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!userId || companyId) return;
    let cancelled = false;
    api
      .listMyCompanies()
      .then((list) => {
        if (!cancelled) setCompanies(list.filter((c) => api.isHrRole(c.role)));
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [userId, companyId]);

  useEffect(() => {
    if (!userId || !companyId) return;
    let cancelled = false;
    (async () => {
      const membership = await api.myMembership(companyId);
      if (!api.isHrRole(membership?.role)) {
        if (!cancelled) setState({ status: 'denied' });
        return;
      }
      const [company, members, logs, invites] = await Promise.all([
        api.getCompany(companyId),
        api.listMembers(companyId),
        api.listDayLogs(companyId),
        api.listInvites(companyId, 'pending'),
      ]);
      if (cancelled) return;
      if (!company) {
        setState({ status: 'denied' });
        return;
      }
      setState({
        status: 'ready',
        data: {
          name: company.name,
          paid: companyHasPaidAccess(company.subscription_status, company.trial_ends_at),
          rows: buildDashboardRows({ members, logs, year }),
          invites,
        },
      });
    })().catch(() => {
      if (!cancelled) setState({ status: 'error' });
    });
    return () => {
      cancelled = true;
    };
  }, [userId, companyId, year, tick]);

  if (auth.ready && !auth.user) {
    return <Navigate to={`/${lang}/auth/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!companyId && companies?.length === 1) {
    return <Navigate to={`/${lang}/company/${companies[0].id}/dashboard`} replace />;
  }

  let body: React.ReactNode;
  if (!companyId && companies) {
    body = (
      <>
        <h1>{d.company.dashboardTitle}</h1>
        {companies.length === 0 ? (
          <>
            <p>{d.company.noCompany}</p>
            <Link className="btn btn-primary" to={`/${lang}/company/signup`}>
              {d.nav.companySignup}
            </Link>
          </>
        ) : (
          <>
            <p>{d.company.chooseCompany}</p>
            <ul>
              {companies.map((c) => (
                <li key={c.id}>
                  <Link to={`/${lang}/company/${c.id}/dashboard`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </>
    );
  } else if (state.status === 'loading') {
    body = <p role="status">{d.company.loading}</p>;
  } else if (state.status === 'error') {
    body = <p role="alert">{d.company.loadError}</p>;
  } else if (state.status === 'denied') {
    body = (
      <>
        <h1>{d.company.dashboardTitle}</h1>
        <p>{d.company.accessDenied}</p>
        <Link className="btn btn-primary" to={`/${lang}/app`}>
          {d.nav.openApp}
        </Link>
      </>
    );
  } else {
    const { data } = state;
    body = (
      <>
        {!data.paid && (
          <div className="demo-banner" role="status">
            {d.company.billingInactive} <Link to={`/${lang}/pricing`}>{d.company.billingCta}</Link>
          </div>
        )}
        <DashboardView
          d={d}
          companyName={data.name}
          rows={data.rows}
          invites={data.invites}
          year={year}
          companyBase={`/${lang}/company/${companyId}`}
          joinBase={`/${lang}/join`}
          onRefresh={() => setTick((x) => x + 1)}
          onSaveProfile={async (employeeId, profile) => {
            await api.updateEmployeeProfile(companyId!, employeeId, profile);
            setTick((x) => x + 1);
          }}
        />
      </>
    );
  }

  return (
    <>
      <Seo
        lang={lang}
        title={`${d.company.dashboardTitle} — BorderDay`}
        description={d.company.dashboardSubtitle}
        path={companyId ? `company/${companyId}/dashboard` : 'company/dashboard'}
        noindex
      />
      <section className="section">
        <div className="container">{body}</div>
      </section>
    </>
  );
}
