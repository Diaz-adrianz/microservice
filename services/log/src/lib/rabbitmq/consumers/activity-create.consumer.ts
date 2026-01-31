import { createActivity } from '../../../core/activity/activity.schema';
import { logger } from '../../logger';
import * as y from 'yup';
import { prisma } from '../../prisma';

const schema = y.array().of(createActivity);

export const logActivityCreate = async (data: any) => {
  try {
    if (!Array.isArray(data)) return;

    const payload = await schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      strict: true,
    });
    if (!payload) return;

    await prisma.activity.createMany({ data: payload });
    logger.info(`[Consumer] ${payload.length} activities saved`);
  } catch (error) {
    logger.error('[Consumer] ', error);
  }
};
