import { useState } from 'react';
import { listBorderPacks } from '../../borders/packs';
import type { BorderId } from '../../borders/types';
import type { Dict } from '../../i18n';

/** Presentational: the real join page and /demo supply the accept action. */
export default function JoinForm(props: {
  d: Dict;
  companyName: string;
  email: string;
  role: string;
  error: string | null;
  busy?: boolean;
  onSubmit: (values: { displayName: string; borderPackId: BorderId }) => void;
}) {
  const { d, companyName, email, role, error, busy, onSubmit } = props;
  const packs = listBorderPacks();
  const [displayName, setDisplayName] = useState('');
  const [border, setBorder] = useState<BorderId | ''>('');
  const [consent, setConsent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setLocalError(d.company.consentRequired);
      return;
    }
    setLocalError(null);
    if (border) onSubmit({ displayName, borderPackId: border });
  }

  const shownError = localError ?? error;
  return (
    <form className="card stack-form" onSubmit={submit}>
      <p>
        <strong>{companyName}</strong> → {email} ({role})
      </p>
      <label>
        {d.company.yourName}
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
      </label>
      <label>
        {d.company.pickBorder}
        <select value={border} onChange={(e) => setBorder(e.target.value as BorderId | '')} required>
          <option value="">—</option>
          {packs.map((p) => (
            <option key={p.id} value={p.id}>
              {(d.borders as Record<string, string>)[p.nameKey]}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="consent-box">
        <legend>{d.company.consentTitle}</legend>
        <p>{d.company.consentBody}</p>
        <label className="consent-check">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          {d.company.consentAccept}
        </label>
      </fieldset>
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {d.company.joinButton}
      </button>
      {shownError && (
        <p role="alert" style={{ color: 'var(--danger)' }}>
          {shownError}
        </p>
      )}
    </form>
  );
}
