import { logger } from '../../logger';
import RabbitMQ from '../index';
import { QUEUES } from '../queues';
import { logActivityCreate } from './activity-create.consumer';
import { authPermissionsReleased } from './permissions-released.consumer';

async function bootstrap() {
  const mq = await RabbitMQ.getInstance();

  await mq.consume(QUEUES.AUTH_PERMISSIONS_RELEASED, authPermissionsReleased);
  await mq.consume(QUEUES.LOG_ACTIVITY_CREATE, logActivityCreate);

  logger.info('[RabbitMQ] consumers running');
}

bootstrap().catch(logger.error);
