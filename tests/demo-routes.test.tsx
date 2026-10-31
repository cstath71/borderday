// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/auth', () => ({
  useAuth: () => ({ ready: true, configured: true, user: null, signOut: vi.fn() }),
  AuthProvider: ({ children }: any) => children,
}));

import App from '../src/App';
import en from '../src/i18n/en';
import { resetMockDb } from '../src/lib/supabaseMock';

function open(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => resetMockDb());
afterEach(cleanup);

describe('/demo (mock only, labelled)', () => {
  it('seeds the DEMO company and labels the dashboard', async () => {
    const { container } = open('/en/demo');
    await screen.findByText(/DEMO — Acme Cross-Border SA/);
    expect(screen.getByRole('status').textContent).toContain('DEMO');
    expect(container.textContent).toContain(en.company.demoDataBadge);
    expect(container.textContent).toContain('Alice Demo');
    expect(container.textContent).not.toMatch(/Backend|local-mock/);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('keeps every link inside /demo', async () => {
    const { container } = open('/en/demo');
    await screen.findByText(/DEMO — Acme Cross-Border SA/);
    const links = [...container.querySelectorAll('main a, .container a')].map((a) => a.getAttribute('href') ?? '');
    const companyLinks = links.filter((h) => /\/company\/[^s]|\/join\//.test(h));
    expect(companyLinks.length).toBeGreaterThan(0);
    for (const href of companyLinks) expect(href).toMatch(/^\/en\/demo\//);
  });

  it('demo invite and join work without an account and stay labelled', async () => {
    open('/en/demo/join/demo-invite-token-borderday');
    await screen.findByText(/newhire\.demo@borderday\.example/);
    expect(screen.getAllByText(en.company.demoDataBadge).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText(en.company.yourName), { target: { value: 'New Hire' } });
    fireEvent.change(screen.getByLabelText(en.company.pickBorder), { target: { value: 'geneva_fr' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: en.company.joinButton }));
    await screen.findByText(en.company.joinSuccess);
  });
});
