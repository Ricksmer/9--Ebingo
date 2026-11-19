# Lucky Hall — Multi-Card Bingo

React frontend + Express backend for the Bingo REST game.
Join a game with a game code, get as many cards as you like, dab numbers, and ask the host whether each card is a winner.

## Requirements

- Node.js 18 or newer (`node -v`)
- Internet access to `www.hyeumine.com` (the real Bingo host)

## Run it

From this folder:

```bash
npm run install:all     # installs root, backend and frontend dependencies
npm run dev             # starts API on :4000 and the React dev server on :5173
```

Open **http://localhost:5173**, enter the game code (e.g. `HEelhJos`), pick how many cards, and press **Join & deal**.

### Single-server mode (production-style)

```bash
npm run install:all
npm start               # builds the React app, then Express serves it all on :4000
```

Open **http://localhost:4000**.

### Run the tests

```bash
npm test                # backend: card parsing + API tests against a built-in mock Bingo host
```

## How it works

```
Browser (React)  ──/api──▶  Express backend  ──▶  http://www.hyeumine.com
                            (proxy + validation)    getcard.php / checkwin.php
```

The backend exists so the browser never has to call hyeumine.com directly (avoids CORS/mixed-content problems) and so the raw card JSON is converted to one predictable shape.

| Endpoint | Does |
|---|---|
| `GET /api/cards?bcode=CODE` | Calls `getcard.php`. Returns `{ bcode, token, grid }` (404 if the game code doesn't exist) |
| `GET /api/cards/:token/win` | Calls `checkwin.php`. Returns `{ win: true \| false }` |
| `GET /api/health` | Shows the upstream host in use |

Every "Join & deal" request asks for each card separately, so one player can hold many cards (from the same or different games) at once. Cards, marks and win status are saved in `localStorage` and survive a refresh.

## Project layout

```
backend/
  src/
    server.js                  start-up
    app.js                     express wiring (+ serves frontend/dist if built)
    config.js                  port, upstream URL, timeouts
    routes/bingo.routes.js
    controllers/bingo.controller.js
    services/hyeumine.service.js   the only file that knows the upstream URLs
    utils/normalizeCard.js         converts upstream JSON -> 5x5 grid
    middleware/errorHandler.js
  scripts/mock-upstream.js     offline fake of hyeumine.com
  tests/                       node:test suites
frontend/
  src/
    api/bingoApi.js            fetch wrappers
    hooks/useCards.js          all card state (reducer + localStorage)
    utils/lines.js             local line detection (gold highlight)
    components/                Masthead, JoinPanel, CardBoard, BingoCard, Cell (each with its own .css)
    styles/                    tokens.css (design variables), base.css (background/typography)
```

## Configuration

| Env var | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | Backend port |
| `UPSTREAM_BASE` | `http://www.hyeumine.com` | Bingo host |
| `UPSTREAM_TIMEOUT_MS` | `10000` | Upstream request timeout |

## Practising offline

```bash
node backend/scripts/mock-upstream.js            # fake host on :4010
UPSTREAM_BASE=http://localhost:4010 npm run dev --prefix backend
npm run dev --prefix frontend
```

Mock game codes: `HEelhJos`, `DEMO`, and `WINNER` (its cards always check as winners).

## If cards come out wrong

The assignment text didn't include the sample getcard JSON, so `backend/src/utils/normalizeCard.js` accepts the common layouts:

- `{ "playcard_token": "...", "card": { "B": [5], "I": [5], "N": [5], "G": [5], "O": [5] } }`
- `{ "playcard_token": "...", "card": [[5],[5],[5],[5],[5]] }` (rows)
- `{ "playcard_token": "...", "card": [25 numbers] }` (flat)

The free center is detected as `0`, `null`, `""` or `"FREE"`. If the real response uses different key names, open `http://localhost:4000/api/cards?bcode=YOURCODE` in a browser. A 502 `BAD_UPSTREAM_CARD` error means the shape wasn't recognised. Add the key names to `TOKEN_KEYS` / `CARD_KEYS` at the top of that file.
