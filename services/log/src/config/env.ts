import dotenv from 'dotenv';
dotenv.config();

export const getEnv = (key: string, required: boolean = false): string => {
  const value = process.env[key];
  if (value == undefined && required)
    throw new Error(`Missing required environment variable: ${key}`);
  return value ?? '';
};

export const env = {
  NODE_ENV: getEnv('NODE_ENV', true),
  APP_NAME: getEnv('APP_NAME', true),
  PORT: parseInt(getEnv('PORT', true)),

  REDIS_HOST: getEnv('REDIS_HOST') ?? '127.0.0.1',
  REDIS_PORT: parseInt(getEnv('REDIS_PORT') ?? '6379'),
  REDIS_USER: getEnv('REDIS_USER'),
  REDIS_PASS: getEnv('REDIS_PASS'),
  REDIS_KEY_PREFIX:
    getEnv('REDIS_KEY_PREFIX') || `${getEnv('APP_NAME', true)}:`,

  get isDevelopment() {
    return this.NODE_ENV === 'development';
  },
};
