import { Request } from 'express';
import { logger } from '../../logger/index.js';
import RabbitMQ from '../index.js';
import { QUEUES } from '../queues.js';
import { now } from '../../../utils/date.js';

type ActivityLevel = 'info' | 'warn' | 'error';
type ActivityActorType = 'system' | 'user' | 'api' | 'service';

export type ActivityPayload = {
  level: ActivityLevel;
  message: string;
  actorType: ActivityActorType;
  ts?: string;
  service?: string;
  actorId?: string;
  actorName?: string;
  actorRoles?: string;
  actorIp?: string;
  userAgent?: string;
  resource?: string;
  resourceId?: string;
  action?: string;
  data?: Record<string, any>;
};

export const createActivity = async (payload: ActivityPayload[]) => {
  try {
    const mq = await RabbitMQ.getInstance();
    mq.produce(
      QUEUES.LOG_ACTIVITY_CREATE,
      payload.map((p) => ({
        ...p,
        service: 'auth',
      }))
    );
  } catch (error) {
    logger.error('[Producer] ', error);
  }
};

export const createActivityByReq = async (
  req: Request,
  payload: {
    [K in keyof ActivityPayload]?: ActivityPayload[K];
  }
) => {
  try {
    const event: ActivityPayload = {
      level: payload.level ?? 'info',
      message: payload.message ?? '-',
      actorType: (payload.actorType ?? req.user) ? 'user' : 'system',
      ts: now().toISOString(),
      service: 'auth',
      actorIp: payload.actorIp ?? req.ip,
      userAgent: payload.userAgent ?? req.headers['user-agent'],
      resource: payload.resource,
      resourceId: payload.resourceId,
      action: payload.actorId,
    };

    const isUser = req.user && event.actorType == 'user';
    event.actorId = event.actorId ?? (isUser ? req.user?.id : undefined);
    event.actorRoles =
      event.actorRoles ?? (isUser ? req.user?.roles.join(',') : undefined);

    event.data = payload.data ?? {
      url: req.originalUrl ?? req.url,
      query: req.validQuery ?? req.query,
      body: req.body,
    };

    await createActivity([{ ...event }]);
  } catch (error) {
    logger.error('[Producer] ', error);
  }
};
