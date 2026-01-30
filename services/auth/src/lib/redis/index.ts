import { Redis } from 'ioredis';
import { env } from '../../config/env.js';

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  username: env.REDIS_USER,
  password: env.REDIS_PASS,
  keyPrefix: env.REDIS_KEY_PREFIX,
});

redis.on('ready', () => {
  console.log('🧮 Redis ready');
});

redis.on('error', (err) => {
  console.error('🧮 Redis error', err);
});

export { redis };
