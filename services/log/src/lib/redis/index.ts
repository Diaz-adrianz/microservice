import { Redis } from 'ioredis';
import { env } from '../../config/env.js';
import { logger } from '../logger/index.js';

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  username: env.REDIS_USER,
  password: env.REDIS_PASS,
  keyPrefix: env.REDIS_KEY_PREFIX,
});

redis.on('ready', () => {
  logger.info('[Redis] connected');
});

redis.on('error', (err) => {
  logger.error('[Redis] ', err);
});

export { redis };
