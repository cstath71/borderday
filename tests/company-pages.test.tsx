// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Rendering the real App proves the production routes: if any of them imported the mock, this throws.
vi.mock('../src/lib/supabaseMock', () => {
  throw new Error('production route loaded supabaseMock');
});

const auth = vi.hoisted(() => ({
  value: { ready: true, configured: true, user: null as null | { id: string; email: string }, signOut: vi.fn() },
}));
vi.mock('../src/lib/auth', () => ({ useAuth: () => auth.value, AuthProvider: ({ children }: any) => children }));

vi.mock('../src/lib/companyApi', async (original) => {
  const actual = await original<typeof import('../src/lib/companyApi')>();
  return {
    isHrRole: actual.isHrRole,
    isInviteOpen: actual.isInviteOpen,
    sameEmail: actual.sameEmail,
    pickAppAccess: actual.pickAppAccess,
    canDeactivateMember: actual.canDeactivateMember,
    deactivateMember: vi.fn(async () => ({ billingSynced: true })),
    revokeInvite: vi.fn(async () => undefined),
    resendInvite: vi.fn(async () => ({ emailed: true, emailBlock: null })),
    createCompany: vi.fn(),
    updateCompanyRetention: vi.fn(async () => undefined),
    listMyCompanies: vi.fn(async () => []),
    getCompany: vi.fn(),
    listMembers: vi.fn(),
    myMembership: vi.fn(),
    createInvite: vi.fn(),
    listInvites: vi.fn(async () => []),
    getInviteByToken: vi.fn(),
    acceptInvite: vi.fn(),
    updateMemberSelf: vi.fn(),
    updateMyProfile: vi.fn(),
    updateEmployeeProfile: vi.fn(async () => undefined),
    updateMyDisplayName: vi.fn(),
    listDayLogs: vi.fn(async () => []),
    listMyDayNotes: vi.fn(async () => new Map()),
    listMyDaysIn: vi.fn(async () => []),
    listFormerCompanies: vi.fn(async () => []),
    deleteMyDayLogs: vi.fn(async () => undefined),
    upsertDayLog: vi.fn(),
    isDayLogOtherCompany: actual.isDayLogOtherCompany,
    hasIndividualAccess: vi.fn(async () => false),
    hasCancellableIndividualPlan: vi.fn(async () => false),
    getOwnAccountRecords: vi.fn(async () => ({ displayName: null, noticeRecords: [], subscriptions: [] })),
    listPersonalDayLogs: vi.fn(async () => []),
    upsertPersonalDayLog: vi.fn(),
    deleteMyPersonalDayLogs: vi.fn(),
    resolveAppAccess: vi.fn(),
  };
});

import App from '../src/App';
import en from '../src/i18n/en';
import fr from '../src/i18n/fr';
import * as api from '../src/lib/companyApi';
import { CONSENT_VERSION } from '../src/company/types';

const mocked = vi.mocked(api);
const HR = { id: 'hr1', email: 'hr@acme.test' };
const EMP = { id: 'emp1', email: 'emp@acme.test' };

const empRow = {
  id: 'm1',
  userId: 'emp1',
  role: 'employee' as const,
  borderPackId: 'geneva_fr' as const,
  annualWorkingDays: 240,
  active: true,
  joinedAt: '2026-01-01',
  email: 'emp@acme.test',
  displayName: 'Real Employee',
};

