import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { CompanyRole, Invitation } from '../../company/types';
import { LANGS, type Dict, type Lang } from '../../i18n';

/** Presentational: the real invite page and /demo supply the data and the create action. */
export default function InviteView(props: {
  d: Dict;
  invites: Invitation[];
  canInviteOwner: boolean;
  dashboardHref: string;
  joinPath: (token: string) => string;
  /** Preselected language for the employee's email and link. */
  lang: Lang;
  onCreate: (email: string, role: CompanyRole, lang: Lang) => Promise<{ link: string; emailed: boolean }>;
}) {
  const { d, invites, canInviteOwner, dashboardHref, joinPath, lang, onCreate } = props;
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CompanyRole>('employee');
  const [inviteLang, setInviteLang] = useState<Lang>(lang);
  const [created, setCreated] = useState<{ link: string; emailed: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      setCreated(await onCreate(email, role, inviteLang));
      setEmail('');
    } catch {
      setError(d.company.inviteFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link className="meta" to={dashboardHref}>
        ← {d.company.backDashboard}
      </Link>
      <h1>{d.company.inviteTitle}</h1>
      <p>{d.company.inviteSubtitle}</p>
      <form className="card stack-form" onSubmit={submit}>
        <label>
          {d.company.inviteEmail}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          {d.company.inviteRole}
          <select value={role} onChange={(e) => setRole(e.target.value as CompanyRole)}>
            <option value="employee">{d.company.roleEmployee}</option>
            <option value="hr_viewer">{d.company.roleHr}</option>
            {canInviteOwner && <option value="owner">{d.company.roleOwner}</option>}
          </select>
        </label>
        <label>
          {d.company.inviteLanguage}
          <select value={inviteLang} onChange={(e) => setInviteLang(e.target.value as Lang)}>
            {LANGS.map((l) => (
              <option key={l} value={l}>
                {d.lang[l]}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {d.company.sendInvite}
        </button>
        {error && (
          <p role="alert" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}
        {created && (
          <div>
            <p role="status">{created.emailed ? d.company.inviteEmailed : d.company.inviteCreated}</p>
            <label>
              {d.company.inviteLinkLabel}
              <input readOnly value={created.link} onFocus={(e) => e.target.select()} />
            </label>
          </div>
        )}
      </form>
      <div className="card" style={{ marginTop: '1rem' }}>
        <h2>{d.company.pendingInvites}</h2>
        <ul>
          {invites.map((i) => (
            <li key={i.id}>
              {i.email} · {i.role} · <code>{joinPath(i.token)}</code>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
