import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import { getDict } from '../../i18n';
import type { CompanyRole } from '../../company/types';
import {
  createInvitation,
  getCompany,
  listInvitations,
  myMembership,
  seedDemoCompany,
} from '../../lib/supabaseMock';

export default function CompanyInvite() {
  const lang = useLang();
  const d = getDict(lang);
  const { companyId: paramId } = useParams();
  const companyId = paramId ?? seedDemoCompany().companyId;
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CompanyRole>('employee');
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const company = (() => {
    try {
      return getCompany(companyId);
    } catch {
      return null;
    }
  })();
  const membership = (() => {
    try {
      return myMembership(companyId);
    } catch {
      return null;
    }
  })();

  const invites = (() => {
    void tick;
    try {
      return listInvitations(companyId);
    } catch {
      return [];
    }
  })();

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const inv = createInvitation(companyId, email, role);
      const url = `${window.location.origin}/${lang}/join/${inv.token}`;
      setLink(url);
      setEmail('');
      setTick((x) => x + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'error');
    }
  }

  if (!company || !membership || (membership.role !== 'owner' && membership.role !== 'hr_viewer')) {
    return (
      <section className="section">
        <div className="container">
          <p>HR or owner required.</p>
          <Link to={`/${lang}/company/signup`}>{d.nav.companySignup}</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <Seo
        lang={lang}
        title={`${d.company.inviteTitle} — BorderDay`}
        description={d.company.inviteSubtitle}
        path={`company/${companyId}/invite`}
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          {company.isDemo && (
            <div className="demo-banner" role="status">
              <strong>{d.company.demoDataBadge}</strong> — {d.company.demoBanner}
            </div>
          )}
          <Link className="meta" to={`/${lang}/company/${companyId}/dashboard`}>
            ← {d.company.backDashboard}
          </Link>
          <h1>{d.company.inviteTitle}</h1>
          <p>{d.company.inviteSubtitle}</p>
          <form className="card stack-form" onSubmit={onCreate}>
            <label>
              {d.company.inviteEmail}
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              {d.company.inviteRole}
              <select value={role} onChange={(e) => setRole(e.target.value as CompanyRole)}>
                <option value="employee">{d.company.roleEmployee}</option>
                <option value="hr_viewer">{d.company.roleHr}</option>
                {membership.role === 'owner' && <option value="owner">{d.company.roleOwner}</option>}
              </select>
            </label>
            <button className="btn btn-primary" type="submit">
              {d.company.sendInvite}
            </button>
            {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
            {link && (
              <div>
                <p>{d.company.inviteCreated}</p>
                <label>
                  {d.company.inviteLinkLabel}
                  <input readOnly value={link} onFocus={(e) => e.target.select()} />
                </label>
              </div>
            )}
          </form>
          <div className="card" style={{ marginTop: '1rem' }}>
            <h2>{d.company.pendingInvites}</h2>
            <ul>
              {invites
                .filter((i) => i.status === 'pending')
                .map((i) => (
                  <li key={i.id}>
                    {i.email} · {i.role} ·{' '}
                    <code>
                      /{lang}/join/{i.token}
                    </code>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