function open(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function asHr(paid = true) {
  auth.value.user = HR;
  mocked.myMembership.mockResolvedValue({ role: 'owner', borderPackId: null, annualWorkingDays: null });
  mocked.getCompany.mockResolvedValue({
    id: 'c1',
    name: 'Acme Real SA',
    subscription_status: paid ? 'active' : 'none',
    trial_ends_at: null,
    seat_count: 1,
    current_period_end: null,
    data_retention_months: 24,
  } as any);
  mocked.listMembers.mockResolvedValue([empRow]);
  mocked.listDayLogs.mockResolvedValue([{ employeeUserId: 'emp1', workDate: '2026-03-02', dayType: 'telework' }]);
}

beforeEach(() => {
  vi.clearAllMocks();
  auth.value.user = null;
  auth.value.ready = true;
  mocked.listMyCompanies.mockResolvedValue([]);
  mocked.listInvites.mockResolvedValue([]);
  mocked.listDayLogs.mockResolvedValue([]);
});
afterEach(cleanup);

describe('Dashboard', () => {
  it('sends a signed-out visitor to sign-in and back', async () => {
    open('/en/company/c1/dashboard');
    await screen.findByRole('heading', { name: en.auth.signInTitle });
    expect(mocked.listMembers).not.toHaveBeenCalled();
  });

  it('shows real employees from companyApi with no demo or backend wording', async () => {
    asHr();
    const { container } = open('/en/company/c1/dashboard');
    await screen.findByText('Real Employee');
    expect(screen.getByText('Acme Real SA')).toBeTruthy();
    expect(mocked.listMembers).toHaveBeenCalledWith('c1');
    expect(mocked.listDayLogs).toHaveBeenCalledWith('c1');
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/DEMO|Backend|local-mock/);
    expect(text).not.toContain(en.company.billingInactive);
  });

  it('HR sees A1-required with its caveat, and the rule conditions, not just a status', async () => {
    asHr();
    mocked.listDayLogs.mockResolvedValue(
      Array.from({ length: 72 }, (_, i) => ({
        employeeUserId: 'emp1',
        workDate: new Date(Date.UTC(new Date().getFullYear(), 0, 1 + i)).toISOString().slice(0, 10),
        dayType: 'telework' as const,
        overnightAway: false,
      })),
    );
    const { container } = open('/en/company/c1/dashboard');
    await screen.findByText('Real Employee');
    expect(screen.getAllByText(en.counters.status_a1_required).length).toBeGreaterThan(0);
    expect(screen.getByText(en.counters.ss_band_a1_required)).toBeTruthy();
    expect(screen.getAllByText(en.counters.ruleAndConditions).length).toBeGreaterThan(0);
    expect(container.textContent).toContain(en.counters.multi_employer_note);
  });

  it('HR records an employee A1 through companyApi and reloads the counters', async () => {
    asHr();
    open('/en/company/c1/dashboard');
    await screen.findByText('Real Employee');
    fireEvent.click(screen.getByLabelText(new RegExp(en.app.a1InPlace.replace(/[()]/g, '\\$&'))));
    const calls = mocked.listMembers.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: en.company.saveProfile }));
    await screen.findByText(en.company.profileSaved);
    expect(mocked.updateEmployeeProfile).toHaveBeenCalledWith('c1', 'emp1', {
      employmentPercent: null,
      contractDaysPerYear: null,
      a1InPlace: true,
      a1ValidUntil: null,
      frontierBefore2012: false,
      annualWorkingDays: 240,
    });
    await waitFor(() => expect(mocked.listMembers.mock.calls.length).toBeGreaterThan(calls));
  });

  it('A3-13: company sign-up shows which DPA version applies', async () => {
    mocked.listMyCompanies.mockResolvedValue([]);
    const { container } = open('/en/company/signup');
    await waitFor(() => expect(container.textContent).toContain(en.company.dpaVersionNote));
  });

  describe('A3-21 retention warning', () => {
    const setMonths = async (months: string) => {
      const field = (await screen.findByLabelText(en.company.retentionMonths)) as HTMLInputElement;
      fireEvent.change(field, { target: { value: months } });
      fireEvent.click(screen.getByRole('button', { name: en.company.retentionSave }));
    };

    it('setting 1 month warns of irreversible deletion, and saves nothing if refused', async () => {
      asHr();
      const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValue(true);
      open('/en/company/c1/dashboard');
      await screen.findByText('Real Employee');
      await setMonths('1');
      expect(confirm).toHaveBeenCalledTimes(1);
      const text = confirm.mock.calls[0][0] as string;
      expect(text).toContain('Lower retention to 1 months?');
      expect(text).toContain('permanently deleted at the next daily purge');
      expect(text).toContain('cannot be undone');
      expect(text).toContain(en.company.retentionConfirmShort);
      expect(mocked.updateCompanyRetention).not.toHaveBeenCalled();
      await setMonths('1');
      await waitFor(() => expect(mocked.updateCompanyRetention).toHaveBeenCalledWith('c1', 1));
      confirm.mockRestore();
    });

    it('lowering to 13 months or more warns without the calendar-year line', async () => {
      asHr();
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
      open('/en/company/c1/dashboard');
      await screen.findByText('Real Employee');
      await setMonths('13');
      expect(confirm.mock.calls[0][0]).not.toContain(en.company.retentionConfirmShort);
      await waitFor(() => expect(mocked.updateCompanyRetention).toHaveBeenCalledWith('c1', 13));
      confirm.mockRestore();
    });

    it('raising or keeping retention deletes nothing, so it does not ask', async () => {
      asHr();
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
      open('/en/company/c1/dashboard');
      await screen.findByText('Real Employee');
      await setMonths('24');
      await waitFor(() => expect(mocked.updateCompanyRetention).toHaveBeenCalledWith('c1', 24));
      await setMonths('36');
      await waitFor(() => expect(mocked.updateCompanyRetention).toHaveBeenCalledWith('c1', 36));
      expect(confirm).not.toHaveBeenCalled();
      confirm.mockRestore();
    });
  });

  describe('A3-04 offboarding', () => {
    const inviteRow = {
      id: 'inv1', companyId: 'c1', email: 'new@acme.test', role: 'employee' as const, token: 'tok',
      status: 'pending' as const, invitedBy: 'hr1', createdAt: '2026-10-01', expiresAt: '2026-10-15',
    };

    it('deactivates only after confirmation, reloads, and says it worked', async () => {
      asHr();
      const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValue(true);
      open('/en/company/c1/dashboard');
      await screen.findByText('Real Employee');
      const button = screen.getByRole('button', { name: 'Remove Real Employee' });
      fireEvent.click(button);
      expect(mocked.deactivateMember).not.toHaveBeenCalled();
      const calls = mocked.listMembers.mock.calls.length;
      fireEvent.click(button);
      await screen.findByText('Real Employee was removed.');
      expect(mocked.deactivateMember).toHaveBeenCalledWith('c1', 'emp1');
      await waitFor(() => expect(mocked.listMembers.mock.calls.length).toBeGreaterThan(calls));
      confirm.mockRestore();
    });

    it('says when billing was not confirmed, and when the removal was refused', async () => {
      asHr();
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
      mocked.deactivateMember.mockResolvedValueOnce({ billingSynced: false });
      open('/en/company/c1/dashboard');
      fireEvent.click(await screen.findByRole('button', { name: 'Remove Real Employee' }));
      expect((await screen.findByRole('alert')).textContent).toContain('hello@borderday.com');
      mocked.deactivateMember.mockRejectedValueOnce(new Error('deactivation denied'));
      fireEvent.click(await screen.findByRole('button', { name: 'Remove Real Employee' }));
      await screen.findByText(en.company.deactivateFailed);
      confirm.mockRestore();
    });

    it('lists other HR viewers, not the signed-in user or owners', async () => {
      asHr();
      const me = { ...empRow, id: 'm2', userId: 'hr1', role: 'hr_viewer' as const, displayName: 'Me Myself' };
      const other = { ...empRow, id: 'm3', userId: 'hr2', role: 'hr_viewer' as const, displayName: 'Other Viewer' };
      const owner = { ...empRow, id: 'm4', userId: 'o1', role: 'owner' as const, displayName: 'The Owner' };
      const gone = { ...empRow, id: 'm5', userId: 'hr3', role: 'hr_viewer' as const, displayName: 'Gone Viewer', active: false };
      mocked.listMembers.mockResolvedValue([empRow, me, other, owner, gone]);
      open('/en/company/c1/dashboard');
      await screen.findByRole('heading', { name: en.company.hrViewersTitle });
      screen.getByRole('button', { name: 'Remove Other Viewer' });
      for (const name of ['Remove Me Myself', 'Remove The Owner', 'Remove Gone Viewer']) {
        expect(screen.queryByRole('button', { name })).toBeNull();
      }
    });

    it('revokes a pending invite after confirmation', async () => {
      asHr();
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
      mocked.listInvites.mockResolvedValue([inviteRow]);
      open('/en/company/c1/dashboard');
      fireEvent.click(await screen.findByRole('button', { name: 'Revoke invite for new@acme.test' }));
      await screen.findByText('Invite for new@acme.test revoked.');
      expect(mocked.revokeInvite).toHaveBeenCalledWith('c1', 'inv1');
      confirm.mockRestore();
    });

    it('an HR viewer gets no revoke button on an owner invite', async () => {
      asHr();
      mocked.myMembership.mockResolvedValue({ role: 'hr_viewer', borderPackId: null, annualWorkingDays: null });
      mocked.listInvites.mockResolvedValue([{ ...inviteRow, role: 'owner' }]);
      open('/en/company/c1/dashboard');
      await screen.findByText(en.company.pendingInvites);
      expect(screen.queryByRole('button', { name: 'Revoke invite for new@acme.test' })).toBeNull();
    });

  });

  it('says so when saving the profile is refused', async () => {
    asHr();
    mocked.updateEmployeeProfile.mockRejectedValueOnce(new Error('profile update denied'));
    open('/en/company/c1/dashboard');
    await screen.findByText('Real Employee');
    fireEvent.click(screen.getByRole('button', { name: en.company.saveProfile }));
    expect((await screen.findByRole('alert')).textContent).toBe(en.app.saveError);
  });

  describe('E9: subscription status line', () => {
    const company = (fields: object) =>
      mocked.getCompany.mockResolvedValue({ id: 'c1', name: 'Acme Real SA', seat_count: 1, data_retention_months: 24, trial_ends_at: null, current_period_end: null, ...fields } as any);
    it.each([
      [{ subscription_status: 'trialing', trial_ends_at: '2999-03-04T12:00:00Z' }, 'Plan: free trial until 4 March 2999'],
      [{ subscription_status: 'active', current_period_end: '2999-05-06T12:00:00Z' }, 'Plan: active, current period ends on 6 May 2999'],
      [{ subscription_status: 'past_due' }, `Plan: ${en.company.planPastDue}`],
      [{ subscription_status: 'canceled' }, 'Plan: cancelled'],
      [{ subscription_status: 'none' }, 'Plan: no active plan'],
    ])('%j', async (fields, text) => {
      asHr();
      company(fields);
      open('/en/company/c1/dashboard');
      await screen.findByText('Real Employee');
      expect(screen.getByTestId('plan-status').textContent).toContain(text);
    });
  });

  describe('E8: back from company checkout', () => {
    it('confirms, and rechecks rather than claiming no subscription while the webhook is on its way', async () => {
      asHr(false);
      open('/en/company/c1/dashboard?checkout=success');
      await screen.findByText(en.company.checkoutDone);
      expect(screen.queryByText(en.company.billingInactive, { exact: false })).toBeNull();
      mocked.getCompany.mockResolvedValue({ id: 'c1', name: 'Acme Real SA', subscription_status: 'trialing', trial_ends_at: '2999-01-01T00:00:00Z', seat_count: 1, data_retention_months: 24 } as any);
      await waitFor(() => expect(screen.getByTestId('plan-status').textContent).toContain('free trial'), { timeout: 3500 });
      expect(screen.queryByText(en.company.billingInactive, { exact: false })).toBeNull();
    });

    it('a normal visit to an unpaid company still says so', async () => {
      asHr(false);
      open('/en/company/c1/dashboard');
      await screen.findByText(en.company.billingInactive, { exact: false });
      expect(screen.queryByText(en.company.checkoutDone)).toBeNull();
    });
  });

  it('points an unpaid company at pricing', async () => {
    asHr(false);
    open('/en/company/c1/dashboard');
    await screen.findByText('Real Employee');
    expect(screen.getByText(en.company.billingInactive, { exact: false })).toBeTruthy();
    expect(screen.getByRole('link', { name: en.company.billingCta }).getAttribute('href')).toBe('/en/pricing');
  });

  it('denies an employee and loads no company data', async () => {
    auth.value.user = EMP;
    mocked.myMembership.mockResolvedValue({ role: 'employee', borderPackId: null, annualWorkingDays: null });
    open('/en/company/c1/dashboard');
    await screen.findByText(en.company.accessDenied);
    expect(mocked.listMembers).not.toHaveBeenCalled();
    expect(mocked.listDayLogs).not.toHaveBeenCalled();
  });

  it('without an id, offers company sign-up rather than a demo', async () => {
    auth.value.user = HR;
    const { container } = open('/en/company/dashboard');
    await screen.findByText(en.company.noCompany);
    expect(container.textContent).not.toMatch(/DEMO/);
  });

  it('without an id, opens the only HR company', async () => {
    asHr();
    mocked.listMyCompanies.mockResolvedValue([{ id: 'c1', name: 'Acme Real SA', role: 'owner' } as any]);
    open('/en/company/dashboard');
    await screen.findByText('Real Employee');
  });

  it('shows an error rather than an empty dashboard when loading fails', async () => {
    asHr();
    mocked.listMembers.mockRejectedValue(new Error('boom'));
    open('/en/company/c1/dashboard');
    await screen.findByText(en.company.loadError);
  });
});

