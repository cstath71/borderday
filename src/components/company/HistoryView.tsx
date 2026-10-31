import { Link } from 'react-router-dom';
import type { DayType } from '../../borders/types';
import type { EmployeeDashboardRow } from '../../company/dashboardMath';
import type { Dict } from '../../i18n';
import CounterTable from './CounterTable';

/** Dates and day types only, by construction: the props carry nothing else. */
export default function HistoryView(props: {
  d: Dict;
  row: EmployeeDashboardRow;
  logs: Array<{ workDate: string; dayType: DayType }>;
  backHref: string;
  backLabel: string;
  isDemo?: boolean;
}) {
  const { d, row, logs, backHref, backLabel, isDemo } = props;
  return (
    <>
      <Link className="meta" to={backHref}>
        ← {backLabel}
      </Link>
      <h1>{d.company.historyTitle}</h1>
      <p>{d.company.historySubtitle}</p>
      <p>
        <strong>
          {isDemo && (
            <span className="badge warn" style={{ marginRight: '0.35rem' }}>
              {d.company.demoDataBadge}
            </span>
          )}
          {row.displayName}
        </strong>{' '}
        · {row.email}
      </p>
      <h2 className="meta">{d.company.countersHeading}</h2>
      <CounterTable d={d} counters={row.counters} />
      <table className="counter-table" style={{ marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>{d.company.colDate}</th>
            <th>{d.company.colDayType}</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.workDate}>
              <td>{l.workDate}</td>
              <td>{(d.dayTypes as Record<string, string>)[l.dayType] ?? l.dayType}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.length === 0 && <p className="meta">—</p>}
    </>
  );
}
