import { logger } from '../../logger';
import RabbitMQ from '../index';
import { QUEUES } from '../queues';
import { authPermissionsReleased } from './permissions-released.consumer';

async function bootstrap() {
  const mq = await RabbitMQ.getInstance();

  await mq.consume(QUEUES.AUTH_PERMISSIONS_RELEASED, authPermissionsReleased);

  logger.info('[RabbitMQ] consumers running');
}

bootstrap().catch(logger.error);