describe('Invite', () => {
  const pending = { id: 'inv1', companyId: 'c1', email: 'new@acme.test', role: 'employee', token: 'tok9', status: 'pending', invitedBy: null, createdAt: '2026-10-01', expiresAt: '2999-01-01' } as any;

  it('E7: warns before submitting when no plan or trial would allow the email', async () => {
    asHr(false);
    open('/en/company/c1/invite');
    await screen.findByText(en.company.inviteNeedsPlan, { exact: false });
  });

  it('E7: no warning with an active plan, and the button says it is working while it sends', async () => {
    asHr();
    let finish!: (v: any) => void;
    mocked.createInvite.mockReturnValue(new Promise((r) => { finish = r; }));
    open('/en/company/c1/invite');
    fireEvent.change(await screen.findByLabelText(en.company.inviteEmail), { target: { value: 'new@acme.test' } });
    expect(screen.queryByText(en.company.inviteNeedsPlan, { exact: false })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: en.company.sendInvite }));
    const sending = (await screen.findByRole('button', { name: en.company.sendingInvite })) as HTMLButtonElement;
    expect(sending.disabled).toBe(true);
    finish({ invite: { token: 'tok123' }, emailed: true, emailBlock: null });
    await screen.findByText(en.company.inviteEmailed);
    screen.getByRole('button', { name: en.company.sendInvite });
  });

  it('E12: lists pending invites on load, with a full link and the same actions as the dashboard', async () => {
    asHr();
    mocked.listInvites.mockResolvedValue([pending]);
    open('/en/company/c1/invite');
    const link = (await screen.findByLabelText(`${en.company.inviteLinkLabel}: new@acme.test`)) as HTMLInputElement;
    expect(link.value).toBe(`${window.location.origin}/en/join/tok9`);
    screen.getByRole('button', { name: 'Copy link for new@acme.test' });
    screen.getByRole('button', { name: 'Resend invite to new@acme.test' });
    screen.getByRole('button', { name: 'Revoke invite for new@acme.test' });
  });

  it('E12: says so when nothing is pending', async () => {
    asHr();
    open('/en/company/c1/invite');
    await screen.findByText(en.company.noPendingInvites);
  });

  it('E11: revoking asks first; declining does nothing, confirming revokes and reloads', async () => {
    asHr();
    mocked.listInvites.mockResolvedValue([pending]);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    open('/en/company/c1/invite');
    fireEvent.click(await screen.findByRole('button', { name: 'Revoke invite for new@acme.test' }));
    expect(confirm).toHaveBeenCalled();
    expect(mocked.revokeInvite).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    mocked.listInvites.mockResolvedValue([]);
    fireEvent.click(screen.getByRole('button', { name: 'Revoke invite for new@acme.test' }));
    await screen.findByText(en.company.noPendingInvites);
    expect(mocked.revokeInvite).toHaveBeenCalledWith('c1', 'inv1');
    confirm.mockRestore();
  });

  it.each([
    [{ emailed: true, emailBlock: null }, 'Invite emailed again to new@acme.test, with the same link.'],
    [{ emailed: false, emailBlock: 'no_access' }, en.company.resendNoPlan],
    [{ emailed: false, emailBlock: 'rate_limited' }, en.company.resendLimit],
    [{ emailed: false, emailBlock: null }, en.company.resendFailed],
  ] as const)('E10: resend keeps the token and reports %j', async (result, text) => {
    asHr();
    mocked.listInvites.mockResolvedValue([pending]);
    mocked.resendInvite.mockResolvedValue(result as any);
    open('/en/company/c1/dashboard');
    fireEvent.click(await screen.findByRole('button', { name: 'Resend invite to new@acme.test' }));
    await screen.findByText(text);
    expect(mocked.resendInvite).toHaveBeenCalledWith('c1', 'inv1', 'en');
    expect(mocked.createInvite).not.toHaveBeenCalled();
  });

  it('E10: an HR viewer cannot resend or revoke an owner invite', async () => {
    asHr();
    mocked.myMembership.mockResolvedValue({ role: 'hr_viewer', borderPackId: null, annualWorkingDays: null });
    mocked.listInvites.mockResolvedValue([{ ...pending, role: 'owner' }]);
    open('/en/company/c1/invite');
    await screen.findByRole('button', { name: 'Copy link for new@acme.test' });
    expect(screen.queryByRole('button', { name: 'Resend invite to new@acme.test' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Revoke invite for new@acme.test' })).toBeNull();
  });

  it('creates through companyApi and shows the link', async () => {
    asHr();
    mocked.createInvite.mockResolvedValue({ invite: { token: 'tok123' } as any, emailed: false });
    open('/en/company/c1/invite');
    fireEvent.change(await screen.findByLabelText(en.company.inviteEmail), { target: { value: 'new@acme.test' } });
    fireEvent.click(screen.getByRole('button', { name: en.company.sendInvite }));
    await screen.findByText(en.company.inviteCreated);
    expect(mocked.createInvite).toHaveBeenCalledWith('c1', 'new@acme.test', 'employee', 'en');
    expect((screen.getByLabelText(en.company.inviteLinkLabel) as HTMLInputElement).value).toContain('/en/join/tok123');
  });

  it.each([
    ['no_access', en.company.inviteNotEmailedNoPlan],
    ['rate_limited', en.company.inviteNotEmailedLimit],
  ] as const)('says why the email did not go out: %s, and still gives the link', async (emailBlock, text) => {
    asHr();
    mocked.createInvite.mockResolvedValue({ invite: { token: 'tok123' } as any, emailed: false, emailBlock });
    open('/en/company/c1/invite');
    fireEvent.change(await screen.findByLabelText(en.company.inviteEmail), { target: { value: 'new@acme.test' } });
    fireEvent.click(screen.getByRole('button', { name: en.company.sendInvite }));
    await screen.findByText(text);
    expect((screen.getByLabelText(en.company.inviteLinkLabel) as HTMLInputElement).value).toContain('/en/join/tok123');
  });

  it('says so when the email really went out', async () => {
    asHr();
    mocked.createInvite.mockResolvedValue({ invite: { token: 'tok123' } as any, emailed: true });
    open('/en/company/c1/invite');
    fireEvent.change(await screen.findByLabelText(en.company.inviteEmail), { target: { value: 'a@borderday.com' } });
    fireEvent.click(screen.getByRole('button', { name: en.company.sendInvite }));
    await screen.findByText(en.company.inviteEmailed);
  });

  it('only owners are offered the owner role', async () => {
    asHr();
    mocked.myMembership.mockResolvedValue({ role: 'hr_viewer', borderPackId: null, annualWorkingDays: null });
    open('/en/company/c1/invite');
    const select = await screen.findByLabelText(en.company.inviteRole);
    expect(select.textContent).not.toContain(en.company.roleOwner);
  });

  it('denies an employee', async () => {
    auth.value.user = EMP;
    mocked.myMembership.mockResolvedValue({ role: 'employee', borderPackId: null, annualWorkingDays: null });
    open('/en/company/c1/invite');
    await screen.findByText(en.company.accessDenied);
    expect(mocked.listInvites).not.toHaveBeenCalled();
  });
});

describe('Join', () => {
  const invite: api.InvitePeek = {
    id: 'i1',
    companyId: 'c1',
    companyName: 'Acme Real SA',
    email: 'EMP@acme.test',
    role: 'employee',
    status: 'pending',
    expiresAt: '2999-01-01T00:00:00Z',
  };

  describe('E13: signed out', () => {
    it('shows who invites them and what HR sees, with sign-in and sign-up that come back here', async () => {
      mocked.getInviteByToken.mockResolvedValue(invite);
      open('/en/join/tok');
      await screen.findByText(/Acme Real SA invites you/);
      screen.getByText(en.company.noticeBody);
      screen.getByText(/This invite is for EMP@acme\.test/);
      const next = encodeURIComponent('/en/join/tok');
      expect(screen.getByRole('link', { name: en.auth.signUp }).getAttribute('href')).toBe(`/en/auth/sign-up?next=${next}`);
      expect(screen.getAllByRole('link', { name: en.auth.signIn }).some((a) => a.getAttribute('href') === `/en/auth/sign-in?next=${next}`)).toBe(true);
      expect(screen.queryByRole('button', { name: en.company.joinButton })).toBeNull();
      expect(mocked.acceptInvite).not.toHaveBeenCalled();
    });

    it('says so when the link is dead, instead of asking for an account first', async () => {
      mocked.getInviteByToken.mockResolvedValue({ ...invite, status: 'revoked' });
      open('/en/join/tok');
      await screen.findByText(en.company.inviteInvalid);
      expect(screen.queryByRole('heading', { name: en.auth.signInTitle })).toBeNull();
    });
  });

  it('blocks a different signed-in email and offers sign-out', async () => {
    auth.value.user = { id: 'x', email: 'someone@else.test' };
    mocked.getInviteByToken.mockResolvedValue(invite);
    open('/en/join/tok');
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('EMP@acme.test');
    expect(alert.textContent).toContain('someone@else.test');
    fireEvent.click(screen.getByRole('button', { name: en.auth.signOut }));
    expect(auth.value.signOut).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: en.company.joinButton })).toBeNull();
  });

  it('rejects expired and accepted invites', async () => {
    auth.value.user = EMP;
    mocked.getInviteByToken.mockResolvedValue({ ...invite, status: 'accepted' });
    open('/en/join/tok');
    await screen.findByText(en.company.inviteInvalid);
  });

  async function fill() {
    fireEvent.change(await screen.findByLabelText(en.company.yourName), { target: { value: 'Emp' } });
    fireEvent.change(screen.getByLabelText(en.company.pickBorder), { target: { value: 'geneva_fr' } });
  }

  it('needs the notice ticked before accepting', async () => {
    auth.value.user = EMP;
    mocked.getInviteByToken.mockResolvedValue(invite);
    open('/en/join/tok');
    await fill();
    fireEvent.click(screen.getByRole('button', { name: en.company.joinButton }));
    await screen.findByText(en.company.noticeRequired);
    expect(mocked.acceptInvite).not.toHaveBeenCalled();
  });

  it('accepts through the RPC, then saves pack and name', async () => {
    auth.value.user = EMP;
    mocked.getInviteByToken.mockResolvedValue(invite);
    mocked.acceptInvite.mockResolvedValue('c1');
    open('/en/join/tok');
    await fill();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: en.company.joinButton }));
    await screen.findByText(en.company.joinSuccess);
    expect(mocked.acceptInvite).toHaveBeenCalledWith('tok', CONSENT_VERSION, 'en');
    expect(mocked.updateMemberSelf).toHaveBeenCalledWith('c1', { borderPackId: 'geneva_fr', annualWorkingDays: null });
    expect(mocked.updateMyDisplayName).toHaveBeenCalledWith('Emp');
  });
});

