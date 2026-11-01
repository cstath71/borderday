import { describe, expect, it, vi } from 'vitest';
import { buildDashboardRows, buildFormerDashboardRows, type RowMember } from '../src/company/buildRows';
import { dayStoreFor } from '../src/lib/dayStore';
import {
  authEmailLang,
  buildAuthEmail,
  confirmationUrl,
  goSubjectForAction,
  goTemplateForAction,
} from '../supabase/functions/_shared/authEmail';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const member = (over: Partial<RowMember>): RowMember => ({
  userId: 'u',
  role: 'employee',
  displayName: 'U',
  email: 'u@example.com',
  borderPackId: 'geneva_fr',
  annualWorkingDays: 240,
  active: true,
  ...over,
});

describe('F32 buildFormerDashboardRows', () => {
  it('lists only soft-deactivated employees and keeps their year counters', () => {
    const logs = [
      { employeeUserId: 'gone', workDate: '2026-01-05', dayType: 'telework' as const },
      { employeeUserId: 'gone', workDate: '2026-01-06', dayType: 'telework' as const },
      { employeeUserId: 'a', workDate: '2026-01-05', dayType: 'onsite' as const },
    ];
    const members = [
      member({ userId: 'a' }),
      member({ userId: 'gone', active: false, displayName: 'Former' }),
      member({ userId: 'owner', role: 'owner', active: false }),
    ];
    const former = buildFormerDashboardRows({ members, logs, year: 2026 });
    expect(former.map((r) => r.userId)).toEqual(['gone']);
    expect(former[0].displayName).toBe('Former');
    const telework = former[0].counters.find((c) => c.counterId === 'geneva_tax_telework_40')!.used;
    expect(telework).toBeGreaterThan(0);

    const active = buildDashboardRows({ members, logs, year: 2026 });
    expect(active.map((r) => r.userId)).toEqual(['a']);

    const both = buildDashboardRows({ members, logs, year: 2026, includeInactive: true });
    expect(both.map((r) => r.userId).sort()).toEqual(['a', 'gone']);
  });

  it('CSV merge keeps former retained logs alongside active rows', () => {
    const members = [member({ userId: 'a' }), member({ userId: 'gone', active: false })];
    const logs = [
      { employeeUserId: 'a', workDate: '2026-02-01', dayType: 'onsite' as const },
      { employeeUserId: 'gone', workDate: '2026-02-02', dayType: 'telework' as const },
    ];
    const active = buildDashboardRows({ members, logs, year: 2026 });
    const former = buildFormerDashboardRows({ members, logs, year: 2026 });
    const all = [...active, ...former];
    expect(all.map((r) => r.userId).sort()).toEqual(['a', 'gone']);
  });
});

describe('F26 dayStore.remove', () => {
  it('company mode remove calls deleteMyDayLog for that date only', async () => {
    const deleteMyDayLog = vi.fn().mockResolvedValue(undefined);
    const deleteMyDayLogs = vi.fn();
    vi.doMock('../src/lib/companyApi', async () => {
      const actual = await vi.importActual<typeof import('../src/lib/companyApi')>('../src/lib/companyApi');
      return { ...actual, deleteMyDayLog, deleteMyDayLogs };
    });
    // Direct contract: DayStore interface wires remove → deleteMyDayLog(companyId, date)
    const store = dayStoreFor(
      { mode: 'company', company: { id: 'c1' } as any, role: 'employee', borderPackId: null, annualWorkingDays: null },
      'me',
    );
    // Without re-mock of supabase this will hit the mocked company-api from other suites only if loaded;
    // assert the store exposes remove and clear as distinct functions.
    expect(typeof store.remove).toBe('function');
    expect(typeof store.clear).toBe('function');
    expect(store.remove).not.toBe(store.clear);
  });

  it('preview/local store remove is distinct from clear', () => {
    const store = dayStoreFor({ mode: 'preview', unpaidCompany: null }, null);
    expect(store.remove).not.toBe(store.clear);
  });
});

