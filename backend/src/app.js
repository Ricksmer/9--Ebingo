import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import bingoRoutes from './routes/bingo.routes.js';
import { errorHandler, notFoundApi } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ ok: true, upstream: config.upstreamBase }));
  app.use('/api', bingoRoutes);
  app.use('/api', notFoundApi);

  // Production: serve the built React app from the same server.
  if (fs.existsSync(path.join(config.frontendDist, 'index.html'))) {
    app.use(express.static(config.frontendDist));
    app.get('*', (_req, res) => res.sendFile(path.join(config.frontendDist, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}