describe('History', () => {
  it('HR sees dates, day types and counters, and nothing else from the log', async () => {
    asHr();
    mocked.listDayLogs.mockResolvedValue([
      { employeeUserId: 'emp1', workDate: '2026-03-02', dayType: 'telework', note: 'dentist' } as any,
    ]);
    const { container } = open('/en/company/c1/employee/emp1');
    await screen.findByText(new Date('2026-03-02T12:00:00').toLocaleDateString('en-CH', { year: 'numeric', month: 'short', day: 'numeric' }));
    expect(screen.getByRole('cell', { name: en.dayTypes.telework })).toBeTruthy();
    expect(screen.getByText(en.company.countersHeading, { selector: 'h2' })).toBeTruthy();
    expect(container.textContent).not.toContain('dentist');
    expect(mocked.listDayLogs).toHaveBeenCalledWith('c1', 'emp1');
    expect(screen.getByRole('link', { name: `← ${en.company.backDashboard}` })).toBeTruthy();
  });

  it('an employee sees the same page for themselves, with a link back to the app', async () => {
    auth.value.user = EMP;
    mocked.listMembers.mockResolvedValue([empRow]);
    mocked.listDayLogs.mockResolvedValue([{ employeeUserId: 'emp1', workDate: '2026-03-02', dayType: 'onsite' }]);
    open('/en/company/c1/employee/emp1');
    await screen.findByText(new Date('2026-03-02T12:00:00').toLocaleDateString('en-CH', { year: 'numeric', month: 'short', day: 'numeric' }));
    expect(screen.getByText(en.company.countersHeading, { selector: 'h2' })).toBeTruthy();
    expect(screen.getByRole('link', { name: `← ${en.nav.openApp}` })).toBeTruthy();
  });

  it("denies another employee's history", async () => {
    auth.value.user = EMP;
    mocked.listMembers.mockResolvedValue([empRow]);
    mocked.listDayLogs.mockRejectedValue(new Error('day log access denied'));
    open('/en/company/c1/employee/someone-else');
    await screen.findByText(en.company.accessDenied);
  });
});

