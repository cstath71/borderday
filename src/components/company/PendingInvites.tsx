import { useState } from 'react';
import type { Invitation } from '../../company/types';
import { t, type Dict } from '../../i18n';
import type { ResendResult } from '../../lib/companyApi';

/** One list for the dashboard and the invite page, so the two cannot disagree. /demo passes no actions. */
export default function PendingInvites(props: {
  d: Dict;
  invites: Invitation[];
  joinPath: (token: string) => string;
  canManage?: (invite: Invitation) => boolean;
  onResend?: (invite: Invitation) => Promise<ResendResult>;
  onRevoke?: (inviteId: string) => Promise<void>;
}) {
  const { d, invites, joinPath, canManage, onResend, onRevoke } = props;
  const c = d.company;
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'status' | 'alert'; text: string } | null>(null);

  const linkFor = (invite: Invitation) => `${window.location.origin}${joinPath(invite.token)}`;

  async function copy(invite: Invitation) {
    try {
      await navigator.clipboard.writeText(linkFor(invite));
      setNotice({ tone: 'status', text: c.linkCopied });
    } catch {
      // No clipboard permission: the link stays selectable in its field.
      setNotice(null);
    }
  }

  async function resend(invite: Invitation) {
    if (!onResend) return;
    setBusy(true);
    setNotice(null);
    try {
      const { emailed, emailBlock } = await onResend(invite);
      if (emailed) setNotice({ tone: 'status', text: t(c.inviteResent, { email: invite.email }) });
      else if (emailBlock === 'no_access') setNotice({ tone: 'alert', text: c.resendNoPlan });
      else if (emailBlock === 'rate_limited') setNotice({ tone: 'alert', text: c.resendLimit });
      else setNotice({ tone: 'alert', text: c.resendFailed });
    } catch {
      setNotice({ tone: 'alert', text: c.resendFailed });
    } finally {
      setBusy(false);
    }
  }

  async function revoke(invite: Invitation) {
    if (!onRevoke) return;
    if (!window.confirm(t(c.revokeConfirm, { email: invite.email }))) return;
    setBusy(true);
    setNotice(null);
    try {
      await onRevoke(invite.id);
      setNotice({ tone: 'status', text: t(c.inviteRevoked, { email: invite.email }) });
    } catch {
      setNotice({ tone: 'alert', text: c.revokeFailed });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h2>{c.pendingInvites}</h2>
      {notice && <p role={notice.tone}>{notice.text}</p>}
      {invites.length === 0 ? (
        <p className="meta">{c.noPendingInvites}</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {invites.map((i) => {
            const manage = canManage?.(i) ?? true;
            return (
              <li key={i.id} style={{ marginBottom: '1rem' }}>
                <div>
                  {i.email} · {i.role}
                </div>
                <input
                  readOnly
                  aria-label={`${c.inviteLinkLabel}: ${i.email}`}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                  value={linkFor(i)}
                  onFocus={(e) => e.target.select()}
                />
                <div className="toolbar" style={{ marginTop: '0.25rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => void copy(i)}>
                    {t(c.copyLink, { email: i.email })}
                  </button>
                  {onResend && manage && (
                    <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void resend(i)}>
                      {t(c.resendInvite, { email: i.email })}
                    </button>
                  )}
                  {onRevoke && manage && (
                    <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void revoke(i)}>
                      {t(c.revokeInvite, { email: i.email })}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
