/**
 * Turns whatever the upstream getcard.php returns into a predictable shape:
 *
 *   { token: string, grid: Cell[5][5] }   where Cell = { value: number|string|null, free: boolean }
 *
 * The upstream payload layout isn't documented in the assignment text, so this accepts
 * the common layouts:
 *   1. { playcard_token, card: { B:[5], I:[5], N:[5], G:[5], O:[5] } }   (columns by letter)
 *   2. { playcard_token, card: [[5],[5],[5],[5],[5]] }                    (rows)
 *   3. { playcard_token, card: [25 numbers] }                             (row-major flat)
 * The card may also sit at the top level, or under "data" / "numbers" / "playcard".
 */
import { HttpError } from './httpError.js';

const LETTERS = ['B', 'I', 'N', 'G', 'O'];
const SIZE = 5;
const TOKEN_KEYS = ['playcard_token', 'playcardToken', 'token', 'playcard'];
const CARD_KEYS = ['card', 'data', 'numbers', 'playcard_data', 'grid'];

const isFreeValue = (v) =>
  v === null ||
  v === undefined ||
  v === 0 ||
  v === '0' ||
  v === '' ||
  (typeof v === 'string' && v.trim().toLowerCase() === 'free');

function findToken(raw) {
  for (const k of TOKEN_KEYS) {
    if (typeof raw[k] === 'string' && raw[k]) return raw[k];
  }
  return null;
}

function findCardData(raw) {
  if (Array.isArray(raw)) return raw;
  for (const k of CARD_KEYS) {
    if (raw[k] !== undefined && typeof raw[k] === 'object' && raw[k] !== null) return raw[k];
  }
  // Letters directly on the top-level object.
  if (LETTERS.every((l) => Object.keys(raw).some((k) => k.toUpperCase() === l))) return raw;
  return null;
}

function toRows(data) {
  // Columns keyed by letter.
  if (!Array.isArray(data)) {
    const keyFor = (letter) => Object.keys(data).find((k) => k.toUpperCase() === letter);
    const cols = LETTERS.map((l) => data[keyFor(l)]);
    if (cols.every((c) => Array.isArray(c) && c.length === SIZE)) {
      return Array.from({ length: SIZE }, (_, r) => cols.map((col) => col[r]));
    }
    return null;
  }
  // 5 rows of 5.
  if (data.length === SIZE && data.every((r) => Array.isArray(r) && r.length === SIZE)) {
    return data;
  }
  // 25 flat.
  if (data.length === SIZE * SIZE && data.every((v) => typeof v !== 'object' || v === null)) {
    return Array.from({ length: SIZE }, (_, r) => data.slice(r * SIZE, r * SIZE + SIZE));
  }
  return null;
}

export function normalizeCard(raw) {
  if (raw === null || typeof raw !== 'object') {
    throw new HttpError(502, 'Unexpected card format from Bingo server', 'BAD_UPSTREAM_CARD');
  }

  const token = findToken(raw);
  const data = findCardData(raw);
  const rows = data ? toRows(data) : null;

  if (!token || !rows) {
    throw new HttpError(502, 'Could not understand the card returned by the Bingo server', 'BAD_UPSTREAM_CARD');
  }

  const grid = rows.map((row, r) =>
    row.map((value, c) => {
      const isCenter = r === 2 && c === 2;
      const free = isCenter ? isFreeValue(value) : typeof value === 'string' && value.trim().toLowerCase() === 'free';
      return { value: free ? null : value, free };
    })
  );

  return { token, grid };
}
