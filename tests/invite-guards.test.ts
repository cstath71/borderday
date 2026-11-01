import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  COMPANY_NAME_MAX_LENGTH,
  companyCanEmailInvites,
  escapeIlike,
  INVITE_COOLDOWN_MS,
  inviteSendBlock,
  MAX_INVITE_EMAILS_PER_HOUR,
} from '../supabase/functions/_shared/invite';
import { buildInviteEmail, inviteCompanyName } from '../supabase/functions/_shared/inviteEmail';
import { companyHasPaidAccess } from '../src/lib/billing';

const root = resolve(__dirname, '..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('A3-03 who may email invites', () => {
  const future = new Date(Date.now() + 86_400_000).toISOString();
  const past = new Date(Date.now() - 86_400_000).toISOString();

  it.each([
    ['active', null, true],
    ['trialing', null, true],
    ['none', future, true],
    ['canceled', future, true],
    ['none', null, false],
    ['none', past, false],
    ['canceled', null, false],
    ['incomplete', null, false],
    ['past_due', null, false],
    [null, null, false],
  ])('status %s, trial end %s → %s, same as the client rule', (status, trialEndsAt, expected) => {
    expect(companyCanEmailInvites(status, trialEndsAt)).toBe(expected);
    expect(companyHasPaidAccess(status, trialEndsAt)).toBe(expected);
  });
});

describe('A3-03 send limits', () => {
  const none = { company: 0, user: 0, recipient: 0 };

  it('allows a first send, and blocks a repeat to one address before anything else', () => {
    expect(inviteSendBlock(none)).toBeNull();
    expect(inviteSendBlock({ ...none, recipient: 1 })).toBe('cooldown');
  });

  it('stops at the hourly cap per company and per inviter, not one over it', () => {
    expect(inviteSendBlock({ ...none, company: MAX_INVITE_EMAILS_PER_HOUR - 1 })).toBeNull();
    expect(inviteSendBlock({ ...none, company: MAX_INVITE_EMAILS_PER_HOUR })).toBe('rate_limited');
    expect(inviteSendBlock({ ...none, user: MAX_INVITE_EMAILS_PER_HOUR })).toBe('rate_limited');
  });

  it('keeps the cooldown at least as long as the counting window, so each invite is one counted send', () => {
    expect(INVITE_COOLDOWN_MS).toBeGreaterThanOrEqual(60 * 60 * 1000);
  });

  it('treats ilike wildcards in an address as literal characters', () => {
    expect(escapeIlike('a_b%c\\d@x.com')).toBe('a\\_b\\%c\\\\d@x.com');
  });
});

describe('A3-03 the function', () => {
  const src = read('supabase/functions/bd-send-invite/index.ts');

  it('refuses a company without access before any dry-run link or send', () => {
    const gate = src.indexOf('companyCanEmailInvites(');
    expect(gate).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(src.indexOf('if (!allowReal)'));
    expect(gate).toBeLessThan(src.indexOf('api.resend.com'));
    expect(src.slice(gate, src.indexOf('if (!allowReal)'))).toContain('status: 402');
  });

  it('counts email_sent_at, not created_at, and fails closed if the count errors', () => {
    expect(src).not.toContain('created_at');
    expect(src).toMatch(/gte\("email_sent_at", since\)/);
    expect(src).toContain('company.error || inviter.error || recipient.error');
  });

  it('claims the send slot before calling Resend, and gives it back if Resend took nothing', () => {
    expect(src.indexOf('.update({ email_sent_at: new Date()')).toBeLessThan(src.indexOf('api.resend.com'));
    expect(src).toMatch(/if \(!accepted\) await admin\.from\("bd_invitations"\)\.update\(\{ email_sent_at: inv\.email_sent_at \?\? null \}\)/);
  });
});

describe('A3-03 company name in the email', () => {
  const siteUrl = 'https://borderday.com';
  const mail = (companyName: string | null) => buildInviteEmail({ lang: 'en', companyName, joinUrl: 'u', siteUrl });

  it('caps a 100,000 character name in subject, html and text', () => {
    const long = 'A'.repeat(100_000);
    const m = mail(long);
    for (const part of [m.subject, m.html, m.text]) expect(part).not.toContain('A'.repeat(COMPANY_NAME_MAX_LENGTH + 1));
    expect(inviteCompanyName(long)).toHaveLength(COMPANY_NAME_MAX_LENGTH);
    expect(inviteCompanyName(long)!.endsWith('…')).toBe(true);
  });

  it('counts characters, so the cap cannot split an emoji', () => {
    const name = inviteCompanyName('😀'.repeat(200))!;
    expect(Array.from(name)).toHaveLength(COMPANY_NAME_MAX_LENGTH);
    expect(name).not.toMatch(/[\uD800-\uDFFF](?![\uDC00-\uDFFF])(?<![\uD800-\uDBFF][\uDC00-\uDFFF])/);
  });

  it('strips line breaks and bidi controls, and still escapes HTML', () => {
    expect(inviteCompanyName('Acme\r\nBcc: x@y.z')).toBe('Acme Bcc: x@y.z');
    expect(inviteCompanyName('a‮b')).toBe('a b');
    const m = mail('<img src=x onerror=alert(1)>');
    expect(m.html).not.toContain('<img');
    expect(m.html).toContain('&lt;img');
  });

  it('leaves a normal name alone and falls back on an empty one', () => {
    expect(inviteCompanyName('Müller & Söhne AG')).toBe('Müller & Söhne AG');
    expect(mail('   \n ').subject).toContain('BorderDay');
    expect(mail('   \n ').text).toContain('a company');
  });

  it('the sign-up form and the migration use the same limit', () => {
    expect(COMPANY_NAME_MAX_LENGTH).toBe(120);
    expect(read('src/pages/company/Signup.tsx')).toContain('maxLength={120}');
    expect(read('supabase/migrations/20261101110000_bd_invite_send_limits.sql')).toContain('char_length(name) <= 120');
  });
});
