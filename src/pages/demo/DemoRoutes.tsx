import { useMemo, useState } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom';
import DashboardView from '../../components/company/DashboardView';
import HistoryView from '../../components/company/HistoryView';
import InviteView from '../../components/company/InviteView';
import JoinForm from '../../components/company/JoinForm';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import { buildDashboardRows, buildEmployeeRow, type RowMember } from '../../company/buildRows';
import type { CompanyMember, Profile } from '../../company/types';
import { getDict } from '../../i18n';
import { publicPath } from '../../lib/publicPath';
import {
  acceptInvitation,
  createInvitation,
  getCompany,
  listAllMembers,
  listDayLogsForEmployee,
  updateEmployeeProfile,
  listInvitations,
  peekInvitation,
  recordConsent,
  seedDemoCompany,
  signIn,
} from '../../lib/supabaseMock';

/**
 * The only place the browser-local mock is reachable. Loaded lazily from App.tsx so it is not
 * in the main bundle. Everything here is sample data and is labelled DEMO.
 */
function DemoShell() {
  const lang = useLang();
  const d = getDict(lang);
  return (
    <>
      <Seo
        lang={lang}
        title={`DEMO — ${d.company.dashboardTitle} — BorderDay`}
        description={d.company.demoBanner}
        path="demo"
        noindex
      />
      <section className="section">
        <div className="container">
          <div className="demo-banner" role="status">
            <strong>{d.company.demoDataBadge}</strong> — {d.company.demoBanner}{' '}
            <Link to={publicPath(lang, 'company/signup')}>{d.nav.companySignup}</Link>
          </div>
          <Outlet />
        </div>
      </section>
    </>
  );
}

function toRowMember({ member, profile }: { member: CompanyMember; profile: Profile }): RowMember {
  return {
    userId: member.userId,
    role: member.role,
    displayName: profile.displayName,
    email: profile.email,
    borderPackId: member.borderPackId,
    annualWorkingDays: member.annualWorkingDays,
    employmentPercent: member.employmentPercent,
    contractDaysPerYear: member.contractDaysPerYear,
    a1InPlace: member.a1InPlace,
    a1ValidUntil: member.a1ValidUntil,
  };
}

function loadLogs(companyId: string, userId: string) {
  return listDayLogsForEmployee(companyId, userId).map((l) => ({
    employeeUserId: l.employeeUserId,
    workDate: l.workDate,
    dayType: l.dayType,
    overnightAway: l.overnightAway,
    dayShare: l.dayShare,
  }));
}

function DemoIndex() {
  const lang = useLang();
  const { companyId } = seedDemoCompany();
  return <Navigate to={`/${lang}/demo/company/${companyId}/dashboard`} replace />;
}

function DemoDashboard() {
  const lang = useLang();
  const d = getDict(lang);
  const [tick, setTick] = useState(0);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { companyId, company, rows, dayLogs, invites } = useMemo(() => {
    void tick;
    const { companyId: id } = seedDemoCompany();
    const members = listAllMembers(id).map(toRowMember);
    const logs = members.flatMap((m) => loadLogs(id, m.userId));
    return {
      companyId: id,
      company: getCompany(id),
      rows: buildDashboardRows({ members, logs, year, isDemo: true }),
      dayLogs: logs,
      invites: listInvitations(id).filter((i) => i.status === 'pending'),
    };
  }, [tick, year]);

  return (
    <DashboardView
      d={d}
      companyName={company?.name ?? ''}
      rows={rows}
      dayLogs={dayLogs}
      invites={invites}
      year={year}
      onYearChange={setYear}
      isDemo
      companyBase={`/${lang}/demo/company/${companyId}`}
      joinBase={`/${lang}/demo/join`}
      onRefresh={() => setTick((x) => x + 1)}
      onSaveProfile={async (userId, profile) => {
        updateEmployeeProfile(companyId, userId, profile);
        setTick((x) => x + 1);
      }}
    />
  );
}

function DemoInvite() {
  const lang = useLang();
  const d = getDict(lang);
  const [tick, setTick] = useState(0);
  const { companyId, invites } = useMemo(() => {
    void tick;
    const { companyId: id } = seedDemoCompany();
    return { companyId: id, invites: listInvitations(id).filter((i) => i.status === 'pending') };
  }, [tick]);
  const joinPath = (token: string) => `/${lang}/demo/join/${token}`;

  return (
    <div style={{ maxWidth: 640 }}>
      <InviteView
        lang={lang}
        d={d}
        invites={invites}
        canInviteOwner
        dashboardHref={`/${lang}/demo/company/${companyId}/dashboard`}
        joinPath={joinPath}
        onCreate={async (email, role, inviteLang) => {
          const inv = createInvitation(companyId, email, role);
          setTick((x) => x + 1);
          return { link: `${window.location.origin}/${inviteLang}/demo/join/${inv.token}`, emailed: false };
        }}
      />
    </div>
  );
}

function DemoHistory() {
  const lang = useLang();
  const d = getDict(lang);
  const { employeeId = '' } = useParams();
  const year = new Date().getFullYear();
  const { companyId } = seedDemoCompany();
  const entry = listAllMembers(companyId).find((m) => m.member.userId === employeeId);
  const back = `/${lang}/demo/company/${companyId}/dashboard`;
  if (!entry) return <Navigate to={back} replace />;
  const logs = loadLogs(companyId, employeeId).sort((a, b) => (a.workDate < b.workDate ? 1 : -1));

  return (
    <div style={{ maxWidth: 720 }}>
      <HistoryView
        d={d}
        row={buildEmployeeRow(toRowMember(entry), logs, year, true)}
        logs={logs}
        backHref={back}
        backLabel={d.company.backDashboard}
        isDemo
        locale={({en:'en-CH',fr:'fr-CH',de:'de-CH',it:'it-CH',nl:'nl-BE'} as const)[lang] ?? 'en-CH'}
      />
    </div>
  );
}

function DemoJoin() {
  const lang = useLang();
  const d = getDict(lang);
  const { token = '' } = useParams();
  const [peek] = useState(() => {
    seedDemoCompany();
    return peekInvitation(token);
  });
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 640 }}>
      <h1>{d.company.joinTitle}</h1>
      <p>{d.company.joinSubtitle}</p>
      {!peek ? (
        <p role="alert">{d.company.inviteInvalid}</p>
      ) : done ? (
        <div className="card">
          <p>{d.company.joinSuccess}</p>
          <Link className="btn btn-primary" to={`/${lang}/demo`}>
            {d.company.backDashboard}
          </Link>
        </div>
      ) : (
        <JoinForm
          privacyHref={publicPath(lang, 'privacy')}
          d={d}
          companyName={peek.companyName}
          email={peek.email}
          role={peek.role}
          error={error}
          onSubmit={({ displayName, borderPackId }) => {
            try {
              signIn(peek.email, displayName);
              acceptInvitation(token, { displayName, borderPackId });
              recordConsent(peek.companyId, lang);
              setDone(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : d.company.loadError);
            }
          }}
        />
      )}
    </div>
  );
}

export default function DemoRoutes() {
  return (
    <Routes>
      <Route element={<DemoShell />}>
        <Route index element={<DemoIndex />} />
        <Route path="company/:companyId/dashboard" element={<DemoDashboard />} />
        <Route path="company/:companyId/invite" element={<DemoInvite />} />
        <Route path="company/:companyId/employee/:employeeId" element={<DemoHistory />} />
        <Route path="join/:token" element={<DemoJoin />} />
      </Route>
    </Routes>
  );
}
