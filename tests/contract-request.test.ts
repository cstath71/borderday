import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildReceipt,
  handleContractRequest,
  MAX_RECEIPTS_PER_ADDRESS_PER_HOUR,
  MAX_RECEIPTS_PER_HOUR,
  MAX_REQUESTS_PER_ADDRESS_PER_HOUR,
  MAX_REQUESTS_PER_HOUR,
  parseContractRequest,
  withoutLinks,
  type ContractRequestDeps,
} from '../supabase/functions/_shared/contractRequest';

const valid = {
  kind: 'withdrawal',
  name: 'Ana Test',
  email: 'Ana@Example.test',
  orderReference: 'ORD-1',
  orderDate: '2026-10-20',
  lang: 'de',
};

const NOW = new Date('2026-11-01T12:34:56Z');
let sent: Array<{ to: string; replyTo?: string; subject: string; text: string }>;
let marks: string[];
let inserts: number;
let counts: Partial<Record<'address' | 'overall' | 'receiptsAddress' | 'receipts', number | null>>;
let send: ReturnType<typeof vi.fn>;
let insertFails: boolean;

function deps(over: Partial<ContractRequestDeps> = {}): ContractRequestDeps {
  return {
    now: () => NOW,
    countRequests: async ({ email, receiptsOnly }) => {
      const key = receiptsOnly ? (email ? 'receiptsAddress' : 'receipts') : email ? 'address' : 'overall';
      const value = counts[key];
      return value === undefined ? 0 : value;
    },
    insert: async (_fields, receivedAt) => {
      inserts += 1;
      return insertFails ? null : { id: 'req-1', receivedAt };
    },
    mark: async (_id, column) => {
      marks.push(column);
    },
    sendEmail: send as unknown as ContractRequestDeps['sendEmail'],
    ...over,
  };
}

beforeEach(() => {
  sent = [];
  marks = [];
  inserts = 0;
  counts = {};
  insertFails = false;
  send = vi.fn(async (mail) => {
    sent.push(mail);
    return true;
  });
});

describe('A3-08 validation', () => {
  it('normalises a valid request', () => {
    expect(parseContractRequest(valid)).toEqual({
      kind: 'withdrawal',
      name: 'Ana Test',
      email: 'ana@example.test',
      orderReference: 'ORD-1',
      orderDate: '2026-10-20',
      lang: 'de',
    });
  });

  it('reference and date are optional; an unknown language becomes English', () => {
    const r = parseContractRequest({ kind: 'cancellation', name: 'A', email: 'a@example.test', orderReference: ' ', orderDate: '', lang: 'xx' });
    expect(r).toMatchObject({ orderReference: null, orderDate: null, lang: 'en' });
  });

  it.each([
    ['no body', null],
    ['a string body', 'x'],
    ['an unknown kind', { ...valid, kind: 'refund' }],
    ['no name', { ...valid, name: '  ' }],
    ['no email', { ...valid, email: '' }],
    ['two recipients', { ...valid, email: 'a@example.test,b@example.test' }],
    ['a newline in the address', { ...valid, email: 'a@example.test\nBcc: b@example.test' }],
    ['an impossible date', { ...valid, orderDate: '2026-02-31' }],
    ['a date in another format', { ...valid, orderDate: '20/10/2026' }],
  ])('refuses %s', (_label, body) => {
    expect(parseContractRequest(body)).toBeNull();
  });

  it('strips line breaks, so a field cannot add lines to the mail', () => {
    const r = parseContractRequest({ ...valid, name: 'Ana\r\nBcc: x@example.test' })!;
    expect(r.name).toBe('Ana Bcc: x@example.test');
  });

  it('caps long fields', () => {
    const r = parseContractRequest({ ...valid, name: 'x'.repeat(500), orderReference: 'y'.repeat(500) })!;
    expect(r.name).toHaveLength(200);
    expect(r.orderReference).toHaveLength(200);
  });
});