describe('E2: sign-in with nothing asked for', () => {
  it('a Google or email sign-in from the header heads to the account page, with language and next', async () => {
    const signInGoogle = vi.fn(async () => ({ error: null }));
    (auth.value as any).signInGoogle = signInGoogle;
    open('/fr/auth/sign-in');
    fireEvent.click(await screen.findByRole('button', { name: fr.auth.continueGoogle }));
    await waitFor(() => expect(signInGoogle).toHaveBeenCalledWith({ lang: 'fr', next: '/fr/account' }));
  });

  it('a page that asked for sign-in gets that page back', async () => {
    const signInGoogle = vi.fn(async () => ({ error: null }));
    (auth.value as any).signInGoogle = signInGoogle;
    open('/en/auth/sign-in?next=%2Fen%2Fjoin%2Ftok');
    fireEvent.click(await screen.findByRole('button', { name: en.auth.continueGoogle }));
    await waitFor(() => expect(signInGoogle).toHaveBeenCalledWith({ lang: 'en', next: '/en/join/tok' }));
  });

  it('E14: a sign-up passes language and next to the confirmation email', async () => {
    const signUpEmail = vi.fn(async () => ({ error: null }));
    (auth.value as any).signUpEmail = signUpEmail;
    open('/en/auth/sign-up?next=%2Fen%2Fjoin%2Ftok');
    fireEvent.change(await screen.findByLabelText(en.auth.displayName), { target: { value: 'Ann ' } });
    fireEvent.change(screen.getByLabelText(en.auth.email), { target: { value: 'a@x.test' } });
    fireEvent.change(screen.getByLabelText(en.auth.password), { target: { value: 'password1' } });
    fireEvent.click(screen.getByRole('button', { name: en.auth.createAccount }));
    await waitFor(() => expect(signUpEmail).toHaveBeenCalledWith('a@x.test', 'password1', 'Ann ', { lang: 'en', next: '/en/join/tok' }));
    await screen.findByText(en.auth.checkEmail);
  });
});

