/**
 * Offline stand-in for hyeumine.com, following the assignment's REST spec.
 *   UPSTREAM_BASE=http://localhost:4010 npm start --prefix backend
 *
 *  - getcard.php?bcode=...        -> 0 if code unknown, else JSON card
 *  - checkwin.php?playcard_token= -> 1 if token starts with "WIN", else 0
 * Known game codes: HEelhJos, DEMO, WINNER (WINNER hands out cards that always win).
 */
import http from 'node:http';

const GAMES = new Set(['HEelhJos', 'DEMO', 'WINNER']);
const RANGES = { B: [1, 15], I: [16, 30], N: [31, 45], G: [46, 60], O: [61, 75] };

const randomToken = (prefix = '') =>
  prefix + Math.random().toString(36).slice(2, 18).padEnd(16, 'x');

function randomCard() {
  const card = {};
  for (const [letter, [lo, hi]] of Object.entries(RANGES)) {
    const pool = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    const picked = [];
    while (picked.length < 5) picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    card[letter] = picked;
  }
  card.N[2] = 0; // free space
  return card;
}

export function createMockUpstream() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('Content-Type', 'text/html');

    if (url.pathname === '/getcard.php') {
      const code = url.searchParams.get('bcode');
      if (!GAMES.has(code)) return res.end('0');
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({
          playcard_token: randomToken(code === 'WINNER' ? 'WIN' : ''),
          card: randomCard(),
        })
      );
    }
    if (url.pathname === '/checkwin.php') {
      const token = url.searchParams.get('playcard_token') || '';
      return res.end(token.startsWith('WIN') ? '1' : '0');
    }
    res.statusCode = 404;
    res.end('not found');
  });
}

// Run directly: node scripts/mock-upstream.js
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.MOCK_PORT) || 4010;
  createMockUpstream().listen(port, () => console.log(`Mock Bingo host on http://localhost:${port}`));
}
