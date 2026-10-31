import { Link, useParams } from 'react-router-dom';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import { getDict } from '../../i18n';
import { getCompany, listDayLogsForEmployee, listAllMembers } from '../../lib/supabaseMock';

export default function EmployeeHistory() {
  const lang = useLang();
  const d = getDict(lang);
  const { companyId = '', employeeId = '' } = useParams();

  const company = (() => {
    try {
      return getCompany(companyId);
    } catch {
      return null;
    }
  })();

  const memberRow = (() => {
    try {
      return listAllMembers(companyId).find((m) => m.member.userId === employeeId) ?? null;
    } catch {
      return null;
    }
  })();

  const logs = (() => {
    try {
      return listDayLogsForEmployee(companyId, employeeId).sort((a, b) =>
        a.workDate < b.workDate ? 1 : -1,
      );
    } catch {
      return [];
    }
  })();

  return (
    <>
      <Seo
        lang={lang}
        title={`${d.company.historyTitle} — BorderDay`}
        description={d.company.historySubtitle}
        path={`company/${companyId}/employee/${employeeId}`}
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          {company?.isDemo && (
            <div className="demo-banner" role="status">
              <strong>{d.company.demoDataBadge}</strong> — {d.company.demoBanner}
            </div>
          )}
          <Link className="meta" to={`/${lang}/company/${companyId}/dashboard`}>
            ← {d.company.backDashboard}
          </Link>
          <h1>{d.company.historyTitle}</h1>
          <p>{d.company.historySubtitle}</p>
          {memberRow && (
            <p>
              <strong>
                {company?.isDemo && (
                  <span className="badge warn" style={{ marginRight: '0.35rem' }}>
                    {d.company.demoDataBadge}
                  </span>
                )}
                {memberRow.profile.displayName}
              </strong>{' '}
              · {memberRow.profile.email}
            </p>
          )}
          <table className="counter-table">
            <thead>
              <tr>
                <th>{d.company.colDate}</th>
                <th>{d.company.colDayType}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{l.workDate}</td>
                  <td>{(d.dayTypes as Record<string, string>)[l.dayType] ?? l.dayType}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <p className="meta">—</p>}
        </div>
      </section>
    </>
  );
}
