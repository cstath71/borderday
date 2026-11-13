import { useMemo, useState } from 'react';
import type { Dict } from '../../i18n';
import { t } from '../../i18n';
import { download } from '../../lib/download';
import {
  MAX_IMPORT_ROWS,
  classifyDayImport,
  dayImportTemplateCsv,
  type ClassifiedRow,
  type ImportFileResult,
  type ImportMember,
  type ImportExisting,
  type ImportRpcResult,
  type ImportRpcRow,
} from '../../lib/dayImport';

const PREVIEW_CAP = 100;

function detail(d: Dict, code: string | null): string {
  if (!code) return '';
  const errors = d.company.dayImport.errors as Record<string, string>;
  return errors[code] ?? code;
}

function statusLabel(d: Dict, status: ClassifiedRow['status'] | 'imported'): string {
  const copy = d.company.dayImport;
  if (status === 'ready') return copy.statusReady;
  if (status === 'skipped') return copy.statusSkipped;
  if (status === 'imported') return copy.statusImported;
  return copy.statusError;
}

export default function DayImport(props: {
  d: Dict;
  members: ImportMember[];
  existing: ImportExisting[];
  today: string;
  onImport: (rows: ImportRpcRow[]) => Promise<ImportRpcResult>;
}) {
  const { d, members, existing, today, onImport } = props;
  const copy = d.company.dayImport;
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportFileResult | null>(null);
  const [server, setServer] = useState<ImportRpcResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const counts = useMemo(() => {
    const rows = preview?.rows ?? [];
    return {
      ready: rows.filter((r) => r.status === 'ready').length,
      skipped: rows.filter((r) => r.status === 'skipped').length,
      errors: rows.filter((r) => r.status === 'error').length,
    };
  }, [preview]);

  function onFile(file: File | undefined) {
    setServer(null);
    setFailure(null);
    if (!file) {
      setFileName(null);
      setPreview(null);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setPreview(classifyDayImport(text, { members, existing, today }));
    };
    reader.readAsText(file);
  }

  async function confirm() {
    if (!preview || preview.fileError || counts.ready === 0) return;
    setBusy(true);
    setFailure(null);
    try {
      const result = await onImport(preview.rows.map((r) => r.rpc));
      setServer(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      setFailure(/no active plan/i.test(message) ? copy.noPlan : copy.failed);
    } finally {
      setBusy(false);
    }
  }

  const shown = (preview?.rows ?? []).slice(0, PREVIEW_CAP);
  const serverByIndex = new Map((server?.rows ?? []).map((r) => [r.index, r]));

  return (
    <div className="card" style={{ marginTop: '1.5rem' }} data-testid="day-import">
      <h2>{copy.title}</h2>
      <p>{copy.intro}</p>
      <p className="meta">{copy.employmentHint}</p>
      <p>
        <button type="button" className="btn btn-secondary" onClick={() => download('borderday-day-import-template.csv', dayImportTemplateCsv(), 'text/csv;charset=utf-8')}>
          {copy.template}
        </button>
      </p>
      <label>
        {copy.choose}
        <input
          type="file"
          accept=".csv,text/csv"
          style={{ display: 'block', marginTop: '0.35rem' }}
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </label>
      {fileName && <p className="meta">{fileName}</p>}
      {preview?.fileError === 'empty' && <p role="alert">{copy.empty}</p>}
      {preview?.fileError === 'bad_file' && <p role="alert">{copy.badFile}</p>}
      {preview?.fileError === 'too_big' && <p role="alert">{t(copy.tooBig, { max: MAX_IMPORT_ROWS })}</p>}
      {preview && !preview.fileError && (
        <>
          <p role="status">{t(copy.summary, counts)}</p>
          {preview.rows.length > PREVIEW_CAP && (
            <p className="meta">{t(copy.showing, { shown: PREVIEW_CAP, total: preview.rows.length })}</p>
          )}
          <div style={{ overflowX: 'auto', maxHeight: '24rem' }}>
            <table className="counter-table">
              <caption className="meta" style={{ textAlign: 'left' }}>
                {copy.previewCaption}
              </caption>
              <thead>
                <tr>
                  <th>{copy.colEmail}</th>
                  <th>{copy.colDate}</th>
                  <th>{copy.colType}</th>
                  <th>{copy.colStatus}</th>
                  <th>{copy.colDetail}</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((row) => {
                  const remote = serverByIndex.get(row.index);
                  const status = remote?.status ?? row.status;
                  const code = remote ? remote.code : row.code;
                  return (
                    <tr key={row.index}>
                      <td>{row.email}</td>
                      <td>{row.workDate}</td>
                      <td>{row.dayType}</td>
                      <td>{statusLabel(d, status)}</td>
                      <td>{detail(d, code)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="meta">{copy.confirmHint}</p>
          <p>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy || counts.ready === 0 || !!server}
              onClick={() => void confirm()}
            >
              {busy ? copy.working : t(copy.confirm, { count: counts.ready })}
            </button>
          </p>
          {counts.ready === 0 && <p role="status">{copy.noneReady}</p>}
        </>
      )}
      {server && (
        <p role="status">
          {t(copy.done, { imported: server.imported, skipped: server.skipped, errors: server.errors })}
        </p>
      )}
      {failure && <p role="alert">{failure}</p>}
    </div>
  );
}
