import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import DashboardView, { type TeamMember } from '../../components/company/DashboardView';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import { buildDashboardRows, buildDetachedDashboardRows, buildFormerDashboardRows } from '../../company/buildRows';
import type { EmployeeDashboardRow } from '../../company/dashboardMath';
import type { Invitation } from '../../company/types';
import { getDict, t } from '../../i18n';
import { useAuth } from '../../lib/auth';
import { publicPath } from '../../lib/publicPath';
import { companyHasPaidAccess, planStatus, type PlanStatus } from '../../lib/billing';
import { zurichToday } from '../../lib/counting';
import type { ImportMember } from '../../lib/dayImport';
import * as api from '../../lib/companyApi';

/** Stripe's webhook usually lands within seconds of the return from checkout. */
const CHECKOUT_RECHECK_MS = 2000;
const CHECKOUT_RECHECKS = 5;

type Loaded = {
  name: string;
  paid: boolean;
  plan: PlanStatus;
  rows: EmployeeDashboardRow[];
  formerRows: EmployeeDashboardRow[];
  dayLogs: api.DayLogView[];
  members: api.CompanyMemberRow[];
  invites: Invitation[];
  retentionMonths: number;
  isOwner: boolean;
  hrViewers: TeamMember[];
  activeEmployeeCount: number;
  seatCount: number | null;
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
  const [year, setYear] = useState(() => new Date().getFullYear());
  const userId = auth.user?.id;
  const [state, setState] = useState<State>({ status: 'loading' });
  const [companies, setCompanies] = useState<api.MyCompany[] | null>(null);
  const [tick, setTick] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [fromCheckout] = useState(() => searchParams.get('checkout') === 'success');
  const [rechecks, setRechecks] = useState(0);

  useEffect(() => {
    if (!searchParams.has('checkout')) return;
    const next = new URLSearchParams(searchParams);
    next.delete('checkout');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const awaitingWebhook = fromCheckout && state.status === 'ready' && !state.data.paid && rechecks < CHECKOUT_RECHECKS;
  useEffect(() => {
    if (!awaitingWebhook) return;
    const timer = setTimeout(() => {
      setRechecks((n) => n + 1);
      setTick((x) => x + 1);
    }, CHECKOUT_RECHECK_MS);
    return () => clearTimeout(timer);
  }, [awaitingWebhook, rechecks]);

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
      const activeEmployees = members.filter((m) => m.role === 'employee' && m.active !== false);
      setState({
        status: 'ready',
        data: {
          name: company.name,
          paid: companyHasPaidAccess(company.subscription_status, company.trial_ends_at),
          plan: planStatus(company),
          rows: buildDashboardRows({ members, logs, year }),
          formerRows: [
            ...buildFormerDashboardRows({ members, logs, year }),
            ...buildDetachedDashboardRows({ logs, year }),
          ],
          dayLogs: logs,
          members,
          invites,
          retentionMonths: company.data_retention_months ?? 24,
          isOwner: membership?.role === 'owner',
          hrViewers: members
            .filter((m) => m.active && api.canDeactivateMember({ userId: userId!, role: membership!.role }, m) && m.role === 'hr_viewer')
            .map((m) => ({ userId: m.userId, displayName: m.displayName, email: m.email })),
          activeEmployeeCount: activeEmployees.length,
          seatCount: typeof company.seat_count === 'number' ? company.seat_count : null,
        },
      });
    })().catch(() => {
      if (!cancelled) setState({ status: 'error' });
    });
    return () => {
      cancelled = true;
    };
  }, [userId, companyId, year, tick]);

  if (auth.signingOut) {
    return <Navigate to={`/${lang}/`} replace />;
  }
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
            <Link className="btn btn-primary" to={publicPath(lang, 'company/signup')}>
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
    body = <LoadingSkeleton label={d.company.loading} />;
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
    const { plan } = data;
    const planText = (d.company as unknown as Record<string, string>)[plan.key];
    const planDate =
      'date' in plan
        ? new Date(plan.date).toLocaleDateString(({ en: 'en-CH', fr: 'fr-CH', de: 'de-CH', it: 'it-CH', nl: 'nl-BE' } as const)[lang] ?? 'en-CH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Europe/Zurich',
          })
        : '';
    body = (
      <>
        {fromCheckout && (
          <div className="demo-banner" role="status">
            {d.company.checkoutDone}
          </div>
        )}
        {!data.paid && !awaitingWebhook && (
          <div className="demo-banner" role="status">
            {d.company.billingInactive}{" "}
            <Link to={`${publicPath(lang, 'pricing')}?companyId=${encodeURIComponent(companyId!)}`}>{d.company.billingCta}</Link>
          </div>
        )}
        <p className="meta" data-testid="plan-status">
          {d.company.planLabel}: {t(planText, { date: planDate })}
          {' · '}
          {t(d.company.seatsLine, {
            active: data.activeEmployeeCount,
            seats: data.seatCount ?? data.activeEmployeeCount,
          })}
          {plan.key !== 'planNone' && plan.key !== 'planCanceled' && (
            <>
              {' · '}
              <Link to={publicPath(lang, 'cancel')}>{d.company.planManage}</Link>
            </>
          )}
        </p>
        <DashboardView
          d={d}
          companyName={data.name}
          rows={data.rows}
          formerRows={data.formerRows}
          dayLogs={data.dayLogs}
          invites={data.invites}
          year={year}
          onYearChange={setYear}
          companyBase={`/${lang}/company/${companyId}`}
          joinBase={`/${lang}/join`}
          retentionMonths={data.retentionMonths}
          canEditRetention={data.isOwner}
          hrViewers={data.hrViewers}
          canRevokeInvite={(invite) => data.isOwner || invite.role !== 'owner'}
          onRefresh={() => setTick((x) => x + 1)}
          onDeactivateMember={async (memberId) => {
            const result = await api.deactivateMember(companyId!, memberId);
            setTick((x) => x + 1);
            return result;
          }}
          onRevokeInvite={async (inviteId) => {
            await api.revokeInvite(companyId!, inviteId);
            setTick((x) => x + 1);
          }}
          onResendInvite={(invite) => api.resendInvite(companyId!, invite.id, invite.lang || lang)}
          onSaveProfile={async (employeeId, profile) => {
            await api.updateEmployeeProfile(companyId!, employeeId, profile);
            setTick((x) => x + 1);
          }}
          onSaveRetention={
            data.isOwner
              ? async (months) => {
                  await api.updateCompanyRetention(companyId!, months);
                  setTick((x) => x + 1);
                }
              : undefined
          }
          employmentByUser={Object.fromEntries(
            data.members.map((m) => [m.userId, { employedFrom: m.employedFrom ?? null, employedUntil: m.employedUntil ?? null }]),
          )}
          importContext={{
            today: zurichToday(),
            members: data.members.map(
              (m): ImportMember => ({
                userId: m.userId,
                email: m.email,
                active: m.active !== false,
                removedAt: m.removedAt ?? null,
                employedFrom: m.employedFrom ?? null,
                employedUntil: m.employedUntil ?? null,
              }),
            ),
            existing: data.dayLogs.map((l) => ({
              employeeUserId: l.employeeUserId,
              workDate: l.workDate,
              entrySource: l.entrySource,
              employeeCorrectedAt: l.employeeCorrectedAt,
              voidedAt: l.voidedAt,
            })),
            onImport: async (rows) => {
              const result = await api.importCompanyDayLogs(companyId!, rows);
              setTick((x) => x + 1);
              return result;
            },
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
