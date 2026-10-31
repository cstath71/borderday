import type { Dict } from '../i18n';

export interface ProfileValues {
  employmentPercent: number | null;
  a1InPlace: boolean;
  a1ValidUntil: string | null;
}

/** Employment % and A1 record: the same fields for an employee on /app and for HR on the dashboard. */
export default function ProfileFields({
  d,
  idPrefix,
  value,
  onChange,
  onCommit,
}: {
  d: Dict;
  idPrefix: string;
  value: ProfileValues;
  onChange: (next: ProfileValues) => void;
  /** Called when a field is finished with. `next` is what to persist. */
  onCommit?: (next: ProfileValues) => void;
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
    </>
  );
}
