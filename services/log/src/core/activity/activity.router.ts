import { Router } from 'express';
import { validate } from '../../middlewares/validator.middleware.js';
import { browseQuerySchema } from '../../lib/browse-query/schema.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermissions } from '../../middlewares/permission.middleware.js';
import { activityController } from './activity.controller.js';

const r = Router(),
  controller = activityController;

r.get(
  '/browse',
  requireAuth(),
  requirePermissions('activity.browse'),
  validate({ query: browseQuerySchema }),
  controller.browse
);

r.get(
  '/read/:id',
  requireAuth(),
  requirePermissions('activity.read'),
  controller.read
);

const activityRouter = r;
export default activityRouter;
