import { describe, expect, it } from 'vitest';
import { csvCell } from '../src/lib/csvCell';
import {
  MAX_IMPORT_ROWS,
  classifyDayImport,
  dayImportTemplateCsv,
  provenanceOf,
  type ImportExisting,
  type ImportMember,
} from '../src/lib/dayImport';

const today = '2026-11-13';

function member(over: Partial<ImportMember> = {}): ImportMember {
  return {
    userId: 'u-ada',
    email: 'ada.example@example.com',
    active: true,
    removedAt: null,
    employedFrom: null,
    employedUntil: null,
    ...over,
  };
}

function csv(body: string): string {
  return `employee_email,date,day_type,overnight_away,half_day,note\n${body}`;
}

function classify(body: string, members: ImportMember[] = [member()], existing: ImportExisting[] = []) {
  return classifyDayImport(csv(body), { members, existing, today });
}

function row(result: ReturnType<typeof classify>, index = 0) {
  return result.rows[index];
}

describe('day import template', () => {
  it('uses an example.com address and English column names', () => {
    const text = dayImportTemplateCsv();
    expect(text.split('\n')[0]).toBe('employee_email,date,day_type,overnight_away,half_day,note');
    expect(text).toContain('ada.example@example.com');
    expect(text).not.toMatch(/@(gmail|outlook|yahoo|icloud)\./);
  });
});

