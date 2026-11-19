import { useCallback, useEffect, useReducer, useRef } from 'react';
import { requestCard, checkWin } from '../api/bingoApi.js';
import { cellKey } from '../utils/lines.js';

const STORAGE_KEY = 'luckyhall.cards.v1';

function freeMarks(grid) {
  const marks = [];
  grid.forEach((row, r) => row.forEach((cell, c) => cell.free && marks.push(cellKey(r, c))));
  return marks;
}

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // A check that was mid-flight when the page closed is no longer running.
    return parsed.map((c) => (c.status === 'checking' ? { ...c, status: 'idle' } : c));
  } catch {
    return [];
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return [...state, ...action.cards];
    case 'remove':
      return state.filter((c) => c.token !== action.token);
    case 'clear':
      return [];
    case 'toggle':
      return state.map((c) => {
        if (c.token !== action.token) return c;
        const has = c.marks.includes(action.key);
        return {
          ...c,
          marks: has ? c.marks.filter((k) => k !== action.key) : [...c.marks, action.key],
          // Marks changed, so an earlier "not yet" verdict is stale.
          status: c.status === 'nope' || c.status === 'error' ? 'idle' : c.status,
          message: '',
        };
      });
    case 'status':
      return state.map((c) =>
        c.token === action.token ? { ...c, status: action.status, message: action.message ?? '' } : c
      );
    default:
      return state;
  }
}

export function useCards() {
  const [cards, dispatch] = useReducer(reducer, undefined, load);
  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch {
      /* storage full or blocked: play on without persistence */
    }
  }, [cards]);

  /** Join a game and pull `count` cards in parallel. Resolves { added, failed, firstError }. */
  const join = useCallback(async (bcode, count) => {
    const results = await Promise.allSettled(Array.from({ length: count }, () => requestCard(bcode)));
    const cards = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => ({
        ...r.value,
        marks: freeMarks(r.value.grid),
        status: 'idle',
        message: '',
        joinedAt: Date.now(),
      }))
      // The server should never repeat a token, but never show the same card twice.
      .filter((c) => !cardsRef.current.some((existing) => existing.token === c.token));

    if (cards.length) dispatch({ type: 'add', cards });
    const firstFailure = results.find((r) => r.status === 'rejected');
    return {
      added: cards.length,
      failed: results.length - cards.length,
      firstError: firstFailure?.reason?.message ?? null,
    };
  }, []);

  const toggle = useCallback((token, key) => dispatch({ type: 'toggle', token, key }), []);
  const remove = useCallback((token) => dispatch({ type: 'remove', token }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  const check = useCallback(async (token) => {
    dispatch({ type: 'status', token, status: 'checking' });
    try {
      const win = await checkWin(token);
      dispatch({ type: 'status', token, status: win ? 'win' : 'nope' });
    } catch (err) {
      dispatch({ type: 'status', token, status: 'error', message: err.message });
    }
  }, []);

  const checkAll = useCallback(
    () =>
      Promise.all(
        cardsRef.current.filter((c) => c.status !== 'win' && c.status !== 'checking').map((c) => check(c.token))
      ),
    [check]
  );

  return { cards, join, toggle, remove, clear, check, checkAll };
}
