// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildInviteEmail, inviteLang, joinUrlFor } from '../supabase/functions/_shared/inviteEmail';
import { getDict, LANGS, t } from '../src/i18n';
import { accountExportCsv, collectAccountExport, type AccountExport } from '../src/lib/accountExport';
import { rowsToCsv } from '../src/company/dashboardMath';

const auth = vi.hoisted(() => ({
  value: { ready: true, configured: true, user: null as null | { id: string; email: string }, signOut: vi.fn() },
}));
vi.mock('../src/lib/auth', () => ({ useAuth: () => auth.value, AuthProvider: ({ children }: any) => children }));
vi.mock('../src/lib/supabaseMock', () => {
  throw new Error('production route loaded supabaseMock');
});
vi.mock('../src/lib/companyApi', async (original) => {
  const actual = await original<typeof import('../src/lib/companyApi')>();
  return {
    isHrRole: actual.isHrRole,
    isInviteOpen: actual.isInviteOpen,
    sameEmail: actual.sameEmail,
    pickAppAccess: actual.pickAppAccess,
    listMyCompanies: vi.fn(async () => []),
    hasIndividualAccess: vi.fn(async () => false),
    hasCancellableIndividualPlan: vi.fn(async () => false),
    listPersonalDayLogs: vi.fn(async () => []),
    listDayLogs: vi.fn(async () => []),
    resolveAppAccess: vi.fn(async () => ({ mode: 'preview', unpaidCompany: null })),
  };
});
vi.mock('../src/lib/billing', async (original) => ({
  ...(await original<typeof import('../src/lib/billing')>()),
  openCustomerPortal: vi.fn(),
}));

import App from '../src/App';
import * as api from '../src/lib/companyApi';
import { openCustomerPortal, planIsCancellable } from '../src/lib/billing';

const mocked = vi.mocked(api);
const portal = vi.mocked(openCustomerPortal);
const en = getDict('en');
const company = (over: object) =>
  ({ id: 'c1', name: 'Acme SA', role: 'owner', borderPackId: 'geneva_fr', annualWorkingDays: 220, profile: {}, subscription_status: 'active', ...over }) as any;

function open(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  auth.value.user = null;
  mocked.listMyCompanies.mockResolvedValue([]);
  mocked.hasIndividualAccess.mockResolvedValue(false);
  mocked.hasCancellableIndividualPlan.mockResolvedValue(false);
});
afterEach(cleanup);

