// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RequestForm from '../src/components/RequestForm';
import { getDict, t } from '../src/i18n';
import * as contractRequest from '../src/lib/contractRequest';

vi.mock('../src/lib/contractRequest', async (original) => ({
  ...(await original<typeof contractRequest>()),
  submitContractRequest: vi.fn(),
}));

const submit = vi.mocked(contractRequest.submitContractRequest);
const d = getDict('en');
const body = vi.fn((v: { name: string }) => `Withdrawal by ${v.name}`);

function fillAndConfirm() {
  render(
    <MemoryRouter>
      <RequestForm
        d={d}
        lang="en"
        kind="withdrawal"
        to="privacy@borderday.com"
        subject="Withdrawal"
        body={body}
        submitLabel="Continue"
        confirmLabel="Confirm withdrawal"
        dateLabel="Order date"
      />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText(d.mailForm.name), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText(d.mailForm.email), { target: { value: 'ana@example.test' } });
  fireEvent.change(screen.getByLabelText(new RegExp(d.mailForm.reference)), { target: { value: 'ORD-1' } });
  fireEvent.change(screen.getByLabelText('Order date'), { target: { value: '2026-10-20' } });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(submit).not.toHaveBeenCalled();
  screen.getByText('Withdrawal by Ana');
  fireEvent.click(screen.getByRole('button', { name: 'Confirm withdrawal' }));
}

beforeEach(() => submit.mockReset());
afterEach(cleanup);

describe('A3-08 request form', () => {
  it('submits on confirm and shows the time of receipt and the reference', async () => {
    submit.mockResolvedValue({ ok: true, id: 'req-1', receivedAt: '2026-11-01T12:34:56Z', receipt: 'sent' });
    fillAndConfirm();
    await screen.findByText(d.mailForm.receivedTitle);
    expect(submit).toHaveBeenCalledWith({
      kind: 'withdrawal',
      name: 'Ana',
      email: 'ana@example.test',
      orderReference: 'ORD-1',
      orderDate: '2026-10-20',
      lang: 'en',
    });
    screen.getByText(t(d.mailForm.receivedBody, { date: '1 November 2026', time: '13:34:56' }));
    screen.getByText(t(d.mailForm.receivedReference, { id: 'req-1' }));
    screen.getByText(t(d.mailForm.receiptSent, { email: 'ana@example.test' }));
    expect(screen.queryByRole('link', { name: d.mailForm.send })).toBeNull();
  });

  it.each(['dry_run', 'failed', 'limited'] as const)('%s: does not claim a receipt was emailed', async (receipt) => {
    submit.mockResolvedValue({ ok: true, id: 'req-1', receivedAt: '2026-11-01T12:34:56Z', receipt });
    fillAndConfirm();
    await screen.findByText(d.mailForm.receiptNotSent);
    expect(screen.queryByText(t(d.mailForm.receiptSent, { email: 'ana@example.test' }))).toBeNull();
  });

  it('if it cannot record the request, it says so and offers the prepared email', async () => {
    submit.mockResolvedValue({ ok: false });
    fillAndConfirm();
    expect((await screen.findByRole('alert')).textContent).toBe(d.mailForm.failed);
    const href = screen.getByRole('link', { name: d.mailForm.send }).getAttribute('href')!;
    expect(href.startsWith('mailto:privacy@borderday.com?')).toBe(true);
    expect(new URLSearchParams(href.split('?')[1]).get('body')).toBe('Withdrawal by Ana');
    expect(screen.queryByRole('button', { name: 'Confirm withdrawal' })).toBeNull();
    expect(screen.queryByText(d.mailForm.receivedTitle)).toBeNull();
  });

  it('can go back and try again after a failure', async () => {
    submit.mockResolvedValueOnce({ ok: false });
    fillAndConfirm();
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: d.mailForm.back }));
    expect((screen.getByLabelText(d.mailForm.name) as HTMLInputElement).value).toBe('Ana');
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
