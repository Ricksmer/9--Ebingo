import BingoCard from './BingoCard.jsx';
import './CardBoard.css';

export default function CardBoard({ cards, onToggle, onCheck, onCheckAll, onRemove, onClear }) {
  if (cards.length === 0) {
    return (
      <section className="board board--empty">
        <p className="board__empty-big">No cards on the table.</p>
        <p>Enter a game code above and deal yourself in. You can hold several cards at once.</p>
      </section>
    );
  }

  const pending = cards.filter((c) => c.status !== 'win').length;

  return (
    <section className="board" aria-label="Your cards">
      <div className="board__bar">
        <h2 className="board__title">
          Your cards <span>({cards.length})</span>
        </h2>
        <div className="board__actions">
          <button onClick={onCheckAll} disabled={pending === 0}>
            Check all
          </button>
          <button
            className="board__danger"
            onClick={() => window.confirm('Remove all cards from the table?') && onClear()}
          >
            Clear table
          </button>
        </div>
      </div>

      <div className="board__grid">
        {cards.map((card, i) => (
          <BingoCard key={card.token} card={card} index={i} onToggle={onToggle} onCheck={onCheck} onRemove={onRemove} />
        ))}
      </div>
    </section>
  );
}
