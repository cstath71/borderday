import type { BorderPack, CounterMessage, CounterResult, LimitCounter } from '../borders/types';
import { t, type Dict } from '../i18n';
import { formatDays } from '../lib/counting';

function labelFor(d: Dict, key: string): string {
  const c = d.counters as Record<string, string>;
  return c[key] ?? key;
}

export function kindLabel(d: Dict, kind: LimitCounter['kind']): string {
  return labelFor(d, kind);
}

export function badgeLabel(d: Dict, status: string, statusLabelKey?: string): string {
  return labelFor(d, statusLabelKey ?? `status_${status}`);
}

function displayVars(d: Dict, vars: CounterMessage['vars']): Record<string, string | number> {
  const shown: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(vars ?? {})) shown[k] = typeof v === 'number' ? formatDays(v, d.counters.decimalMark) : v;
  return shown;
}

/** What the result means for this person. Always visible: a caveat behind a click is not a caveat. */
export function CounterMessages({ d, messages }: { d: Dict; messages: CounterMessage[] }) {
  return (
    <>
      {messages.map((m) => (
        <p className={`meta counter-message ${m.tone}`} key={m.key}>
          {t(labelFor(d, m.key), displayVars(d, m.vars))}
        </p>
      ))}
    </>
  );
}

export function CounterSources({ d, counter }: { d: Dict; counter: Pick<LimitCounter, 'sources'> }) {
  if (counter.sources.length === 0) return null;
  return (
    <details style={{ marginTop: '0.5rem' }}>
      <summary className="meta">{d.counters.ruleAndConditions}</summary>
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
  );
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
        // Optional counters (e.g. FR→BE pre-2012) stay hidden until the profile flag is set.
        if (counter.requiresProfileFlag && !result.enabled) return null;
        const status = result.status;
        const pct =
          result.ratio != null ? Math.min(100, Math.round(result.ratio * 1000) / 10) : 0;

        let valueText: string;
        if (!result.enabled) {
          valueText = labelFor(d, counter.pendingValueKey ?? 'status_disabled');
        } else if (result.unit === 'percent_of_working_time') {
          valueText = [
            t(d.counters.usedOfDays, {
              used: formatDays(result.usedDays ?? 0, d.counters.decimalMark),
              allowed: result.allowedDays ?? 0,
            }),
            t(d.counters.percentOfAnnual, {
              pct: formatDays(result.percentOfAnnual ?? 0, d.counters.decimalMark),
              annual: result.annualWorkingDays ?? pack.defaultAnnualWorkingDays,
              limit: result.limit ?? 0,
            }),
          ].join(' · ');
        } else {
          valueText = t(d.counters.usedOf, { used: formatDays(result.used, d.counters.decimalMark), limit: result.limit ?? 0 });
        }

        return (
          <div className="card counter-card" key={counter.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div>
                <div className="label">{labelFor(d, counter.labelKey)}</div>
                <div className="meta">{kindLabel(d, counter.kind)}</div>
              </div>
              <span className={`badge ${status}`}>{badgeLabel(d, status, result.statusLabelKey)}</span>
            </div>
            <div className={`bar ${status}`} aria-hidden>
              <span style={{ width: result.enabled ? `${pct}%` : '0%' }} />
            </div>
            <div className="meta">{valueText}</div>
            <CounterMessages d={d} messages={result.messages} />
            {!result.enabled && counter.pendingReasonKey && (
              <p className="meta">{labelFor(d, counter.pendingReasonKey)}</p>
            )}
            {counter.notesKey && result.enabled && <p className="meta">{labelFor(d, counter.notesKey)}</p>}
            <CounterSources d={d} counter={counter} />
          </div>
        );
      })}
      <p className="meta">{d.counters.half_day_note}</p>
      <p className="meta">{d.counters.multi_employer_note}</p>
    </div>
  );
}
