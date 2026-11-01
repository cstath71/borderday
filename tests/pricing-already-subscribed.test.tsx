// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDict, LANGS, t } from '../src/i18n';

const startCheckout = vi.hoisted(() => vi.fn());
vi.mock('../src/lib/auth', () => ({
  useAuth: () => ({ ready: true, configured: true, user: { id: 'u1', email: 'me@example.test' }, signOut: vi.fn() }),
  AuthProvider: ({ children }: any) => children,
}));
vi.mock('../src/lib/billing', async (original) => ({
  ...(await original<typeof import('../src/lib/billing')>()),
  startCheckout,
}));
vi.mock('../src/lib/companyApi', async (original) => ({
  ...(await original<typeof import('../src/lib/companyApi')>()),
  listMyCompanies: vi.fn(async () => []),
}));

import App from '../src/App';

afterEach(cleanup);

async function buyIndividual() {
  render(
    <MemoryRouter initialEntries={['/en/pricing']}>
      <App />
    </MemoryRouter>,
  );
  const d = getDict('en');
  const buttons = await screen.findAllByRole('button', { name: d.pricing.subscribeMonthly });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(buttons[1]);
}

describe('A3-05 Pricing says why no checkout started', () => {
  it('shows the refusal and stays on the page', async () => {
    startCheckout.mockResolvedValue({ ok: false, reason: 'already_subscribed', message: 'x' });
    await buyIndividual();
    const d = getDict('en');
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe(t(d.pricing.alreadySubscribed, { cancel: d.nav.cancel }));
    expect(alert.textContent).toContain(d.nav.cancel);
    expect(alert.textContent).not.toContain('{cancel}');
  });

  it('keeps the generic message for other failures', async () => {
    startCheckout.mockResolvedValue({ ok: false, reason: 'error', message: 'x' });
    await buyIndividual();
    expect((await screen.findByRole('alert')).textContent).toBe(getDict('en').auth.paymentsUnavailable);
  });

  it.each(LANGS)('%s: the message names the placeholder and points to the portal link', (lang) => {
    expect(getDict(lang).pricing.alreadySubscribed).toContain('{cancel}');
  });
});