describe('H11 permanent cancellation route', () => {
  it('uses the mandated labels', () => {
    expect(en.nav.cancel).toBe('Cancel subscription');
    expect(getDict('de').nav.cancel).toBe('Verträge hier kündigen');
    expect(getDict('fr').nav.cancel).toBe('Résilier votre contrat');
    expect(getDict('it').nav.cancel).toBe('Disdire il contratto');
  });

  it.each(LANGS)('%s: is in the footer of every page', async (lang) => {
    open(`/${lang}/faq`);
    const d = getDict(lang);
    const footer = document.querySelector('footer')!;
    expect(within(footer).getByRole('link', { name: d.nav.cancel }).getAttribute('href')).toBe(`/${lang}/cancel`);
    expect(within(footer).getByRole('link', { name: d.nav.withdraw }).getAttribute('href')).toBe(`/${lang}/withdrawal`);
  });

  it('owner and HR open the portal for their company in their language', async () => {
    auth.value.user = { id: 'u1', email: 'hr@acme.test' };
    mocked.listMyCompanies.mockResolvedValue([company({})]);
    portal.mockResolvedValue({ ok: false, reason: 'not_available', message: 'x' });
    open('/de/cancel');
    const d = getDict('de');
    fireEvent.click(await screen.findByRole('button', { name: 'Abo von Acme SA kündigen' }));
    await screen.findByText(d.cancel.portalError);
    expect(portal).toHaveBeenCalledWith('c1', 'de');
  });

  it('employees get no company button, and an individual plan gets its own', async () => {
    auth.value.user = { id: 'u1', email: 'e@acme.test' };
    mocked.listMyCompanies.mockResolvedValue([company({ role: 'employee' })]);
    mocked.hasCancellableIndividualPlan.mockResolvedValue(true);
    portal.mockResolvedValue({ ok: false, reason: 'not_available', message: 'x' });
    open('/en/cancel');
    fireEvent.click(await screen.findByRole('button', { name: en.cancel.individualButton }));
    await waitFor(() => expect(portal).toHaveBeenCalledWith(undefined, 'en'));
    expect(screen.queryByRole('button', { name: /Acme SA/ })).toBeNull();
  });

  it('A3-17: no period-end note when there is nothing to cancel', async () => {
    auth.value.user = { id: 'u1', email: 'hr@acme.test' };
    mocked.listMyCompanies.mockResolvedValue([company({ id: 'c1', name: 'Gone SA', subscription_status: 'canceled' })]);
    mocked.hasCancellableIndividualPlan.mockResolvedValue(false);
    open('/en/cancel');
    await screen.findByText(en.cancel.noPlans);
    expect(screen.queryByText(en.cancel.portalPeriodEnd)).toBeNull();
  });

  it('A3-17: with a plan to cancel, says it ends at period end through the portal', async () => {
    auth.value.user = { id: 'u1', email: 'hr@acme.test' };
    mocked.listMyCompanies.mockResolvedValue([company({ id: 'c1', name: 'Acme SA', subscription_status: 'active' })]);
    open('/en/cancel');
    await screen.findByRole('button', { name: t(en.cancel.companyButton, { company: 'Acme SA' }) });
    expect(screen.getByText(en.cancel.portalPeriodEnd)).toBeTruthy();
    for (const lang of ['en', 'fr', 'de', 'it', 'nl'] as const) {
      expect(getDict(lang).cancel.portalPeriodEnd).toContain('Stripe Customer Portal');
    }
  });

  it('A3-08: a past_due company keeps its cancel button; a cancelled or planless one has none', async () => {
    auth.value.user = { id: 'u1', email: 'hr@acme.test' };
    mocked.listMyCompanies.mockResolvedValue([
      company({ id: 'c1', name: 'Late SA', subscription_status: 'past_due' }),
      company({ id: 'c2', name: 'Gone SA', subscription_status: 'canceled' }),
      company({ id: 'c3', name: 'Free SA', subscription_status: 'none' }),
    ]);
    open('/en/cancel');
    await screen.findByRole('button', { name: t(en.cancel.companyButton, { company: 'Late SA' }) });
    expect(screen.queryByRole('button', { name: /Gone SA/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Free SA/ })).toBeNull();
  });

  it('A3-08: planIsCancellable covers every recorded status except cancelled and none', () => {
    for (const status of ['trialing', 'active', 'past_due', 'incomplete']) expect(planIsCancellable(status)).toBe(true);
    for (const status of ['canceled', 'none', '', null, undefined]) expect(planIsCancellable(status)).toBe(false);
  });

  it('works without signing in: Link instructions, a confirm step, and email if it cannot be recorded', async () => {
    open('/en/cancel');
    await screen.findByText(en.cancel.linkBody);
    screen.getByRole('link', { name: en.cancel.signIn });
    fireEvent.change(screen.getByLabelText(en.mailForm.name), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(en.mailForm.email), { target: { value: 'ana@example.test' } });
    fireEvent.click(screen.getByRole('button', { name: en.cancel.submit }));
    fireEvent.click(screen.getByRole('button', { name: en.cancel.confirm }));
    const link = await screen.findByRole('link', { name: en.mailForm.send });
    const href = link.getAttribute('href')!;
    expect(href.startsWith('mailto:hello@borderday.com?')).toBe(true);
    expect(new URLSearchParams(href.split('?')[1]).get('body')).toContain('ana@example.test');
  });
});

