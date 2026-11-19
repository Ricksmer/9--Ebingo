import { useCards } from './hooks/useCards.js';
import Masthead from './components/Masthead.jsx';
import JoinPanel from './components/JoinPanel.jsx';
import CardBoard from './components/CardBoard.jsx';
import './App.css';

export default function App() {
  const { cards, join, toggle, remove, clear, check, checkAll } = useCards();
  const wins = cards.filter((c) => c.status === 'win').length;

  return (
    <div className="app">
      <Masthead total={cards.length} wins={wins} />
      <main className="app__main">
        <JoinPanel onJoin={join} />
        <CardBoard
          cards={cards}
          onToggle={toggle}
          onCheck={check}
          onCheckAll={checkAll}
          onRemove={remove}
          onClear={clear}
        />
      </main>
      <footer className="app__footer">
        <span>Tap a number to dab it.</span>
        <span>“Check” asks the Bingo host if your card is a winner.</span>
      </footer>
    </div>
  );
}
