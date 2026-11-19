import { createApp } from './app.js';
import { config } from './config.js';

createApp().listen(config.port, () => {
  console.log(`Bingo API listening on http://localhost:${config.port}`);
  console.log(`Upstream Bingo host: ${config.upstreamBase}`);
});
