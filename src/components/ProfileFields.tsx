import type { Dict } from '../i18n';

export interface ProfileValues {
  employmentPercent: number | null;
  contractDaysPerYear?: number | null;
  employmentFullMonths?: number | null;
  employmentFullWeeks?: number | null;
  a1InPlace: boolean;
  a1ValidUntil: string | null;
  frontierBefore2012?: boolean;
}

/** Employment % and A1 record: the same fields for an employee on /app and for HR on the dashboard. */
export default function ProfileFields({
  d,
  idPrefix,
  value,
  onChange,
  onCommit,
  showFrontierBefore2012 = false,
  showContractDays = false,
  showPartYear = false,
}: {
  d: Dict;
  idPrefix: string;
  value: ProfileValues;
  onChange: (next: ProfileValues) => void;
  /** Called when a field is finished with. `next` is what to persist. */
  onCommit?: (next: ProfileValues) => void;
  /** FR→BE only: tick opens the optional pre-2012 30-day counter. */
  showFrontierBefore2012?: boolean;
  /** Germany–Switzerland only: contract days per year cut the 60-day limit (protocol 5(i)). */
  showContractDays?: boolean;
  /** Germany–Switzerland only: full months + weeks for protocol 5(g) part-year cut. */
  showPartYear?: boolean;
}) {
  return (
    <>
      <label style={{ display: 'block', marginTop: '0.75rem' }} htmlFor={`${idPrefix}-employment`}>
        <strong>{d.app.employmentPercent}</strong>
        <div className="meta">{d.app.employmentPercentHint}</div>
      </label>
      <input
        id={`${idPrefix}-employment`}
        className="num"
        type="number"
        min={1}
        max={100}
        style={{ marginTop: '0.35rem' }}
        value={value.employmentPercent ?? ''}
        onChange={(e) => {
          const v = Math.trunc(Number(e.target.value));
          onChange({ ...value, employmentPercent: v >= 1 && v <= 100 ? v : null });
        }}
        onBlur={() => onCommit?.(value)}
      />
      {showContractDays && (
        <>
          <label style={{ display: 'block', marginTop: '0.75rem' }} htmlFor={`${idPrefix}-contract-days`}>
            <strong>{d.app.contractDaysPerYear}</strong>
            <div className="meta">{d.app.contractDaysPerYearHint}</div>
          </label>
          <input
            id={`${idPrefix}-contract-days`}
            className="num"
            type="number"
            min={1}
            max={366}
            style={{ marginTop: '0.35rem' }}
            value={value.contractDaysPerYear ?? ''}
            onChange={(e) => {
              const v = Math.trunc(Number(e.target.value));
              onChange({ ...value, contractDaysPerYear: v >= 1 && v <= 366 ? v : null });
            }}
            onBlur={() => onCommit?.(value)}
          />
        </>
      )}
      {showPartYear && (
        <>
          <label style={{ display: 'block', marginTop: '0.75rem' }} htmlFor={`${idPrefix}-full-months`}>
            <strong>{d.app.employmentFullMonths}</strong>
            <div className="meta">{d.app.employmentFullMonthsHint}</div>
          </label>
          <input
            id={`${idPrefix}-full-months`}
            className="num"
            type="number"
            min={0}
            max={12}
            style={{ marginTop: '0.35rem' }}
            value={value.employmentFullMonths ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') {
                onChange({ ...value, employmentFullMonths: null });
                return;
              }
              const v = Math.trunc(Number(raw));
              onChange({ ...value, employmentFullMonths: v >= 0 && v <= 12 ? v : null });
            }}
            onBlur={() => onCommit?.(value)}
          />
          <label style={{ display: 'block', marginTop: '0.75rem' }} htmlFor={`${idPrefix}-full-weeks`}>
            <strong>{d.app.employmentFullWeeks}</strong>
            <div className="meta">{d.app.employmentFullWeeksHint}</div>
          </label>
          <input
            id={`${idPrefix}-full-weeks`}
            className="num"
            type="number"
            min={0}
            max={51}
            style={{ marginTop: '0.35rem' }}
            value={value.employmentFullWeeks ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') {
                onChange({ ...value, employmentFullWeeks: null });
                return;
              }
              const v = Math.trunc(Number(raw));
              onChange({ ...value, employmentFullWeeks: v >= 0 && v <= 51 ? v : null });
            }}
            onBlur={() => onCommit?.(value)}
          />
        </>
      )}
      <label style={{ display: 'block', marginTop: '0.75rem' }}>
        <input
          type="checkbox"
          checked={value.a1InPlace}
          onChange={(e) => {
            const next = { ...value, a1InPlace: e.target.checked, a1ValidUntil: e.target.checked ? value.a1ValidUntil : null };
            onChange(next);
            onCommit?.(next);
          }}
        />{' '}
        <strong>{d.app.a1InPlace}</strong>
        <div className="meta">{d.app.a1Hint}</div>
      </label>
      {value.a1InPlace && (
        <label style={{ display: 'block', marginTop: '0.5rem' }}>
          <strong>{d.app.a1ValidUntil}</strong>{' '}
          <input
            type="date"
            value={value.a1ValidUntil ?? ''}
            onChange={(e) => onChange({ ...value, a1ValidUntil: e.target.value || null })}
            onBlur={() => onCommit?.(value)}
          />
        </label>
      )}
      {showFrontierBefore2012 && (
        <label style={{ display: 'block', marginTop: '0.75rem' }}>
          <input
            type="checkbox"
            checked={!!value.frontierBefore2012}
            onChange={(e) => {
              const next = { ...value, frontierBefore2012: e.target.checked };
              onChange(next);
              onCommit?.(next);
            }}
          />{' '}
          <strong>{d.app.frontierBefore2012}</strong>
          <div className="meta">{d.app.frontierBefore2012Hint}</div>
        </label>
      )}
    </>
  );
}
