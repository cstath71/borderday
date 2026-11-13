// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DayImport from '../src/components/company/DayImport';
import { getDict } from '../src/i18n';
import type { ImportRpcResult } from '../src/lib/dayImport';

const d = getDict('en');
const member = {
  userId: 'u-ada',
  email: 'ada.example@example.com',
  active: true,
  removedAt: null,
  employedFrom: null,
  employedUntil: null,
};

function renderImport(onImport = vi.fn(async (): Promise<ImportRpcResult> => ({
  batch_id: 'b1',
  imported: 1,
  skipped: 0,
  errors: 0,
  rows: [{ index: 0, status: 'imported', code: null, email: member.email, work_date: '2026-01-15' }],
}))) {
  render(
    <DayImport
      d={d}
      members={[member]}
      existing={[]}
      today="2026-11-13"
      onImport={onImport}
    />,
  );
  return onImport;
}

function choose(text: string) {
  const input = screen.getByLabelText(d.company.dayImport.choose) as HTMLInputElement;
  const file = new File([text], 'days.csv', { type: 'text/csv' });
  fireEvent.change(input, { target: { files: [file] } });
}

describe('DayImport', () => {
  afterEach(cleanup);

  it('previews errors and does not write until confirm, and only then', async () => {
    const onImport = renderImport();
    expect(onImport).not.toHaveBeenCalled();
    choose('employee_email,date,day_type\nnobody.example@example.com,2026-01-15,telework\nada.example@example.com,2026-01-15,telework\n');
    await screen.findByText(d.company.dayImport.errors.not_member);
    await screen.findByText(d.company.dayImport.statusReady);
    expect(onImport).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Import 1 days' }));
    await waitFor(() => expect(onImport).toHaveBeenCalledTimes(1));
    const sent = onImport.mock.calls[0][0];
    expect(sent).toHaveLength(2);
    expect(sent[1]).toMatchObject({ email: 'ada.example@example.com', work_date: '2026-01-15', day_type: 'telework' });
    await screen.findByText('1 imported, 0 skipped, 0 not imported.');
  });

  it('leaves the confirm button disabled when nothing is ready', async () => {
    const onImport = renderImport();
    choose('employee_email,date,day_type\nada.example@example.com,2027-01-01,telework\n');
    await screen.findByText(d.company.dayImport.errors.future_date);
    expect((screen.getByRole('button', { name: 'Import 0 days' }) as HTMLButtonElement).disabled).toBe(true);
    expect(onImport).not.toHaveBeenCalled();
  });
});
