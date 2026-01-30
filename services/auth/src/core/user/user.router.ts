import { Router } from 'express';
import { userController } from './user.controller.js';
import { validate } from '../../middlewares/validator.middleware.js';
import { browseQuerySchema } from '../../lib/browse-query/schema.js';
import { createUserSchema, updateUserSchema } from './user.schema.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermissions } from '../../middlewares/permission.middleware.js';

const r = Router(),
  controller = userController;

r.get(
  '/browse',
  requireAuth(),
  requirePermissions('user.browse'),
  validate({ query: browseQuerySchema }),
  controller.browse
);

r.post(
  '/create',
  requireAuth(),
  requirePermissions('user.create'),
  validate({ body: createUserSchema }),
  controller.create
);

r.get(
  '/read/:id',
  requireAuth(),
  requirePermissions('user.read'),
  controller.read
);

r.patch(
  '/update/:id',
  requireAuth(),
  requirePermissions('user.update'),
  validate({ body: updateUserSchema }),
  controller.update
);

r.delete(
  '/delete-hard/:id',
  requireAuth(),
  requirePermissions('user.delete'),
  controller.deleteHard
);

const userRouter = r;
export default userRouter;
