/**
 * Thin client for the Bingo host (hyeumine.com). Only this file knows the upstream URLs.
 */
import { config } from '../config.js';
import { HttpError } from '../utils/httpError.js';

async function upstreamGet(pathname, params) {
  const url = new URL(pathname, `${config.upstreamBase}/`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(config.upstreamTimeoutMs) });
  } catch (err) {
    const timedOut = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    throw new HttpError(
      504,
      timedOut ? 'Bingo server timed out' : 'Could not reach the Bingo server',
      'UPSTREAM_UNREACHABLE'
    );
  }
  if (!res.ok) {
    throw new HttpError(502, `Bingo server answered with HTTP ${res.status}`, 'UPSTREAM_HTTP_ERROR');
  }
  return (await res.text()).trim();
}

/** Returns the parsed JSON card payload, or null when the game code doesn't exist. */
export async function fetchCard(bcode) {
  const body = await upstreamGet('getcard.php', { bcode });
  if (body === '0' || body === '') return null;
  try {
    return JSON.parse(body);
  } catch {
    throw new HttpError(502, 'Bingo server returned something that is not JSON', 'BAD_UPSTREAM_JSON');
  }
}

/** true = winning card. 0 / unknown token / not winning all come back as false. */
export async function checkWin(playcardToken) {
  const body = await upstreamGet('checkwin.php', { playcard_token: playcardToken });
  return body === '1';
}
