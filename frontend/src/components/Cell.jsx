import { memo } from 'react';
import './Cell.css';

function Cell({ cell, marked, inLine, onToggle, label }) {
  const cls = ['cell', marked && 'is-marked', inLine && 'is-line', cell.free && 'is-free'].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      className={cls}
      aria-pressed={marked}
      aria-label={cell.free ? 'Free space' : `${label} ${cell.value}`}
      onClick={onToggle}
      disabled={cell.free}
    >
      <span className="cell__value">{cell.free ? '★' : cell.value}</span>
      {cell.free && <span className="cell__free">free</span>}
      <span className="cell__dab" aria-hidden="true" />
    </button>
  );
}

export default memo(Cell);
