import './Masthead.css';

const LETTERS = ['B', 'I', 'N', 'G', 'O'];

export default function Masthead({ total, wins }) {
  return (
    <header className="masthead">
      <div className="masthead__balls" aria-hidden="true">
        {LETTERS.map((l, i) => (
          <span key={l} className={`masthead__ball masthead__ball--${i}`} style={{ '--i': i }}>
            {l}
          </span>
        ))}
      </div>
      <div className="masthead__text">
        <h1 className="masthead__title">Lucky Hall</h1>
        <p className="masthead__tag">Join a game. Play as many cards as you can juggle.</p>
      </div>
      <dl className="masthead__stats">
        <div>
          <dt>Cards</dt>
          <dd>{total}</dd>
        </div>
        <div>
          <dt>Winners</dt>
          <dd className={wins ? 'is-hot' : ''}>{wins}</dd>
        </div>
      </dl>
    </header>
  );
}