describe('Sign-in', () => {
  it('returns a signed-in visitor to the page that sent them, and only to this site', async () => {
    auth.value.user = EMP;
    mocked.getInviteByToken.mockResolvedValue(null);
    open('/en/auth/sign-in?next=%2Fen%2Fjoin%2Ftok');
    await screen.findByText(en.company.inviteInvalid);
    cleanup();
    open('/en/auth/sign-in?next=%2F%2Fevil.example');
    await screen.findByRole('heading', { name: en.account.title });
  });
});

describe('Company sign-up', () => {
  it('links to the labelled demo and never seeds one', async () => {
    const { container } = open('/en/company/signup');
    const link = await screen.findByRole('link', { name: en.company.loadDemo });
    expect(link.getAttribute('href')).toBe('/en/demo');
    expect(container.textContent).not.toMatch(/Backend|local-mock/);
  });
});

describe('E6: company signup', () => {
  it('says the route is chosen per employee', async () => {
    open('/en/company/signup');
    await screen.findByText(en.company.signupRouteNote);
  });
});

describe('/app gate', () => {
  const company = {
    id: 'c1',
    name: 'Acme Real SA',
    role: 'employee' as const,
    subscription_status: 'active',
    trial_ends_at: null,
    seat_count: 1,
    borderPackId: 'geneva_fr' as const,
    annualWorkingDays: 220,
  };

  it('signed out: labelled preview with pricing CTA and no account claim', async () => {
    const { container } = open('/en/app');
    await screen.findByText(en.app.previewBody, { exact: false });
    expect(screen.getByRole('link', { name: en.app.previewCta }).getAttribute('href')).toBe('/en/pricing');
    expect(screen.getAllByText(en.app.previewBadge).length).toBeGreaterThan(0);
    expect(container.textContent).not.toContain(en.app.savedToAccount);
    expect(mocked.resolveAppAccess).not.toHaveBeenCalled();
  });

  it('preview can log the current month but not another one', async () => {
    open('/en/app');
    const telework = (await screen.findByText(en.dayTypes.telework)).closest('button')!;
    expect(telework.disabled).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: en.app.prevMonth }));
    fireEvent.click(screen.getByRole('button', { name: /\b15\b/ }));
    await screen.findByText(en.app.previewMonthOnly);
    expect((screen.getByText(en.dayTypes.telework).closest('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('signed in without a plan: preview, and a member of an unpaid company is told why', async () => {
    auth.value.user = EMP;
    mocked.resolveAppAccess.mockResolvedValue({ mode: 'preview', unpaidCompany: 'Acme Real SA' });
    open('/en/app');
    await screen.findByText(/Acme Real SA has no active subscription/);
  });

  it('fails closed to preview when access cannot be checked', async () => {
    auth.value.user = EMP;
    mocked.resolveAppAccess.mockRejectedValue(new Error('network'));
    open('/en/app');
    await screen.findByText(en.app.previewBody, { exact: false });
    await screen.findByText(en.company.loadError);
  });

  describe('E5, E17, E18, E19, E20: logging a day', () => {
    const paid = () => {
      auth.value.user = EMP;
      mocked.resolveAppAccess.mockResolvedValue({ mode: 'company', company });
    };
    const iso = (day: number) => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };
    const otherDay = () => (new Date().getDate() === 15 ? 14 : 15);
    const cell = (day: number) =>
      screen.getByRole('button', { name: new RegExp(`\\b${day}\\b.*\\d{4}: `) });
    const log = (workDate: string, dayType: string, dayShare: 0.5 | 1 = 1) =>
      ({ employeeUserId: EMP.id, workDate, dayType, overnightAway: false, dayShare }) as any;

    it('E20: while loading, a placeholder rather than a bare line', async () => {
      auth.value.user = EMP;
      mocked.resolveAppAccess.mockReturnValue(new Promise(() => {}));
      const { container } = open('/en/app');
      expect(screen.getByRole('status').textContent).toBe(en.app.loading);
      expect(container.querySelectorAll('.skeleton-card').length).toBeGreaterThan(0);
    });

    it('E17: "Today" names only today; another day shows its own date', async () => {
      paid();
      const { container } = open('/en/app');
      await screen.findByText(en.app.calendar);
      const headingOf = () => [...container.querySelectorAll('strong')].find((el) => /\d{4}/.test(el.textContent ?? ''))!.textContent!;
      expect(headingOf().startsWith(`${en.app.today}: `)).toBe(true);
      fireEvent.click(cell(otherDay()));
      expect(headingOf()).not.toContain(en.app.today);
      expect(headingOf()).toContain(String(otherDay()));
    });

    it('E5: the box shows before a type is picked, is kept per date, and is used when the type is picked', async () => {
      paid();
      open('/en/app');
      await screen.findByText(en.app.calendar);
      const box = () => screen.getByRole('checkbox', { name: new RegExp(en.dayTypes.halfDay) }) as HTMLInputElement;
      expect(box().checked).toBe(false);
      fireEvent.click(cell(otherDay()));
      fireEvent.click(box());
      expect(box().checked).toBe(true);
      screen.getByText(en.dayTypes.halfDayPending);
      const first = otherDay() === 15 ? 14 : 15;
      fireEvent.click(cell(first));
      expect(box().checked).toBe(false);
      fireEvent.click(cell(otherDay()));
      expect(box().checked).toBe(true);
      fireEvent.click(screen.getByText(en.dayTypes.telework).closest('button')!);
      await waitFor(() =>
        expect(mocked.upsertDayLog).toHaveBeenCalledWith(
          expect.objectContaining({ workDate: iso(otherDay()), dayType: 'telework', dayShare: 0.5 }),
        ),
      );
    });

    it('E5: a logged half day keeps its value on return, and a non-working day cannot be half', async () => {
      paid();
      mocked.listDayLogs.mockResolvedValue([log(iso(10), 'telework', 0.5), log(iso(11), 'non_working'), log(iso(12), 'onsite')]);
      open('/en/app');
      await screen.findByRole('button', { name: new RegExp(`: ${en.dayTypes.telework}, ${en.dayTypes.halfDay}$`) });
      const box = () => screen.getByRole('checkbox', { name: new RegExp(en.dayTypes.halfDay) }) as HTMLInputElement;
      fireEvent.click(cell(12));
      expect(box().checked).toBe(false);
      fireEvent.click(cell(10));
      expect(box().checked).toBe(true);
      fireEvent.click(cell(11));
      expect(box().disabled).toBe(true);
      screen.getByText(en.dayTypes.halfDayNotApplicable);
    });

    it('E18: a half day is marked on the calendar by class, mark and label', async () => {
      paid();
      mocked.listDayLogs.mockResolvedValue([log(iso(10), 'telework', 0.5), log(iso(12), 'telework')]);
      open('/en/app');
      const half = await screen.findByRole('button', { name: new RegExp(`: ${en.dayTypes.telework}, ${en.dayTypes.halfDay}$`) });
      expect(half.className).toContain('half');
      expect(half.textContent).toContain('½');
      const whole = screen.getByRole('button', { name: new RegExp(`\\b12\\b.*: ${en.dayTypes.telework}$`) });
      expect(whole.className).not.toContain('half');
      expect(whole.textContent).not.toContain('½');
    });

    it('E15: a note saves with its day, stays when the type changes, and needs a day type first', async () => {
      paid();
      mocked.listDayLogs.mockResolvedValue([log(iso(10), 'telework')]);
      mocked.listMyDayNotes.mockResolvedValue(new Map([[iso(10), 'saved note']]));
      open('/en/app');
      await screen.findByRole('button', { name: new RegExp(`\\b10\\b.*: ${en.dayTypes.telework}$`) });
      const area = () => screen.getByRole('textbox', { name: new RegExp(en.app.noteLabel) }) as HTMLTextAreaElement;
      fireEvent.click(cell(new Date().getDate() === 12 ? 13 : 12));
      expect(area().disabled).toBe(true);
      screen.getByText(en.app.noteNeedsType);
      fireEvent.click(cell(10));
      expect(area().value).toBe('saved note');
      fireEvent.click(screen.getByText(en.dayTypes.onsite).closest('button')!);
      await waitFor(() =>
        expect(mocked.upsertDayLog).toHaveBeenCalledWith(expect.objectContaining({ workDate: iso(10), dayType: 'onsite', note: 'saved note' })),
      );
      mocked.upsertDayLog.mockClear();
      await waitFor(() => expect(area().disabled).toBe(false));
      fireEvent.change(area(), { target: { value: '  changed  ' } });
      fireEvent.blur(area());
      await waitFor(() =>
        expect(mocked.upsertDayLog).toHaveBeenCalledWith(expect.objectContaining({ workDate: iso(10), note: 'changed' })),
      );
    });

    it('E19: picking days a week fills in the yearly figure and saves it', async () => {
      paid();
      open('/en/app');
      const select = (await screen.findByRole('combobox', { name: new RegExp(en.app.daysPerWeek) })) as HTMLSelectElement;
      fireEvent.change(select, { target: { value: '4' } });
      await waitFor(() =>
        expect(mocked.updateMemberSelf).toHaveBeenCalledWith(company.id, expect.objectContaining({ annualWorkingDays: 192 })),
      );
      expect(select.value).toBe('4');
    });
  });

  it('paid company member logs to the company through companyApi', async () => {
    auth.value.user = EMP;
    mocked.resolveAppAccess.mockResolvedValue({ mode: 'company', company });
    const { container } = open('/en/app');
    fireEvent.click((await screen.findByText(en.dayTypes.telework)).closest('button')!);
    await waitFor(() => expect(mocked.upsertDayLog).toHaveBeenCalled());
    expect(mocked.upsertDayLog.mock.calls[0][0]).toMatchObject({ companyId: 'c1', dayType: 'telework' });
    expect(mocked.listDayLogs).toHaveBeenCalledWith('c1', 'emp1');
    expect(container.textContent).not.toContain(en.app.previewBadge);
    expect((screen.getByRole('combobox', { name: /Your border/ }) as HTMLSelectElement).value).toBe('geneva_fr');
    expect(screen.getByRole('link', { name: en.company.viewMyHistory }).getAttribute('href')).toBe(
      '/en/company/c1/employee/emp1',
    );
  });

  it('paid company member changes their pack through the self-update RPC', async () => {
    auth.value.user = EMP;
    mocked.resolveAppAccess.mockResolvedValue({ mode: 'company', company });
    open('/en/app');
    const select = await screen.findByRole('combobox', { name: /Your border/ });
    await waitFor(() => expect((select as HTMLSelectElement).value).toBe('geneva_fr'));
    fireEvent.change(select, { target: { value: 'basel_fr' } });
    await waitFor(() =>
      expect(mocked.updateMemberSelf).toHaveBeenCalledWith('c1', { borderPackId: 'basel_fr', annualWorkingDays: 220 }),
    );
  });

  it('individual subscriber logs to their account', async () => {
    auth.value.user = EMP;
    mocked.resolveAppAccess.mockResolvedValue({ mode: 'individual' });
    const { container } = open('/en/app');
    fireEvent.click((await screen.findByText(en.dayTypes.onsite)).closest('button')!);
    await waitFor(() => expect(mocked.upsertPersonalDayLog).toHaveBeenCalled());
    expect(mocked.upsertDayLog).not.toHaveBeenCalled();
    expect(container.textContent).toContain(en.app.savedToAccount);
    expect(container.textContent).not.toContain(en.app.previewBadge);
  });

  it('shows a save error instead of pretending the day was logged', async () => {
    auth.value.user = EMP;
    mocked.resolveAppAccess.mockResolvedValue({ mode: 'individual' });
    mocked.upsertPersonalDayLog.mockRejectedValue(new Error('rls'));
    open('/en/app');
    fireEvent.click((await screen.findByText(en.dayTypes.onsite)).closest('button')!);
    await screen.findByText(en.app.saveError);
  });
});