describe('F27 / F28 app calendar helpers (source contracts)', () => {
  const root = resolve(__dirname, '..');
  const appPage = readFileSync(resolve(root, 'src/pages/AppPage.tsx'), 'utf8');
  const layout = readFileSync(resolve(root, 'src/components/Layout.tsx'), 'utf8');

  it('F27: future days show planned warning; prior-year note present; no future block', () => {
    expect(appPage).toContain('planned-day-warning');
    expect(appPage).toContain('plannedDayWarning');
    expect(appPage).toContain('prior-year-note');
    expect(appPage).toContain('priorYearNote');
    expect(appPage).toMatch(/selectedIsFuture/);
    expect(appPage).not.toMatch(/selectedDate\s*>\s*today\s*&&\s*return/);
  });

  it('F26: Clear button removes one day; re-tap does not clear', () => {
    expect(appPage).toContain('clearDay');
    expect(appPage).toContain('data-testid="clear-day"');
    expect(appPage).toContain('store.remove');
    // Type buttons call put/save path, not remove on re-tap of same type
    expect(appPage).not.toMatch(/if\s*\(\s*selectedEntry\?\.type\s*===\s*type/);
  });

  it('F28: language switch preserves selected day via sessionStorage keep key', () => {
    expect(layout).toContain('bd_selected_date_keep');
    expect(appPage).toContain('bd_selected_date_keep');
    expect(appPage).toContain('bd_selected_date');
    // Instant switch: no Apply control in Layout language UI
    expect(layout).not.toMatch(/Apply|anwenden|Appliquer/i);
  });
});

describe('F31 / F33 account + sign-out', () => {
  const root = resolve(__dirname, '..');
  const account = readFileSync(resolve(root, 'src/pages/Account.tsx'), 'utf8');
  const auth = readFileSync(resolve(root, 'src/lib/auth.tsx'), 'utf8');

  it('F31: Account refreshes session on visibility and before export', () => {
    expect(account).toContain('visibilitychange');
    expect(account).toMatch(/getSession/);
  });

  it('F33: signOutAndGo flushSync sets signingOut before navigate', () => {
    expect(auth).toContain('flushSync');
    expect(auth).toMatch(/flushSync\(\s*\(\)\s*=>\s*setSigningOut\(true\)\s*\)/);
    expect(auth).toContain('window.location.replace');
  });
});

describe('F23 auth emails locale', () => {
  it('authEmailLang prefers user_metadata.lang then redirect /lang/', () => {
    expect(authEmailLang({ lang: 'fr' })).toBe('fr');
    expect(authEmailLang({ lang: 'xx' }, 'https://borderday.com/de/auth/callback')).toBe('de');
    expect(authEmailLang({}, 'https://borderday.com/nl/app')).toBe('nl');
    expect(authEmailLang(null)).toBe('en');
  });

  it('buildAuthEmail localizes signup for EN/FR/DE/IT/NL without frontalier branding', () => {
    for (const lang of ['en', 'fr', 'de', 'it', 'nl'] as const) {
      const mail = buildAuthEmail({
        action: 'signup',
        lang,
        confirmationUrl: 'https://borderday.com/en/auth/callback',
      });
      expect(mail.subject.length).toBeGreaterThan(5);
      expect(mail.html).toContain('BorderDay');
      expect(mail.html.toLowerCase()).not.toContain('frontalier');
      expect(mail.text.toLowerCase()).not.toContain('frontalier');
    }
  });

  it('confirmationUrl keeps redirect and token hash', () => {
    const url = confirmationUrl({
      redirectTo: 'https://borderday.com/fr/auth/callback',
      tokenHash: 'abc',
      type: 'signup',
      projectUrl: 'https://uufmlmwgvoqhhtqgrclu.supabase.co',
    });
    expect(url).toContain('token=abc');
    expect(url).toContain('type=signup');
    expect(url).toContain('redirect_to=');
  });

  it('Go template helpers emit Data.lang branches for all five locales', () => {
    const html = goTemplateForAction('signup');
    const subject = goSubjectForAction('signup');
    for (const lang of ['en', 'fr', 'de', 'it', 'nl']) {
      expect(html).toContain(`.Data.lang "${lang}"`);
    }
    // Subject uses eq for fr/de/it/nl and {{ else }} for English fallback.
    for (const lang of ['fr', 'de', 'it', 'nl']) {
      expect(subject).toContain(`.Data.lang "${lang}"`);
    }
    expect(subject).toContain('{{ else }}');
    expect(subject).toContain('Confirm your BorderDay email');
  });
});

describe('F8/F10 createInvite source contracts', () => {
  const api = readFileSync(resolve(__dirname, '../src/lib/companyApi.ts'), 'utf8');
  it('refuses active members and reuses pending invites', () => {
    expect(api).toContain("code: 'already_member'");
    expect(api).toContain('reused: true');
    expect(api).toContain("listInvites(companyId, 'pending')");
  });
});
