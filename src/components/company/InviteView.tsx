import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { CompanyRole, Invitation } from '../../company/types';
import { LANGS, type Dict, type Lang } from '../../i18n';
import type { ResendResult } from '../../lib/companyApi';
import PendingInvites from './PendingInvites';

type Created = { link: string; emailed: boolean; emailBlock?: 'no_access' | 'rate_limited' | null; reused?: boolean };

/** Presentational: the real invite page and /demo supply the data and the create action. */
export default function InviteView(props: {
  d: Dict;
  invites: Invitation[];
  canInviteOwner: boolean;
  dashboardHref: string;
  joinPath: (token: string) => string;
  /** Preselected language for the employee's email and link. */
  lang: Lang;
  onCreate: (email: string, role: CompanyRole, lang: Lang) => Promise<Created>;
  /** False shows, before submitting, that the invite will not be emailed. /demo leaves it out. */
  canEmail?: boolean;
  pricingHref?: string;
  canManage?: (invite: Invitation) => boolean;
  onResend?: (invite: Invitation) => Promise<ResendResult>;
  onRevoke?: (inviteId: string) => Promise<void>;
}) {
  const { d, invites, canInviteOwner, dashboardHref, joinPath, lang, onCreate, canEmail, pricingHref, canManage, onResend, onRevoke } = props;
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CompanyRole>('employee');
  const [inviteLang, setInviteLang] = useState<Lang>(lang);
  const [created, setCreated] = useState<Created | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreated(null); // F11: one status region — drop prior success before the next attempt
    setBusy(true);
    try {
      setCreated(await onCreate(email, role, inviteLang));
      setEmail('');
    } catch (err) {
      const code = err && typeof err === 'object' && 'code' in err ? String((err as { code?: string }).code) : '';
      if (code === 'already_member') setError(d.company.inviteAlreadyMember);
      else setError(d.company.inviteFailed);
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
        {canEmail === false && (
          <p className="meta" role="note">
            {d.company.inviteNeedsPlan}
            {pricingHref && (
              <>
                {' '}
                <Link to={pricingHref}>{d.company.billingCta}</Link>
              </>
            )}
          </p>
        )}
        <button className="btn btn-primary" type="submit" disabled={busy} aria-busy={busy}>
          {busy ? d.company.sendingInvite : d.company.sendInvite}
        </button>
        {error && (
          <p role="alert" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}
        {created && (
          <div>
            <p role="status">
              {created.reused
                ? created.emailed
                  ? d.company.inviteReusedEmailed
                  : created.emailBlock === 'rate_limited'
                    ? d.company.inviteNotEmailedLimit
                    : d.company.inviteReused
                : created.emailed
                  ? d.company.inviteEmailed
                  : created.emailBlock === 'no_access'
                    ? d.company.inviteNotEmailedNoPlan
                    : created.emailBlock === 'rate_limited'
                      ? d.company.inviteNotEmailedLimit
                      : d.company.inviteCreated}
            </p>
            <label>
              {d.company.inviteLinkLabel}
              <input readOnly value={created.link} onFocus={(e) => e.target.select()} />
            </label>
          </div>
        )}
      </form>
      <PendingInvites d={d} invites={invites} joinPath={joinPath} canManage={canManage} onResend={onResend} onRevoke={onRevoke} />
    </>
  );
}
