import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT) || 4000,
  // Base URL of the Bingo host. Override with UPSTREAM_BASE (used by tests / mock server).
  upstreamBase: (process.env.UPSTREAM_BASE || 'http://www.hyeumine.com').replace(/\/+$/, ''),
  upstreamTimeoutMs: Number(process.env.UPSTREAM_TIMEOUT_MS) || 10000,
  // Built React app, served by Express in production.
  frontendDist: path.resolve(__dirname, '../../frontend/dist'),
};
