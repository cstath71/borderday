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
    createCompany: vi.fn(),
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
    upsertDayLog: vi.fn(),
    deleteMyDayLogs: vi.fn(),
    hasIndividualAccess: vi.fn(async () => false),
    listPersonalDayLogs: vi.fn(async () => []),
    upsertPersonalDayLog: vi.fn(),
    deleteMyPersonalDayLogs: vi.fn(),
    resolveAppAccess: vi.fn(),
  };
});

import App from '../src/App';
import en from '../src/i18n/en';
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
      a1InPlace: true,
      a1ValidUntil: null,
    });
    await waitFor(() => expect(mocked.listMembers.mock.calls.length).toBeGreaterThan(calls));
  });

  it('says so when saving the profile is refused', async () => {
    asHr();
    mocked.updateEmployeeProfile.mockRejectedValueOnce(new Error('profile update denied'));
    open('/en/company/c1/dashboard');
    await screen.findByText('Real Employee');
    fireEvent.click(screen.getByRole('button', { name: en.company.saveProfile }));
    expect((await screen.findByRole('alert')).textContent).toBe(en.app.saveError);
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
  it('creates through companyApi and shows the link', async () => {
    asHr();
    mocked.createInvite.mockResolvedValue({ invite: { token: 'tok123' } as any, emailed: false });
    open('/en/company/c1/invite');
    fireEvent.change(await screen.findByLabelText(en.company.inviteEmail), { target: { value: 'new@acme.test' } });
    fireEvent.click(screen.getByRole('button', { name: en.company.sendInvite }));
    await screen.findByText(en.company.inviteCreated);
    expect(mocked.createInvite).toHaveBeenCalledWith('c1', 'new@acme.test', 'employee');
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

  it('requires sign-in', async () => {
    open('/en/join/tok');
    await screen.findByRole('heading', { name: en.auth.signInTitle });
    expect(mocked.acceptInvite).not.toHaveBeenCalled();
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
    await screen.findByText('2026-03-02');
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
    await screen.findByText('2026-03-02');
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

describe('Sign-in', () => {
  it('returns a signed-in visitor to the page that sent them, and only to this site', async () => {
    auth.value.user = EMP;
    mocked.getInviteByToken.mockResolvedValue(null);
    open('/en/auth/sign-in?next=%2Fen%2Fjoin%2Ftok');
    await screen.findByText(en.company.inviteInvalid);
    cleanup();
    open('/en/auth/sign-in?next=%2F%2Fevil.example');
    await screen.findByRole('heading', { name: en.company.signupTitle });
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
    fireEvent.click(screen.getByRole('button', { name: '‹' }));
    fireEvent.click(screen.getByRole('button', { name: '15' }));
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
    expect(withTax).toHaveLength(4);
    expect(chips.filter((c) => c.includes(en.home.chipTaxNo))).toHaveLength(5);
    expect(chips.every((c) => c.includes(en.home.chipSsYes))).toBe(true);
    expect(chips.find((c) => c.includes(en.borders.basel_fr))).toContain(en.home.chipTaxNo);
    expect(chips.find((c) => c.includes(en.borders.luxembourg_fr))).toContain(en.home.chipTaxYes);
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
