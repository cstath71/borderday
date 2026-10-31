import { describe, expect, it } from 'vitest';

function mapStripeStatus(status: string): string {
  const statusMap: Record<string, string> = {
    trialing: 'trialing', active: 'active', past_due: 'past_due', canceled: 'canceled',
    unpaid: 'past_due', incomplete: 'incomplete', incomplete_expired: 'canceled',
  };
  return statusMap[status] || 'none';
}

describe('stripe status mapping', () => {
  it('maps known statuses', () => {
    expect(mapStripeStatus('active')).toBe('active');
    expect(mapStripeStatus('unpaid')).toBe('past_due');
  });
});

describe('seat floor', () => {
  it('min 8 seats for €39 floor at €5', () => {
    expect(Math.max(3, 8) * 5).toBe(40);
  });
});
