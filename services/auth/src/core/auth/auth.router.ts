import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middlewares/validator.middleware.js';
import { SignInSchema, SignUpSchema } from './auth.schema.js';
import strategies from './strategies/index.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const r = Router(),
  controller = authController;

r.get('/verify', controller.verify);

r.post('/signup', validate({ body: SignUpSchema }), controller.signUp);

r.post(
  '/signin',
  validate({ body: SignInSchema }),
  strategies.authenticate('local', { session: false }),
  controller.signIn
);

r.post('/refresh', controller.refreshToken);

r.delete('/signout', controller.signOut);

r.delete('/signout-all', requireAuth(), controller.signOutAll);

const authRouter = r;
export default authRouter;
