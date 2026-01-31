import * as y from 'yup';

export const ActivityLevel = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export type ActivityLevel = (typeof ActivityLevel)[keyof typeof ActivityLevel];

export const ActivityActorType = {
  SYSTEM: 'system',
  USER: 'user',
  API: 'api',
  SERVICE: 'service',
} as const;

export type ActivityActorType =
  (typeof ActivityActorType)[keyof typeof ActivityActorType];

// create one
export const createActivity = y.object({
  ts: y.string().datetime().optional(),
  level: y.string().oneOf(Object.values(ActivityLevel)).required(),
  service: y.string().required(),
  message: y.string().required(),
  actorType: y.string().oneOf(Object.values(ActivityActorType)).required(),
  actorId: y.string().optional(),
  actorName: y.string().optional(),
  actorRoles: y.string().optional(),
  actorIp: y.string().optional(),
  userAgent: y.string().optional(),
  resource: y.string().optional(),
  resourceId: y.string().optional(),
  action: y.string().optional(),
  data: y.object().unknown().optional(),
});

export type CreateActivity = y.InferType<typeof createActivity>;