describe('H4 Account page', () => {
  it('needs sign-in', async () => {
    open('/en/account');
    await screen.findByRole('heading', { name: en.auth.signInTitle });
  });

  it('separates server export from device export and offers cancel', async () => {
    auth.value.user = { id: 'u1', email: 'me@example.test' };
    open('/en/account');
    await screen.findByRole('heading', { name: en.account.exportTitle });
    screen.getByRole('heading', { name: en.account.deviceTitle });
    screen.getByRole('heading', { name: en.nav.cancel });
    expect(en.account.deviceBody).toMatch(/not on our servers/);
    expect(screen.getAllByRole('button', { name: en.app.exportJson })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: en.app.exportCsv })).toHaveLength(2);
  });

  it('asks for confirmation before the deletion email can open, and fills in the account', async () => {
    auth.value.user = { id: 'u1', email: 'me@example.test' };
    open('/en/account');
    await screen.findByRole('heading', { name: en.account.deleteTitle });
    expect(screen.queryByRole('link', { name: en.account.deleteSend })).toBeNull();
    fireEvent.click(screen.getByRole('checkbox', { name: en.account.deleteConfirm }));
    const href = screen.getByRole('link', { name: en.account.deleteSend }).getAttribute('href')!;
    expect(href.startsWith('mailto:privacy@borderday.com?')).toBe(true);
    const body = new URLSearchParams(href.split('?')[1]).get('body')!;
    expect(body).toContain('me@example.test');
    expect(body).toContain('u1');
  });

  it('shows an error when the server export fails', async () => {
    auth.value.user = { id: 'u1', email: 'me@example.test' };
    mocked.listPersonalDayLogs.mockRejectedValue(new Error('rls'));
    open('/en/account');
    await screen.findByRole('heading', { name: en.account.exportTitle });
    fireEvent.click(screen.getAllByRole('button', { name: en.app.exportJson })[0]);
    expect((await screen.findByRole('alert')).textContent).toBe(en.account.exportError);
  });

  it('exports the caller’s own logs from every company, and only asks for those', async () => {
    mocked.listPersonalDayLogs.mockResolvedValue([{ date: '2026-01-02', type: 'telework', borderPackId: null, overnightAway: false }]);
    mocked.listMyCompanies.mockResolvedValue([company({ profile: { employmentPercent: 80, a1InPlace: true, a1ValidUntil: '2027-01-01' } })]);
    mocked.listDayLogs.mockResolvedValue([{ employeeUserId: 'u1', workDate: '2026-02-03', dayType: 'onsite', overnightAway: true }]);
    const data = await collectAccountExport({ id: 'u1', email: 'me@example.test' });
    expect(mocked.listDayLogs).toHaveBeenCalledWith('c1', 'u1');
    expect(data.individualPlan.days).toHaveLength(1);
    expect(data.companies[0]).toMatchObject({ company: 'Acme SA', employmentPercent: 80, a1InPlace: true });
    expect(data.companies[0].days[0]).toEqual({ date: '2026-02-03', type: 'onsite', overnightAway: true });
    const csv = accountExportCsv(data);
    expect(csv).toContain('"individual plan",2026-01-02,telework,no');
    expect(csv).toContain('"Acme SA",2026-02-03,onsite,yes');
  });

  it('defuses spreadsheet formulas in company names', () => {
    const data: AccountExport = {
      version: 1,
      exportedAt: 'x',
      account: { email: null },
      individualPlan: { days: [] },
      companies: [
        {
          company: '=HYPERLINK("x")',
          role: 'employee',
          borderPackId: null,
          annualWorkingDays: null,
          employmentPercent: null,
          a1InPlace: false,
          a1ValidUntil: null,
          days: [{ date: '2026-01-01', type: 'onsite', overnightAway: false }],
        },
      ],
    };
    expect(accountExportCsv(data)).toContain(`"'=HYPERLINK(""x"")"`);
  });
});

