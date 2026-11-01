import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  beginEvent,
  checkWrite,
  finishEvent,
  stateSubscriptionId,
  WebhookWriteError,
} from '../supabase/functions/_shared/stripeEvents';

type Row = {
  event_id: string;
  event_type: string;
  stripe_subscription_id: string | null;
  event_created_at: string;
  processed_at?: string | null;
};

/** Just enough of the Supabase query builder for bd_stripe_events. */
function fakeAdmin(rows: Row[] = [], fail: string | null = null) {
  return {
    rows,
    from(_table: string) {
      const filters: Array<(r: Row) => boolean> = [];
      const q: any = {
        select: () => q,
        eq(col: keyof Row, v: unknown) {
          filters.push((r) => r[col] === v);
          return q;
        },
        gt(col: keyof Row, v: string) {
          filters.push((r) => String(r[col]) > v);
          return q;
        },
        not(col: keyof Row) {
          filters.push((r) => r[col] != null);
          return q;
        },
        limit: async () => (fail === 'newer' ? { error: {} } : { data: rows.filter((r) => filters.every((f) => f(r))) }),
        maybeSingle: async () =>
          fail === 'read' ? { error: {} } : { data: rows.find((r) => filters.every((f) => f(r))) ?? null },
        upsert: async (row: Row) => {
          if (fail === 'claim') return { error: {} };
          const at = rows.findIndex((r) => r.event_id === row.event_id);
          if (at >= 0) rows[at] = { ...rows[at], ...row };
          else rows.push({ ...row, processed_at: null });
          return {};
        },
        update: (patch: Partial<Row>) => ({
          eq: async (_c: string, id: string) => {
            if (fail === 'finish') return { error: {} };
            for (const r of rows) if (r.event_id === id) Object.assign(r, patch);
            return {};
          },
        }),
      };
      return q;
    },
  };
}

const updated = (id: string, created: number, sub = 'sub_1') => ({
  id,
  type: 'customer.subscription.updated',
  created,
  data: { object: { id: sub } },
});

describe('A3-16 event bookkeeping', () => {
  it('a first delivery processes, and a redelivery after success is a duplicate', async () => {
    const admin = fakeAdmin();
    const e = updated('evt_1', 100);
    expect(await beginEvent(admin, e)).toBe('process');
    await finishEvent(admin, e);
    expect(await beginEvent(admin, e)).toBe('duplicate');
  });

  it('a retry after a failed attempt runs again', async () => {
    const admin = fakeAdmin();
    const e = updated('evt_1', 100);
    expect(await beginEvent(admin, e)).toBe('process');
    // No finishEvent: the handler threw. The row stays unfinished.
    expect(await beginEvent(admin, e)).toBe('process');
    expect(admin.rows).toHaveLength(1);
  });

  it('an older snapshot is stale once a newer event for that subscription is done', async () => {
    const admin = fakeAdmin();
    const newer = updated('evt_2', 200);
    await beginEvent(admin, newer);
    await finishEvent(admin, newer);
    expect(await beginEvent(admin, updated('evt_1', 100))).toBe('stale');
  });

  it('a newer unfinished event does not make an older one stale', async () => {
    const admin = fakeAdmin();
    await beginEvent(admin, updated('evt_2', 200)); // failed part-way
    expect(await beginEvent(admin, updated('evt_1', 100))).toBe('process');
  });

  it('another subscription, or the same second, is not stale', async () => {
    const admin = fakeAdmin();
    const done = updated('evt_2', 200);
    await beginEvent(admin, done);
    await finishEvent(admin, done);
    expect(await beginEvent(admin, updated('evt_3', 100, 'sub_other'))).toBe('process');
    expect(await beginEvent(admin, updated('evt_4', 200))).toBe('process');
  });

  it('checkout re-reads Stripe, so it is never stale, and reminders never make anything stale', async () => {
    const admin = fakeAdmin();
    const done = updated('evt_2', 200);
    await beginEvent(admin, done);
    await finishEvent(admin, done);
    const checkout = { id: 'evt_c', type: 'checkout.session.completed', created: 100, data: { object: { subscription: 'sub_1' } } };
    expect(await beginEvent(admin, checkout)).toBe('process');

    const fresh = fakeAdmin();
    const reminder = { id: 'evt_r', type: 'customer.subscription.trial_will_end', created: 300, data: { object: { id: 'sub_1' } } };
    await beginEvent(fresh, reminder);
    await finishEvent(fresh, reminder);
    expect(stateSubscriptionId(reminder)).toBeNull();
    expect(await beginEvent(fresh, updated('evt_u', 100))).toBe('process');
  });

  it.each(['read', 'claim', 'newer'])('a failed %s throws, so the request is not acknowledged', async (fail) => {
    await expect(beginEvent(fakeAdmin([], fail), updated('evt_1', 100))).rejects.toBeInstanceOf(WebhookWriteError);
  });

  it('a failed finish throws too', async () => {
    await expect(finishEvent(fakeAdmin([], 'finish'), updated('evt_1', 100))).rejects.toBeInstanceOf(WebhookWriteError);
  });

  it('checkWrite passes clean results and names the write that failed', () => {
    expect(() => checkWrite({ data: [] }, 'x')).not.toThrow();
    expect(() => checkWrite({ error: { message: 'duplicate key a@b.c' } }, 'upsert subscription')).toThrow('write failed: upsert subscription');
    try {
      checkWrite({ error: { message: 'duplicate key a@b.c' } }, 'upsert subscription');
    } catch (e) {
      expect((e as Error).message).not.toContain('a@b.c');
    }
  });
});

describe('bd-stripe-webhook wiring', () => {
  const src = readFileSync(resolve(__dirname, '../supabase/functions/bd-stripe-webhook/index.ts'), 'utf8');

  it('A3-11: logs carry the subscription and the result, never the address', () => {
    const logs = [...src.matchAll(/console\.(?:log|error|warn)\((.*)\)/g)].map((m) => m[1]);
    expect(logs.length).toBeGreaterThanOrEqual(3);
    for (const line of logs) {
      expect(line).not.toMatch(/\bto\b|email|token|e\.message/);
    }
    expect(src).toMatch(/subscriptionId: opts\.subscriptionId, lang: built\.lang, ok: r\.ok/);
  });

  it('A3-16: every database write is checked, and a failure returns 500', () => {
    expect(src).toMatch(/checkWrite\(companyRead, "read company"\)/);
    expect(src).toMatch(/"update company"\)/);
    expect(src).toMatch(/"upsert subscription"\)/);
    expect(src).not.toMatch(/\n\s+await admin\.from\(/);
    expect(src).toMatch(/status: 500/);
    expect(src).toMatch(/await finishEvent\(admin, event\)/);
  });
});