describe('Home coverage chips', () => {
  it('says plainly which corridors have tax counters', async () => {
    const { container } = open('/en');
    await screen.findByRole('heading', { name: en.home.bordersTitle });
    const chips = [...container.querySelectorAll('.border-chip')].map((c) => c.textContent ?? '');
    expect(chips).toHaveLength(9);
    const withTax = chips.filter((c) => c.includes(en.home.chipTaxYes));
    expect(withTax).toHaveLength(7);
    expect(chips.filter((c) => c.includes(en.home.chipTaxNo))).toHaveLength(1);
    expect(chips.filter((c) => c.includes(en.home.chipTaxNoDayLimit))).toHaveLength(1);
    expect(chips.every((c) => c.includes(en.home.chipSsYes))).toBe(true);
    expect(chips.find((c) => c.includes(en.borders.basel_fr))).toContain(en.home.chipTaxYes);
    expect(chips.find((c) => c.includes(en.borders.luxembourg_fr))).toContain(en.home.chipTaxYes);
    expect(chips.find((c) => c.includes(en.borders.belgium_fr))).toContain(en.home.chipTaxNoDayLimit);
    expect(chips.find((c) => c.includes(en.borders.belgium_nl))).toContain(en.home.chipTaxNo);
  });
});

describe('FAQ and disclaimer', () => {
  it('FAQ states what is out of scope', async () => {
    open('/en/faq');
    await screen.findByRole('heading', { name: en.faq.q8 });
    expect(screen.getByText(en.faq.a8)).toBeTruthy();
  });
  it('disclaimer states it too', async () => {
    open('/en/disclaimer');
    await screen.findByRole('heading', { name: en.faq.q8 });
  });
});
