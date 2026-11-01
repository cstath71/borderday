import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildConsumerReminder,
  formatReminderDate,
  ReminderSendError,
} from '../supabase/functions/_shared/consumerReminder';

const read = (path: string) => readFileSync(resolve(__dirname, '..', path), 'utf8');
const LOCALES = ['en', 'fr', 'de', 'it', 'nl'] as const;

describe('AR3-09 localised L215-1 boxed renewal reminder', () => {
  it.each(LOCALES)('yearly %s has a subject, cancel link, and boxed deadline', (lang) => {
    const built = buildConsumerReminder({
      kind: 'yearly_renewal',
      lang,
      renewOnIso: '2027-01-15T12:00:00Z',
      cancelUrl: `https://borderday.com/${lang}/cancel`,
    });
    expect(built.lang).toBe(lang);
    expect(built.subject.toLowerCase()).toMatch(/borderday/);
    expect(built.text).toContain(`https://borderday.com/${lang}/cancel`);
    expect(built.text).toMatch(/┌|DEADLINE|DATE LIMITE|FRIST|SCADENZA|UITERSTE/i);
    expect(built.html).toContain('border:2px solid');
    expect(built.html).toContain(`https://borderday.com/${lang}/cancel`);
  });

  it('French yearly mail cites L215-1 in the box', () => {
    const built = buildConsumerReminder({
      kind: 'yearly_renewal',
      lang: 'fr',
      renewOnIso: '2027-01-15T12:00:00Z',
      cancelUrl: 'https://borderday.com/fr/cancel',
    });
    expect(built.text).toMatch(/L215-1/);
    expect(built.html).toMatch(/L215-1/);
    expect(built.subject).toMatch(/renouvel/i);
  });

  it.each(LOCALES)('trial %s keeps a cancel-before box', (lang) => {
    const built = buildConsumerReminder({
      kind: 'trial_ending',
      lang,
      renewOnIso: '2026-11-10T12:00:00Z',
      cancelUrl: `https://borderday.com/${lang}/cancel`,
    });
    expect(built.subject.toLowerCase()).toMatch(/borderday/);
    expect(built.html).toContain('border:2px solid');
    expect(built.text).toContain(`https://borderday.com/${lang}/cancel`);
  });

  it('unknown language falls back to English copy and /en/ cancel stays caller-owned', () => {
    const built = buildConsumerReminder({
      kind: 'yearly_renewal',
      lang: 'xx',
      renewOnIso: null,
      cancelUrl: 'https://borderday.com/en/cancel',
    });
    expect(built.lang).toBe('en');
    expect(built.subject).toBe('BorderDay: your yearly plan renews soon');
    expect(formatReminderDate(null, 'en')).toBe('the renewal date');
  });

  it('escapes HTML in dates and URLs inside the box', () => {
    const built = buildConsumerReminder({
      kind: 'yearly_renewal',
      lang: 'en',
      renewOnIso: '2027-01-15T12:00:00Z',
      cancelUrl: 'https://borderday.com/en/cancel?x=<script>',
    });
    expect(built.html).not.toContain('<script>');
    expect(built.html).toContain('&lt;script&gt;');
  });
});

describe('AR3-09 webhook wiring', () => {
  const webhook = read('supabase/functions/bd-stripe-webhook/index.ts');

  it('builds localised html+text and fails the webhook on Resend errors', () => {
    expect(webhook).toContain('buildConsumerReminder');
    expect(webhook).toContain('html: built.html');
    expect(webhook).toContain('text: built.text');
    expect(webhook).toContain('if (!r.ok) throw new ReminderSendError');
    expect(webhook).toContain('send reminder');
    expect(new ReminderSendError(502).status).toBe(502);
  });

  it('still follows metadata language for the cancel link', () => {
    expect(webhook).toContain('${siteUrl}/${inviteLang(opts.lang)}/cancel');
    expect(webhook).toContain('lang: sub.metadata?.lang');
  });
});