describe('A3-08 flow', () => {
  it('stores the request, then returns its id and time, and sends both mails', async () => {
    const result = await handleContractRequest(valid, deps());
    expect(result).toEqual({
      status: 200,
      body: { recorded: true, id: 'req-1', receivedAt: NOW.toISOString(), receipt: 'sent' },
    });
    expect(inserts).toBe(1);
    expect(sent.map((m) => m.to)).toEqual(['privacy@borderday.com', 'ana@example.test']);
    expect(sent[0].replyTo).toBe('ana@example.test');
    expect(marks).toEqual(['staff_notified_at', 'receipt_sent_at']);
  });

  it('routes a cancellation to the mailbox the form used before', async () => {
    await handleContractRequest({ ...valid, kind: 'cancellation' }, deps());
    expect(sent[0].to).toBe('hello@borderday.com');
  });

  it('dry run: without a key the request is still stored, and no mail leaves', async () => {
    const result = await handleContractRequest(valid, deps({ sendEmail: null }));
    expect(result.body).toMatchObject({ recorded: true, receipt: 'dry_run' });
    expect(inserts).toBe(1);
    expect(send).not.toHaveBeenCalled();
    expect(marks).toEqual([]);
  });

  it('refuses invalid input without storing or sending', async () => {
    expect(await handleContractRequest({ ...valid, email: 'nope' }, deps())).toEqual({
      status: 400,
      body: { recorded: false, code: 'invalid' },
    });
    expect(inserts).toBe(0);
    expect(send).not.toHaveBeenCalled();
  });

  it('fails closed when it cannot store or cannot read a limit: no receipt claims a record that does not exist', async () => {
    insertFails = true;
    expect((await handleContractRequest(valid, deps())).status).toBe(503);
    expect(send).not.toHaveBeenCalled();
    insertFails = false;
    counts = { address: null };
    expect((await handleContractRequest(valid, deps())).status).toBe(503);
    counts = { overall: null };
    expect((await handleContractRequest(valid, deps())).status).toBe(503);
    expect(inserts).toBe(1); // only the insert attempt of the first case
  });

  it('caps requests per address and overall, so the form falls back to email', async () => {
    counts = { address: MAX_REQUESTS_PER_ADDRESS_PER_HOUR };
    expect(await handleContractRequest(valid, deps())).toEqual({ status: 429, body: { recorded: false, code: 'rate_limited' } });
    counts = { overall: MAX_REQUESTS_PER_HOUR };
    expect((await handleContractRequest(valid, deps())).status).toBe(429);
    expect(inserts).toBe(0);
    counts = { address: MAX_REQUESTS_PER_ADDRESS_PER_HOUR - 1, overall: MAX_REQUESTS_PER_HOUR - 1 };
    expect((await handleContractRequest(valid, deps())).status).toBe(200);
  });

  it('above the receipt caps it stores and tells staff, but sends the person no mail', async () => {
    counts = { receiptsAddress: MAX_RECEIPTS_PER_ADDRESS_PER_HOUR };
    expect((await handleContractRequest(valid, deps())).body).toMatchObject({ recorded: true, receipt: 'limited' });
    counts = { receipts: MAX_RECEIPTS_PER_HOUR };
    expect((await handleContractRequest(valid, deps())).body).toMatchObject({ recorded: true, receipt: 'limited' });
    expect(sent.every((m) => m.to === 'privacy@borderday.com')).toBe(true);
    expect(marks).not.toContain('receipt_sent_at');
  });

  it('a failed or throwing mail leaves the request recorded and says the receipt failed', async () => {
    send.mockResolvedValue(false);
    expect((await handleContractRequest(valid, deps())).body).toMatchObject({ recorded: true, receipt: 'failed' });
    expect(marks).toEqual([]);
    send.mockRejectedValue(new Error('network'));
    expect((await handleContractRequest(valid, deps())).body).toMatchObject({ recorded: true, receipt: 'failed' });
  });
});

describe('A3-08 receipt', () => {
  const fields = (over = {}) => parseContractRequest({ ...valid, ...over })!;

  it('states what was received, with the date and time on the Zurich clock', () => {
    const { subject, text } = buildReceipt(fields({ lang: 'en' }), 'req-1', NOW.toISOString());
    expect(subject).toBe('BorderDay: withdrawal received');
    expect(text).toContain('Received on 1 November 2026 at 13:34:56 (Europe/Zurich).');
    for (const part of ['req-1', 'Ana Test', 'ana@example.test', 'ORD-1', '2026-10-20']) expect(text).toContain(part);
  });

  it.each([
    ['en', /Received on/],
    ['fr', /Reçu le/],
    ['de', /Eingegangen am/],
    ['it', /Ricevuto il/],
    ['nl', /Ontvangen op/],
  ])('%s: localised', (lang, word) => {
    for (const kind of ['withdrawal', 'cancellation']) {
      expect(buildReceipt(fields({ lang, kind }), 'r', NOW.toISOString()).text).toMatch(word);
    }
  });

  it('never carries a link in a person-supplied field, as the address is not verified', () => {
    expect(withoutLinks('see https://evil.example/x now')).toBe('see [link removed] now');
    expect(withoutLinks('www.evil.example')).toBe('[link removed]');
    expect(withoutLinks('evil.example/promo')).toBe('[link removed]');
    expect(withoutLinks('J. Smith')).toBe('J. Smith');
    expect(withoutLinks('ORD-1.2')).toBe('ORD-1.2');
    const { text } = buildReceipt(fields({ name: 'Win at evil.example', orderReference: 'https://evil.example' }), 'r', NOW.toISOString());
    expect(text).not.toMatch(/evil\.example/);
    expect(text).toContain('[link removed]');
  });

  it('omits the optional lines when they are empty', () => {
    const { text } = buildReceipt(fields({ lang: 'en', orderReference: '', orderDate: '' }), 'r', NOW.toISOString());
    expect(text).not.toMatch(/Order reference|Order or access date/);
  });
});

describe('A3-08 function contract', () => {
  const src = readFileSync(resolve(__dirname, '../supabase/functions/bd-contract-request/index.ts'), 'utf8');

  it('sends only when live and keyed, with the same switch as the other functions', () => {
    expect(src).toMatch(/\(Deno\.env\.get\("RESEND_LIVE"\) \?\? "1"\) === "1"/);
    expect(src).toMatch(/sendEmail: live && apiKey\s*\?/);
    expect(src).toMatch(/: null,/);
  });

  it('logs no name, address or reference', () => {
    const logs = src.match(/console\.\w+\([^\n]*\)/g) ?? [];
    expect(logs.length).toBeGreaterThan(0);
    for (const line of logs) expect(line).not.toMatch(/email|name|reference|fields|\bto\b/i);
  });

  it('takes the account from the verified token, never from the body', () => {
    expect(src).toContain('supabase.auth.getUser()');
    expect(src).not.toMatch(/body\.user|body\?\.user/);
  });
});