describe('classifyDayImport', () => {
  it('accepts a past day for a member who joined the app later', () => {
    const result = classify('ada.example@example.com,2026-01-15,telework,no,no,');
    expect(result.fileError).toBeNull();
    expect(row(result)).toMatchObject({ status: 'ready', code: null, dayType: 'telework', workDate: '2026-01-15' });
  });

  it('rejects an unknown file, an empty file and a file over the cap', () => {
    expect(classifyDayImport('name,city\nx,y\n', { members: [], existing: [], today }).fileError).toBe('bad_file');
    expect(classifyDayImport('employee_email,date,day_type\n', { members: [], existing: [], today }).fileError).toBe('empty');
    const huge = csv(Array.from({ length: MAX_IMPORT_ROWS + 1 }, () => 'ada.example@example.com,2026-01-02,telework').join('\n'));
    expect(classifyDayImport(huge, { members: [member()], existing: [], today }).fileError).toBe('too_big');
  });

  it('rejects unknown members, bad dates, future dates and invalid types', () => {
    expect(row(classify('nobody.example@example.com,2026-01-15,telework')).code).toBe('not_member');
    expect(row(classify(',2026-01-15,telework')).code).toBe('unknown_email');
    expect(row(classify('ada.example@example.com,2026-02-31,telework')).code).toBe('bad_date');
    expect(row(classify('ada.example@example.com,15/01/2026,telework')).code).toBe('bad_date');
    expect(row(classify('ada.example@example.com,2027-01-01,telework')).code).toBe('future_date');
    expect(row(classify('ada.example@example.com,2026-01-15,vacation')).code).toBe('invalid_type');
  });

  it('canonicalizes day types and yes/no flags, and rejects a bad flag', () => {
    expect(row(classify('ada.example@example.com,2026-03-02,On Site,yes,no,')).dayType).toBe('onsite');
    expect(row(classify('ada.example@example.com,2026-03-02,On Site,yes,no,')).overnightAway).toBe(true);
    expect(row(classify('ada.example@example.com,2026-03-02,telework,no,0.5,')).halfDay).toBe(true);
    expect(row(classify('ada.example@example.com,2026-03-02,telework,maybe,no,')).code).toBe('invalid_flag');
    expect(row(classify('ada.example@example.com,2026-03-02,telework,maybe,no,')).rpc.overnight_away).toBe('invalid');
  });

  it('rejects a half day on a non-working day and a night away on telework', () => {
    expect(row(classify('ada.example@example.com,2026-03-02,non_working,no,yes,')).code).toBe('invalid_half_day');
    expect(row(classify('ada.example@example.com,2026-03-02,telework,yes,no,')).code).toBe('invalid_overnight');
    expect(row(classify('ada.example@example.com,2026-03-02,third_country,yes,yes,')).status).toBe('ready');
  });

  it('rejects a note over 500 characters and defuses a formula', () => {
    expect(row(classify(`ada.example@example.com,2026-03-02,telework,no,no,${'n'.repeat(501)}`)).code).toBe('note_too_long');
    const poisoned = row(classify('ada.example@example.com,2026-03-02,telework,no,no,=1+1'));
    expect(poisoned.status).toBe('ready');
    expect(poisoned.note).toBe("'=1+1");
    expect(csvCell('=1+1')).toBe(`"'=1+1"`);
  });

  it('rejects every copy of a duplicated email and date', () => {
    const result = classify(
      'ada.example@example.com,2026-03-02,telework,no,no,\nada.example@example.com,2026-03-02,onsite,no,no,\n',
    );
    expect(result.rows.map((r) => r.code)).toEqual(['duplicate_in_file', 'duplicate_in_file']);
    expect(result.rows.every((r) => r.status === 'error')).toBe(true);
  });

  it('uses employed_from and employed_until, not the app join date', () => {
    const bounded = member({ employedFrom: '2026-03-01', employedUntil: '2026-03-31' });
    expect(row(classify('ada.example@example.com,2026-02-28,telework', [bounded])).code).toBe('outside_employment');
    expect(row(classify('ada.example@example.com,2026-03-01,telework', [bounded])).status).toBe('ready');
    expect(row(classify('ada.example@example.com,2026-04-01,telework', [bounded])).code).toBe('outside_employment');
  });

  it('caps a removed member at the earlier of employed_until and removed_at', () => {
    const gone = member({ active: false, removedAt: '2026-04-10T08:00:00Z', employedUntil: '2026-06-01' });
    expect(row(classify('ada.example@example.com,2026-04-10,telework', [gone])).status).toBe('ready');
    expect(row(classify('ada.example@example.com,2026-04-11,telework', [gone])).code).toBe('outside_employment');
  });

  it('does not overwrite an employee day or an earlier import', () => {
    const existing: ImportExisting[] = [
      { employeeUserId: 'u-ada', workDate: '2026-03-02', entrySource: 'employee' },
      { employeeUserId: 'u-ada', workDate: '2026-03-03', entrySource: 'hr', voidedAt: '2026-03-04T00:00:00Z' },
      { employeeUserId: 'u-ada', workDate: '2026-03-04', entrySource: 'hr', employeeCorrectedAt: '2026-03-05T00:00:00Z' },
      { employeeUserId: 'u-ada', workDate: '2026-03-05', entrySource: 'hr' },
    ];
    const body = ['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05']
      .map((date) => `ada.example@example.com,${date},telework`)
      .join('\n');
    const result = classify(body, [member()], existing);
    expect(result.rows.map((r) => r.code)).toEqual([
      'skipped_employee',
      'skipped_employee',
      'skipped_employee',
      'skipped_already_imported',
    ]);
  });

  it('treats two members with the same email as ambiguous', () => {
    const result = classify('ada.example@example.com,2026-03-02,telework', [member(), member({ userId: 'u-other' })]);
    expect(row(result).code).toBe('ambiguous_email');
  });

  it('keeps a quoted comma in the note', () => {
    const result = classifyDayImport(
      'employee_email,date,day_type,note\nada.example@example.com,2026-03-02,telework,"train, late"\n',
      { members: [member()], existing: [], today },
    );
    expect(row(result).note).toBe('train, late');
  });
});

describe('provenanceOf', () => {
  it('stays an HR import after confirmation or correction', () => {
    expect(provenanceOf({})).toBe('employee');
    expect(provenanceOf({ entrySource: 'hr' })).toBe('hr_import');
    expect(provenanceOf({ entrySource: 'hr', employeeConfirmedAt: '2026-04-01' })).toBe('hr_import_confirmed');
    expect(provenanceOf({ entrySource: 'hr', employeeConfirmedAt: '2026-04-01', employeeCorrectedAt: '2026-04-02' })).toBe(
      'hr_import_corrected',
    );
  });
});
