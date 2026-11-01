import { useState } from 'react';
import { t, type Dict, type Lang } from '../i18n';
import {
  formatReceivedAt,
  submitContractRequest,
  type ContractRequestKind,
  type ContractRequestResult,
} from '../lib/contractRequest';

export interface RequestValues {
  name: string;
  email: string;
  reference: string;
  date: string;
}

export function mailtoHref(to: string, subject: string, body: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const LOCALES: Record<Lang, string> = { en: 'en-GB', fr: 'fr-CH', de: 'de-CH', it: 'it-CH', nl: 'nl-BE' };

/**
 * Fields, then a confirm step that stores the request on the server and shows when it was received.
 * If that fails, the prepared email appears instead, so a person can always still make the request.
 */
export default function RequestForm(props: {
  d: Dict;
  lang: Lang;
  kind: ContractRequestKind;
  /** Mailbox for the email route. */
  to: string;
  subject: string;
  /** Receives the field values; returns the message text. */
  body: (values: RequestValues) => string;
  submitLabel: string;
  confirmLabel: string;
  /** Shown only when the request needs a date, e.g. the order date of a withdrawal. */
  dateLabel?: string;
  initialEmail?: string;
}) {
  const { d, lang, kind, to, subject, body, submitLabel, confirmLabel, dateLabel, initialEmail } = props;
  const f = d.mailForm;
  const [values, setValues] = useState<RequestValues>({ name: '', email: initialEmail ?? '', reference: '', date: '' });
  const [reviewing, setReviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<ContractRequestResult | null>(null);
  const set = (key: keyof RequestValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues({ ...values, [key]: e.target.value });

  async function confirm() {
    setSending(true);
    setResult(
      await submitContractRequest({
        kind,
        name: values.name,
        email: values.email,
        orderReference: values.reference,
        orderDate: values.date,
        lang,
      }),
    );
    setSending(false);
  }

  if (result?.ok) {
    const { date, time } = formatReceivedAt(result.receivedAt, LOCALES[lang]);
    return (
      <div className="card stack-form">
        <h2 role="status">{f.receivedTitle}</h2>
        <p>{t(f.receivedBody, { date, time })}</p>
        <p>{t(f.receivedReference, { id: result.id })}</p>
        <p>{result.receipt === 'sent' ? t(f.receiptSent, { email: values.email }) : f.receiptNotSent}</p>
      </div>
    );
  }

  if (reviewing) {
    const text = body(values);
    const failed = result?.ok === false;
    return (
      <div className="card stack-form">
        <h2 role="status">{f.reviewTitle}</h2>
        <p className="pre-line">{text}</p>
        {!failed && (
          <button type="button" className="btn btn-primary" disabled={sending} onClick={() => void confirm()}>
            {sending ? f.sending : confirmLabel}
          </button>
        )}
        {failed && (
          <>
            <p role="alert">{f.failed}</p>
            <p>
              <strong>{f.to}</strong> {to}
              <br />
              <strong>{f.subject}</strong> {subject}
            </p>
            <a className="btn btn-primary" href={mailtoHref(to, subject, text)}>
              {f.send}
            </a>
            <p className="meta">{t(f.manual, { to })}</p>
          </>
        )}
        <button
          type="button"
          className="btn btn-ghost"
          disabled={sending}
          onClick={() => {
            setReviewing(false);
            setResult(null);
          }}
        >
          {f.back}
        </button>
      </div>
    );
  }

  return (
    <form
      className="card stack-form"
      onSubmit={(e) => {
        e.preventDefault();
        setReviewing(true);
      }}
    >
      <label>
        {f.name}
        <input value={values.name} onChange={set('name')} required autoComplete="name" maxLength={200} />
      </label>
      <label>
        {f.email}
        <input type="email" value={values.email} onChange={set('email')} required autoComplete="email" maxLength={254} />
      </label>
      <label>
        {f.reference}
        <input value={values.reference} onChange={set('reference')} aria-describedby="request-reference-hint" maxLength={200} />
        <span id="request-reference-hint" className="meta">
          {f.referenceHint}
        </span>
      </label>
      {dateLabel && (
        <label>
          {dateLabel}
          <input type="date" value={values.date} onChange={set('date')} />
        </label>
      )}
      <button className="btn btn-primary" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
