import { useState } from 'react';
import { t, type Dict } from '../i18n';

export interface RequestValues {
  name: string;
  email: string;
  reference: string;
  date: string;
}

export function mailtoHref(to: string, subject: string, body: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Fields, then a confirm step, then the user's own mail app. Nothing leaves the browser from here:
 * the request is made when the user sends the prepared email.
 */
export default function RequestMailForm(props: {
  d: Dict;
  to: string;
  subject: string;
  /** Receives the field values; returns the message body. */
  body: (values: RequestValues) => string;
  submitLabel: string;
  confirmLabel: string;
  /** Shown only when the request needs a date, e.g. the order date of a withdrawal. */
  dateLabel?: string;
  initialEmail?: string;
}) {
  const { d, to, subject, body, submitLabel, confirmLabel, dateLabel, initialEmail } = props;
  const f = d.mailForm;
  const [values, setValues] = useState<RequestValues>({ name: '', email: initialEmail ?? '', reference: '', date: '' });
  const [reviewing, setReviewing] = useState(false);
  const set = (key: keyof RequestValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues({ ...values, [key]: e.target.value });

  if (reviewing) {
    const text = body(values);
    return (
      <div className="card stack-form">
        <h2 role="status">{f.reviewTitle}</h2>
        <p>
          <strong>{f.to}</strong> {to}
          <br />
          <strong>{f.subject}</strong> {subject}
        </p>
        <p className="pre-line">{text}</p>
        <a className="btn btn-primary" href={mailtoHref(to, subject, text)}>
          {confirmLabel}
        </a>
        <p className="meta">{t(f.manual, { to })}</p>
        <button type="button" className="btn btn-ghost" onClick={() => setReviewing(false)}>
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
        <input value={values.name} onChange={set('name')} required autoComplete="name" />
      </label>
      <label>
        {f.email}
        <input type="email" value={values.email} onChange={set('email')} required autoComplete="email" />
      </label>
      <label>
        {f.reference}
        <input value={values.reference} onChange={set('reference')} aria-describedby="request-reference-hint" />
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
