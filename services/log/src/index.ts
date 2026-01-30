import http from 'http';

import app from './app.js';
import { env } from './config/env.js';

const server = http.createServer(app);

server.listen(env.PORT, () => {
  console.log(`🎊 [${env.APP_NAME}] API running on port ${env.PORT}`);
});

process.on('SIGINT', async () => {
  console.log(`🌼 [${env.APP_NAME}] Gracefully shutdown...`);
  process.exit(0);
});
