import http from 'http';

import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma/index.js';
import { redis } from './lib/redis/index.js';

const server = http.createServer(app);

server.listen(env.PORT, () => {
  console.log(`🎊 [${env.APP_NAME}] API running on port ${env.PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  if (redis.status == 'ready') await redis.quit();
  console.log(`🌼 [${env.APP_NAME}] Gracefully shutdown...`);
  process.exit(0);
});
