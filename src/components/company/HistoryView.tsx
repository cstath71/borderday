import { Link } from 'react-router-dom';
import type { DayType } from '../../borders/types';
import type { EmployeeDashboardRow } from '../../company/dashboardMath';
import type { Dict } from '../../i18n';
import { provenanceOf } from '../../lib/dayImport';
import CounterTable from './CounterTable';

/** Dates, day types, the two marks and who entered the day. The props carry no note. */
export default function HistoryView(props: {
  d: Dict;
  row: EmployeeDashboardRow;
  logs: Array<{
    workDate: string;
    dayType: DayType;
    overnightAway?: boolean;
    dayShare?: 0.5 | 1;
    entrySource?: 'employee' | 'hr' | null;
    employeeConfirmedAt?: string | null;
    employeeCorrectedAt?: string | null;
  }>;
  backHref: string;
  backLabel: string;
  isDemo?: boolean;
  locale?: string;
}) {
  const { d, row, logs, backHref, backLabel, isDemo, locale = 'en-CH' } = props;
  return (
    <>
      <Link className="meta" to={backHref}>
        ← {backLabel}
      </Link>
      <h1>{d.company.historyTitle}</h1>
      <p>{d.company.historySubtitle}</p>
      <p className="meta" role="note">{d.company.hrDisclaimer}</p>
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
            <th>{d.dayTypes.halfDayShort}</th>
            <th>{d.dayTypes.overnightAwayShort}</th>
            <th>{d.company.colEnteredBy}</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => {
            const who = provenanceOf(l);
            const entered =
              who === 'hr_import_corrected'
                ? d.company.dayImport.provenanceHrCorrected
                : who === 'hr_import_confirmed'
                  ? d.company.dayImport.provenanceHrConfirmed
                  : who === 'hr_import'
                    ? d.company.dayImport.provenanceHr
                    : d.company.dayImport.provenanceEmployee;
            return (
            <tr key={l.workDate}>
              <td>{new Date(l.workDate + 'T12:00:00').toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
              <td>{(d.dayTypes as Record<string, string>)[l.dayType] ?? l.dayType}</td>
              <td>{l.dayShare === 0.5 ? '½' : ''}</td>
              <td>{l.overnightAway ? '✓' : ''}</td>
              <td>{entered}</td>
            </tr>
            );
          })}
        </tbody>
      </table>
      {logs.length === 0 && <p className="meta">—</p>}
    </>
  );
}
