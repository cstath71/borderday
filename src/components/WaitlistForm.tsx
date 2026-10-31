import { useState } from 'react';
import type { Dict } from '../i18n';

export default function WaitlistForm({ d }: { d: Dict }) {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      setMsg(d.waitlist.invalid);
      return;
    }
    try {
      const key = 'borderday_waitlist_local';
      const prev = JSON.parse(localStorage.getItem(key) || '[]') as string[];
      if (!prev.includes(email)) prev.push(email);
      localStorage.setItem(key, JSON.stringify(prev));
    } catch {
      /* ignore */
    }
    setMsg(`${d.waitlist.thanks} ${d.waitlist.localOnly}`);
    setEmail('');
  }

  return (
    <form className="waitlist" onSubmit={submit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={d.home.waitlistPlaceholder}
        aria-label={d.home.waitlistPlaceholder}
        required
      />
      <button className="btn btn-primary" type="submit">
        {d.home.waitlistButton}
      </button>
      {msg && <p style={{ flexBasis: '100%', margin: 0, fontSize: '0.9rem' }}>{msg}</p>}
    </form>
  );
}
