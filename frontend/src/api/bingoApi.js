const BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(path) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`);
  } catch {
    throw new Error('Cannot reach the Bingo backend. Is it running?');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

/** Ask the game for one new card. Resolves { bcode, token, grid }. */
export const requestCard = (bcode) => request(`/cards?bcode=${encodeURIComponent(bcode)}`);

/** Ask the server whether a card is a winner. Resolves boolean. */
export const checkWin = async (token) =>
  (await request(`/cards/${encodeURIComponent(token)}/win`)).win === true;
