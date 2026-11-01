import type { EmployeeCounterSummary } from '../../company/dashboardMath';
import { t, type Dict } from '../../i18n';
import { formatDays } from '../../lib/counting';
import { badgeLabel, CounterMessages, CounterSources, kindLabel } from '../CounterCards';

export function statusLabel(d: Dict, status: string): string {
  return (d.counters as Record<string, string>)[`status_${status}`] ?? status;
}

export default function CounterTable({ d, counters }: { d: Dict; counters: EmployeeCounterSummary[] }) {
  if (counters.length === 0) return <p className="meta">{d.company.emptyCounters}</p>;
  const text = d.counters as Record<string, string>;
  return (
    <>
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
          {counters.map((c) => {
            const condition = c.enabled ? c.notesKey : c.pendingReasonKey;
            return (
              <tr key={c.counterId}>
                <td>
                  {text[c.labelKey] ?? c.labelKey}
                  <CounterMessages d={d} messages={c.messages} />
                  {condition && (
                    <details>
                      <summary className="meta">{d.counters.ruleAndConditions}</summary>
                      <p className="meta">{text[condition] ?? condition}</p>
                      <CounterSources d={d} counter={c} />
                    </details>
                  )}
                </td>
                <td>{kindLabel(d, c.kind)}</td>
                <td>
                  {c.enabled
                    ? t(d.counters.usedOfDays, {
                        used: formatDays(c.usedDays ?? 0, d.counters.decimalMark),
                        allowed: c.allowedDays ?? 0,
                      })
                    : (text[c.pendingValueKey ?? ''] ?? '—')}
                  {c.enabled && c.unit === 'percent_of_working_time' && (
                    <div className="meta">
                      {t(d.counters.percentOfAnnual, {
                        pct: formatDays(c.percentOfAnnual ?? 0, d.counters.decimalMark),
                        annual: c.annualWorkingDays ?? 0,
                        limit: c.limit ?? 0,
                      })}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`badge ${c.status}`}>{badgeLabel(d, c.status, c.statusLabelKey)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="meta">{d.counters.half_day_note}</p>
      <p className="meta">{d.counters.multi_employer_note}</p>
    </>
  );
}
