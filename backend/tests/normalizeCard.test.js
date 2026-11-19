import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCard } from '../src/utils/normalizeCard.js';

const cols = {
  B: [1, 2, 3, 4, 5],
  I: [16, 17, 18, 19, 20],
  N: [31, 32, 0, 34, 35],
  G: [46, 47, 48, 49, 50],
  O: [61, 62, 63, 64, 65],
};

test('letter-keyed columns become row-major grid with a free center', () => {
  const { token, grid } = normalizeCard({ playcard_token: 'abc123', card: cols });
  assert.equal(token, 'abc123');
  assert.equal(grid.length, 5);
  assert.deepEqual(grid[0].map((c) => c.value), [1, 16, 31, 46, 61]);
  assert.deepEqual(grid[4].map((c) => c.value), [5, 20, 35, 50, 65]);
  assert.equal(grid[2][2].free, true);
  assert.equal(grid[2][2].value, null);
  assert.equal(grid[0][0].free, false);
});

test('rows layout and flat layout are accepted', () => {
  const rows = [0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4].map((c) => r * 5 + c + 1));
  assert.equal(normalizeCard({ token: 't', card: rows }).grid[1][0].value, 6);
  assert.equal(normalizeCard({ token: 't', card: rows.flat() }).grid[4][4].value, 25);
});

test('"FREE" string at center and top-level letters work', () => {
  const c = { ...cols, N: [31, 32, 'FREE', 34, 35], playcard_token: 'zzz' };
  const { grid } = normalizeCard(c);
  assert.equal(grid[2][2].free, true);
});

test('garbage is rejected with a 502', () => {
  assert.throws(() => normalizeCard({ playcard_token: 'x', card: [1, 2, 3] }), { status: 502 });
  assert.throws(() => normalizeCard({ card: cols }), { status: 502 });
  assert.throws(() => normalizeCard(null), { status: 502 });
});
