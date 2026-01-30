export const LogEventLevel = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export type LogEventLevel = (typeof LogEventLevel)[keyof typeof LogEventLevel];

export const LogEventActorType = {
  SYSTEM: 'system',
  USER: 'user',
  API: 'api',
  SERVICE: 'service',
} as const;

export type LogEventActorType =
  (typeof LogEventActorType)[keyof typeof LogEventActorType];
