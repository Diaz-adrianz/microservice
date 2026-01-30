import { Router } from 'express';
import { validate } from '../../middlewares/validator.middleware.js';
import { browseQuerySchema } from '../../lib/browse-query/schema.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermissions } from '../../middlewares/permission.middleware.js';
import { logEventController } from './logevent.controller.js';

const r = Router(),
  controller = logEventController;

r.get(
  '/browse',
  requireAuth(),
  requirePermissions('logevent.browse'),
  validate({ query: browseQuerySchema }),
  controller.browse
);

r.get(
  '/read/:id',
  requireAuth(),
  requirePermissions('logevent.read'),
  controller.read
);

const logEventRouter = r;
export default logEventRouter;
