import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import HistoryView from '../../components/company/HistoryView';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import { buildEmployeeRow } from '../../company/buildRows';
import type { EmployeeDashboardRow } from '../../company/dashboardMath';
import { getDict } from '../../i18n';
import { useAuth } from '../../lib/auth';
import * as api from '../../lib/companyApi';

type State =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'error' }
  | { status: 'ready'; row: EmployeeDashboardRow; logs: api.DayLogView[] };

export default function EmployeeHistory() {
  const lang = useLang();
  const d = getDict(lang);
  const auth = useAuth();
  const location = useLocation();
  const { companyId = '', employeeId = '' } = useParams();
  const userId = auth.user?.id;
  const isSelf = userId === employeeId;
  const year = new Date().getFullYear();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      // RLS returns only the caller's own row to employees, so another employee is simply absent.
      const [members, logs] = await Promise.all([
        api.listMembers(companyId),
        api.listDayLogs(companyId, employeeId),
      ]);
      if (cancelled) return;
      const member = members.find((m) => m.userId === employeeId);
      if (!member) {
        setState({ status: 'denied' });
        return;
      }
      setState({ status: 'ready', row: buildEmployeeRow(member, logs, year), logs });
    })().catch((err: unknown) => {
      if (cancelled) return;
      const denied = err instanceof Error && /access denied/.test(err.message);
      setState({ status: denied ? 'denied' : 'error' });
    });
    return () => {
      cancelled = true;
    };
  }, [userId, companyId, employeeId, year]);

  if (auth.signingOut) {
    return <Navigate to={`/${lang}/`} replace />;
  }
  if (auth.ready && !auth.user) {
    return <Navigate to={`/${lang}/auth/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  let body: React.ReactNode;
  if (state.status === 'loading') {
    body = <LoadingSkeleton label={d.company.loading} />;
  } else if (state.status === 'error') {
    body = <p role="alert">{d.company.loadError}</p>;
  } else if (state.status === 'denied') {
    body = (
      <>
        <p>{d.company.accessDenied}</p>
        <Link to={`/${lang}/app`}>{d.nav.openApp}</Link>
      </>
    );
  } else {
    body = (
      <HistoryView
        d={d}
        row={state.row}
        logs={state.logs}
        backHref={isSelf ? `/${lang}/app` : `/${lang}/company/${companyId}/dashboard`}
        backLabel={isSelf ? d.nav.openApp : d.company.backDashboard}
        locale={({en:'en-CH',fr:'fr-CH',de:'de-CH',it:'it-CH',nl:'nl-BE'} as const)[lang] ?? 'en-CH'}
      />
    );
  }

  return (
    <>
      <Seo
        lang={lang}
        title={`${d.company.historyTitle} — BorderDay`}
        description={d.company.historySubtitle}
        path={`company/${companyId}/employee/${employeeId}`}
        noindex
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          {body}
        </div>
      </section>
    </>
  );
}
