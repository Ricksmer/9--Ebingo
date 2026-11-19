import { useMemo } from 'react';
import Cell from './Cell.jsx';
import { cellKey, cellsInCompletedLines, completedLines } from '../utils/lines.js';
import './BingoCard.css';

const LETTERS = ['B', 'I', 'N', 'G', 'O'];

const STATUS_TEXT = {
  idle: '',
  checking: 'Asking the caller…',
  nope: 'Not a winner yet. Keep dabbing!',
  win: 'Verified winner!',
};

export default function BingoCard({ card, index, onToggle, onCheck, onRemove }) {
  const lineCells = useMemo(() => cellsInCompletedLines(card.marks), [card.marks]);
  const lineCount = useMemo(() => completedLines(card.marks).length, [card.marks]);
  const marked = useMemo(() => new Set(card.marks), [card.marks]);

  const isWin = card.status === 'win';
  const checking = card.status === 'checking';
  const message = card.status === 'error' ? card.message : STATUS_TEXT[card.status];

  return (
    <article className={`bcard ${isWin ? 'is-win' : ''}`} style={{ '--delay': `${Math.min(index, 8) * 90}ms` }}>
      <header className="bcard__head">
        <span className="bcard__no">No. {String(index + 1).padStart(2, '0')}</span>
        <span className="bcard__game" title="Game code">
          {card.bcode}
        </span>
        <button className="bcard__remove" onClick={() => onRemove(card.token)} aria-label={`Remove card ${index + 1}`}>
          ×
        </button>
      </header>

      <div className="bcard__letters" aria-hidden="true">
        {LETTERS.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>

      <div className="bcard__grid" role="group" aria-label={`Bingo card ${index + 1}`}>
        {card.grid.map((row, r) =>
          row.map((cell, c) => {
            const key = cellKey(r, c);
            return (
              <Cell
                key={key}
                cell={cell}
                label={LETTERS[c]}
                marked={marked.has(key)}
                inLine={lineCells.has(key)}
                onToggle={() => onToggle(card.token, key)}
              />
            );
          })
        )}
      </div>

      <footer className="bcard__foot">
        <p className={`bcard__msg is-${card.status}`} role="status">
          {message || (lineCount > 0 ? `${lineCount} line${lineCount > 1 ? 's' : ''} ready. Check it!` : '')}
        </p>
        <button className="bcard__check" onClick={() => onCheck(card.token)} disabled={checking || isWin}>
          {isWin ? 'Winner' : checking ? 'Checking…' : 'Check'}
        </button>
        <code className="bcard__token" title="Playcard token">
          {card.token}
        </code>
      </footer>

      {isWin && (
        <div className="bcard__stamp" aria-hidden="true">
          BINGO!
        </div>
      )}
    </article>
  );
}
