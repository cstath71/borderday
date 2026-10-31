import type { BorderPack, CounterResult } from '../borders/types';
import { t, type Dict } from '../i18n';

function labelFor(d: Dict, key: string): string {
  const c = d.counters as Record<string, string>;
  return c[key] ?? key;
}

export default function CounterCards({
  d,
  pack,
  results,
}: {
  d: Dict;
  pack: BorderPack;
  results: CounterResult[];
}) {
  return (
    <div>
      {pack.counters.map((counter) => {
        const result = results.find((r) => r.counterId === counter.id)!;
        const status = result.status;
        const pct =
          result.ratio != null ? Math.min(100, Math.round(result.ratio * 1000) / 10) : 0;

        let valueText: string;
        if (!result.enabled) {
          valueText = d.counters.ruleBeingConfirmed;
        } else if (result.unit === 'percent_of_working_time') {
          valueText = [
            t(d.counters.usedOfDays, {
              used: result.usedDays ?? 0,
              allowed: result.allowedDays ?? 0,
            }),
            t(d.counters.percentOfAnnual, {
              pct: result.percentOfAnnual ?? 0,
              annual: result.annualWorkingDays ?? pack.defaultAnnualWorkingDays,
              limit: result.limit ?? 0,
            }),
          ].join(' · ');
        } else {
          valueText = t(d.counters.usedOf, { used: result.used, limit: result.limit ?? 0 });
        }

        return (
          <div className="card counter-card" key={counter.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div>
                <div className="label">{labelFor(d, counter.labelKey)}</div>
                <div className="meta">
                  {counter.kind === 'tax' ? d.counters.tax : d.counters.social_security}
                </div>
              </div>
              <span className={`badge ${status}`}>
                {labelFor(d, `status_${status}`)}
              </span>
            </div>
            <div className={`bar ${status}`} aria-hidden>
              <span style={{ width: result.enabled ? `${pct}%` : '0%' }} />
            </div>
            <div className="meta">{valueText}</div>
            {!result.enabled && counter.pendingReasonKey && (
              <p className="meta">{labelFor(d, counter.pendingReasonKey)}</p>
            )}
            {counter.notesKey && result.enabled && (
              <details style={{ marginTop: '0.5rem' }}>
                <summary className="meta">{d.counters.sourceLink}</summary>
                <p className="meta">{labelFor(d, counter.notesKey)}</p>
                <ul className="meta">
                  {counter.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noreferrer">
                        {s.title}
                      </a>{' '}
                      — {t(d.counters.checkedOn, { date: s.checked })}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {!result.enabled && counter.sources.length > 0 && (
              <ul className="meta">
                {counter.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noreferrer">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
