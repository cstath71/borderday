import type { EmployeeCounterSummary } from '../../company/dashboardMath';
import { t, type Dict } from '../../i18n';

export function statusLabel(d: Dict, status: string): string {
  return (d.counters as Record<string, string>)[`status_${status}`] ?? status;
}

export default function CounterTable({ d, counters }: { d: Dict; counters: EmployeeCounterSummary[] }) {
  if (counters.length === 0) return <p className="meta">{d.company.emptyCounters}</p>;
  return (
    <table className="counter-table">
      <thead>
        <tr>
          <th>{d.company.countersHeading}</th>
          <th>
            {d.company.kindTax}/{d.company.kindSs}
          </th>
          <th>{d.company.usedAllowed}</th>
          <th>{d.company.status}</th>
        </tr>
      </thead>
      <tbody>
        {counters.map((c) => (
          <tr key={c.counterId}>
            <td>{(d.counters as Record<string, string>)[c.labelKey] ?? c.labelKey}</td>
            <td>{c.kind === 'tax' ? d.company.kindTax : d.company.kindSs}</td>
            <td>
              {c.enabled
                ? t(d.counters.usedOfDays, {
                    used: c.usedDays ?? 0,
                    allowed: c.allowedDays ?? 0,
                  })
                : '—'}
            </td>
            <td>
              <span className={`badge ${c.status}`}>{statusLabel(d, c.status)}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