describe('M8 accessibility', () => {
  it('names the calendar cells with the full date and day type, and the month buttons', async () => {
    open('/en/app');
    await screen.findByRole('button', { name: en.app.prevMonth });
    screen.getByRole('button', { name: en.app.nextMonth });
    expect(screen.queryByRole('button', { name: '‹' })).toBeNull();
    const now = new Date();
    const expected = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-CH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    screen.getByRole('button', { name: `${expected}: ${en.app.notLogged}` });
    expect(document.querySelector('[aria-current="date"]')).not.toBeNull();
  });

  it('day-type buttons expose pressed state', async () => {
    open('/en/app');
    const button = await screen.findByRole('button', { name: new RegExp(en.dayTypes.telework) });
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('has a skip link, a labelled landmark and a working mobile menu', async () => {
    open('/en/faq');
    expect(screen.getByRole('link', { name: en.nav.skipToContent }).getAttribute('href')).toBe('#main');
    expect(document.querySelector('main')!.id).toBe('main');
    const toggle = screen.getByRole('button', { name: en.nav.menu });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe('main-nav');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const nav = document.getElementById('main-nav')!;
    expect(nav.className).toContain('open');
    for (const name of [en.nav.pricing, en.nav.faq, en.nav.joinWaitlist, en.nav.forCompanies]) {
      within(nav).getByRole('link', { name });
    }
    fireEvent.click(within(nav).getByRole('link', { name: en.nav.pricing }));
    await waitFor(() => expect(toggle.getAttribute('aria-expanded')).toBe('false'));
  });

  it('every language has the accessibility labels', () => {
    for (const lang of LANGS) {
      const d = getDict(lang);
      for (const s of [d.nav.menu, d.nav.skipToContent, d.app.prevMonth, d.app.nextMonth, d.app.notLogged]) {
        expect(s.length).toBeGreaterThan(2);
      }
      expect(d.app.calendarDay).toContain('{date}');
    }
  });
});

describe('M4 employer-facing wording', () => {
  it('relabels the OK status and the CSV export in each language', () => {
    expect(en.counters.status_ok).toBe('Below tracked limit');
    for (const lang of LANGS) {
      const d = getDict(lang);
      expect(d.company.exportCsv).not.toMatch(/audit/i);
      expect(d.pricing.companyInclude2).not.toMatch(/audit/i);
      expect(d.home.risk3Body).not.toMatch(/audit/i);
      expect(d.counters.status_ok).not.toMatch(/Within limit|Innerhalb der Grenze|Entro la soglia|Sous le seuil/);
      expect(d.company.hrDisclaimer).toMatch(/A1/);
    }
  });

  it('the dashboard file name no longer says audit', () => {
    const src = readFileSync(resolve(__dirname, '../src/components/company/DashboardView.tsx'), 'utf8');
    expect(src).toContain('borderday-export-${year}.csv');
    expect(src).not.toMatch(/borderday-audit/);
    expect(typeof rowsToCsv).toBe('function');
  });
});

describe('M10 / H10 invitation email', () => {
  const siteUrl = 'https://borderday.com';

  it('falls back to English on anything unknown', () => {
    expect(inviteLang('de')).toBe('de');
    expect(inviteLang('xx')).toBe('en');
    expect(inviteLang(undefined)).toBe('en');
    expect(inviteLang('../evil')).toBe('en');
  });

  it('builds the join URL in the recipient language', () => {
    expect(joinUrlFor(siteUrl, 'it', 'tok')).toBe('https://borderday.com/it/join/tok');
  });

  it.each(['en', 'fr', 'de', 'it'] as const)('%s: localised, with notice and privacy link, no controller name', (lang) => {
    const mail = buildInviteEmail({ lang, companyName: 'Acme <b>', joinUrl: joinUrlFor(siteUrl, lang, 't'), siteUrl });
    expect(mail.subject).toContain('Acme <b>');
    expect(mail.html).toContain('Acme &lt;b&gt;');
    expect(mail.html).not.toContain('Acme <b>');
    expect(mail.html).toContain(`href="https://borderday.com/${lang}/join/t"`);
    expect(mail.html).toContain(`href="https://borderday.com/${lang}/privacy/"`);
    expect(mail.text).toContain(`https://borderday.com/${lang}/privacy/`);
    expect(mail.html + mail.text + mail.subject).not.toMatch(/PrimeLogic|CHE-312|Cours des Bastions/);
    expect(mail.html).toMatch(/GPS/);
  });

  it('really differs by language', () => {
    const subject = (lang: 'en' | 'fr' | 'de' | 'it') =>
      buildInviteEmail({ lang, companyName: 'X', joinUrl: 'u', siteUrl }).subject;
    expect(new Set([subject('en'), subject('fr'), subject('de'), subject('it')]).size).toBe(4);
  });

  it('the function passes the requested language and keeps the send gates', () => {
    const src = readFileSync(resolve(__dirname, '../supabase/functions/bd-send-invite/index.ts'), 'utf8');
    expect(src).toContain('inviteLang(body.lang)');
    expect(src).not.toContain('/en/join/');
    expect(src).toContain('if (!allowReal)');
    expect(src).toContain('RESEND_LIVE');
    expect(src).toContain('isInviteTestAddress');
  });

  it('the portal returns to the account page in the caller’s language', () => {
    const src = readFileSync(resolve(__dirname, '../supabase/functions/bd-customer-portal/index.ts'), 'utf8');
    expect(src).toContain('return_url: `${siteUrl}/${lang}/account/`');
    expect(src).not.toContain('/en/pricing');
  });

  it('the invite form sends the chosen language and links in it', async () => {
    const invitePage = readFileSync(resolve(__dirname, '../src/pages/company/Invite.tsx'), 'utf8');
    expect(invitePage).toContain('api.createInvite(companyId, email, role, inviteLang)');
    expect(invitePage).toContain('/${inviteLang}/join/${invite.token}');
  });
});
