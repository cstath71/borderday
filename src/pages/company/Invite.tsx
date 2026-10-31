import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import InviteView from '../../components/company/InviteView';
import Seo from '../../components/Seo';
import { useLang } from '../../components/Layout';
import type { CompanyRole, Invitation } from '../../company/types';
import { getDict, type Lang } from '../../i18n';
import { useAuth } from '../../lib/auth';
import * as api from '../../lib/companyApi';

type State =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'error' }
  | { status: 'ready'; role: CompanyRole; invites: Invitation[] };

export default function CompanyInvite() {
  const lang = useLang();
  const d = getDict(lang);
  const auth = useAuth();
  const location = useLocation();
  const { companyId = '' } = useParams();
  const userId = auth.user?.id;
  const [state, setState] = useState<State>({ status: 'loading' });

  const load = useCallback(async () => {
    const membership = await api.myMembership(companyId);
    if (!membership || !api.isHrRole(membership.role)) return { status: 'denied' } as const;
    const invites = await api.listInvites(companyId, 'pending');
    return { status: 'ready', role: membership.role, invites } as const;
  }, [companyId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    load()
      .then((next) => {
        if (!cancelled) setState(next);
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [userId, load]);

  if (auth.ready && !auth.user) {
    return <Navigate to={`/${lang}/auth/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const joinPath = (token: string) => `/${lang}/join/${token}`;

  async function onCreate(email: string, role: CompanyRole, inviteLang: Lang) {
    const { invite, emailed } = await api.createInvite(companyId, email, role, inviteLang);
    setState(await load());
    return { link: `${window.location.origin}/${inviteLang}/join/${invite.token}`, emailed };
  }

  let body: React.ReactNode;
  if (state.status === 'loading') {
    body = <p role="status">{d.company.loading}</p>;
  } else if (state.status === 'error') {
    body = <p role="alert">{d.company.loadError}</p>;
  } else if (state.status === 'denied') {
    body = (
      <>
        <p>{d.company.accessDenied}</p>
        <Link to={`/${lang}/company/signup`}>{d.nav.companySignup}</Link>
      </>
    );
  } else {
    body = (
      <InviteView
        d={d}
        invites={state.invites}
        canInviteOwner={state.role === 'owner'}
        dashboardHref={`/${lang}/company/${companyId}/dashboard`}
        joinPath={joinPath}
        lang={lang}
        onCreate={onCreate}
      />
    );
  }

  return (
    <>
      <Seo
        lang={lang}
        title={`${d.company.inviteTitle} — BorderDay`}
        description={d.company.inviteSubtitle}
        path={`company/${companyId}/invite`}
        noindex
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          {body}
        </div>
      </section>
    </>
  );
}
