import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createMockUpstream } from '../scripts/mock-upstream.js';

let upstream;
let api;
let base;

before(async () => {
  upstream = createMockUpstream();
  await new Promise((r) => upstream.listen(0, r));
  process.env.UPSTREAM_BASE = `http://localhost:${upstream.address().port}`;

  // Import after env is set so config picks up the mock host.
  const { createApp } = await import('../src/app.js');
  api = createApp().listen(0);
  await new Promise((r) => api.once('listening', r));
  base = `http://localhost:${api.address().port}`;
});

after(() => {
  api.close();
  upstream.close();
});

test('GET /api/cards returns a normalized card', async () => {
  const res = await fetch(`${base}/api/cards?bcode=HEelhJos`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.bcode, 'HEelhJos');
  assert.ok(body.token);
  assert.equal(body.grid.length, 5);
  assert.ok(body.grid.every((row) => row.length === 5));
  assert.equal(body.grid[2][2].free, true);
});

test('unknown game code -> 404', async () => {
  const res = await fetch(`${base}/api/cards?bcode=NOPE`);
  assert.equal(res.status, 404);
  assert.equal((await res.json()).code, 'GAME_NOT_FOUND');
});

test('bad game code -> 400', async () => {
  const res = await fetch(`${base}/api/cards?bcode=${encodeURIComponent('a b/../c')}`);
  assert.equal(res.status, 400);
});

test('win check: winning card -> true, normal card -> false', async () => {
  const win = await (await fetch(`${base}/api/cards?bcode=WINNER`)).json();
  const lose = await (await fetch(`${base}/api/cards?bcode=DEMO`)).json();
  assert.equal((await (await fetch(`${base}/api/cards/${win.token}/win`)).json()).win, true);
  assert.equal((await (await fetch(`${base}/api/cards/${lose.token}/win`)).json()).win, false);
});

test('each request hands out a different card token (multiple simultaneous cards)', async () => {
  const tokens = await Promise.all(
    [1, 2, 3, 4].map(async () => (await (await fetch(`${base}/api/cards?bcode=DEMO`)).json()).token)
  );
  assert.equal(new Set(tokens).size, 4);
});
