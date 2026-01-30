import { Router } from 'express';
import { accountController } from './account.controller.js';
import { validate } from '../../middlewares/validator.middleware.js';
import { browseQuerySchema } from '../../lib/browse-query/schema.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermissions } from '../../middlewares/permission.middleware.js';

const r = Router(),
  controller = accountController;

r.get(
  '/browse',
  requireAuth(),
  requirePermissions('account.browse'),
  validate({ query: browseQuerySchema }),
  controller.browse
);

r.get(
  '/read/:id',
  requireAuth(),
  requirePermissions('account.read'),
  controller.read
);

r.delete(
  '/delete-hard/:id',
  requireAuth(),
  requirePermissions('account.delete'),
  controller.deleteHard
);

const accountRouter = r;
export default accountRouter;
