import { Router } from 'express';
import { permissionController } from './permission.controller.js';
import { validate } from '../../middlewares/validator.middleware.js';
import { browseQuerySchema } from '../../lib/browse-query/schema.js';
import {
  updatePermissionSchema,
  upsertPermissionsSchema,
} from './permission.schema.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermissions } from '../../middlewares/permission.middleware.js';

const r = Router(),
  controller = permissionController;

r.get(
  '/release',
  requireAuth(),
  requirePermissions('permission.release'),
  controller.release
);

r.patch(
  '/upsert-many',
  requireAuth(),
  requirePermissions('permission.upsert-many'),
  validate({ body: upsertPermissionsSchema }),
  controller.upsertMany
);

r.get(
  '/browse',
  requireAuth(),
  requirePermissions('permission.browse'),
  validate({ query: browseQuerySchema }),
  controller.browse
);

r.get(
  '/read/:id',
  requireAuth(),
  requirePermissions('permission.read'),
  controller.read
);

r.patch(
  '/update/:id',
  requireAuth(),
  requirePermissions('permission.update'),
  validate({ body: updatePermissionSchema }),
  controller.update
);

const permissionRouter = r;
export default permissionRouter;
