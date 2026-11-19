import { useState } from 'react';
import './JoinPanel.css';

const MAX_CARDS = 8;
const LAST_CODE_KEY = 'luckyhall.lastCode';

function readLastCode() {
  try {
    return localStorage.getItem(LAST_CODE_KEY) || '';
  } catch {
    return '';
  }
}

export default function JoinPanel({ onJoin }) {
  const [code, setCode] = useState(readLastCode);
  const [count, setCount] = useState(1);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null); // { kind: 'ok' | 'error', text }

  const submit = async (e) => {
    e.preventDefault();
    const bcode = code.trim();
    if (!bcode || busy) return;

    setBusy(true);
    setFeedback(null);
    const { added, failed, firstError } = await onJoin(bcode, count);
    setBusy(false);

    if (added > 0) {
      try {
        localStorage.setItem(LAST_CODE_KEY, bcode);
      } catch {
        /* ignore */
      }
    }
    if (added === 0) {
      setFeedback({ kind: 'error', text: firstError || 'Could not get a card.' });
    } else if (failed > 0) {
      setFeedback({ kind: 'error', text: `Got ${added} of ${count} cards. ${firstError ?? ''}` });
    } else {
      setFeedback({ kind: 'ok', text: `${added} card${added > 1 ? 's' : ''} dealt. Good luck!` });
    }
  };

  return (
    <section className="join" aria-labelledby="join-title">
      <h2 id="join-title" className="join__title">
        Take a seat
      </h2>
      <form className="join__form" onSubmit={submit}>
        <label className="join__field join__field--code">
          <span>Game code</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. HEelhJos"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={64}
            required
          />
        </label>

        <div className="join__field">
          <span id="count-label">Cards</span>
          <div className="join__stepper" role="group" aria-labelledby="count-label">
            <button type="button" onClick={() => setCount((n) => Math.max(1, n - 1))} aria-label="Fewer cards" disabled={busy || count <= 1}>
              −
            </button>
            <output aria-live="polite">{count}</output>
            <button type="button" onClick={() => setCount((n) => Math.min(MAX_CARDS, n + 1))} aria-label="More cards" disabled={busy || count >= MAX_CARDS}>
              +
            </button>
          </div>
        </div>

        <button className="join__go" type="submit" disabled={busy || !code.trim()}>
          {busy ? 'Dealing…' : 'Join & deal'}
        </button>
      </form>
      <p className={`join__feedback ${feedback ? `is-${feedback.kind}` : ''}`} role="status">
        {feedback?.text}
      </p>
    </section>
  );
}
