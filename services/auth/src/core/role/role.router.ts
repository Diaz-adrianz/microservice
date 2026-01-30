import { Router } from 'express';
import { roleController } from './role.controller.js';
import { validate } from '../../middlewares/validator.middleware.js';
import { browseQuerySchema } from '../../lib/browse-query/schema.js';
import { createRoleSchema, updateRoleSchema } from './role.schema.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermissions } from '../../middlewares/permission.middleware.js';

const r = Router(),
  controller = roleController;

r.get(
  '/browse',
  requireAuth(),
  requirePermissions('role.browse'),
  validate({ query: browseQuerySchema }),
  controller.browse
);

r.post(
  '/create',
  requireAuth(),
  requirePermissions('role.create'),
  validate({ body: createRoleSchema }),
  controller.create
);

r.get(
  '/read/:id',
  requireAuth(),
  requirePermissions('role.read'),
  controller.read
);

r.patch(
  '/update/:id',
  requireAuth(),
  requirePermissions('role.update'),
  validate({ body: updateRoleSchema }),
  controller.update
);

r.delete(
  '/delete-hard/:id',
  requireAuth(),
  requirePermissions('role.delete'),
  controller.deleteHard
);

const roleRouter = r;
export default roleRouter;
