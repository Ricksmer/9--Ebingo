import { fetchCard, checkWin } from '../services/hyeumine.service.js';
import { normalizeCard } from '../utils/normalizeCard.js';
import { HttpError } from '../utils/httpError.js';

const CODE_RE = /^[A-Za-z0-9_-]{1,64}$/;

/** GET /api/cards?bcode=XXXX  -> a fresh card for the game */
export async function getCard(req, res) {
  const bcode = String(req.query.bcode ?? '').trim();
  if (!CODE_RE.test(bcode)) throw new HttpError(400, 'Enter a valid game code', 'BAD_CODE');

  const raw = await fetchCard(bcode);
  if (raw === null) throw new HttpError(404, `No game found for code "${bcode}"`, 'GAME_NOT_FOUND');

  const { token, grid } = normalizeCard(raw);
  res.json({ bcode, token, grid });
}

/** GET /api/cards/:token/win  -> { win: boolean } */
export async function getWinStatus(req, res) {
  const { token } = req.params;
  if (!CODE_RE.test(token)) throw new HttpError(400, 'Invalid card token', 'BAD_TOKEN');

  const win = await checkWin(token);
  res.json({ token, win });
}
