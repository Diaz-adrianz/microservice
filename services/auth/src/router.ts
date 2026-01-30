import { Router } from 'express';
import userRouter from './core/user/user.router.js';
import roleRouter from './core/role/role.router.js';
import accountRouter from './core/account/account.router.js';
import permissionRouter from './core/permission/permission.router.js';
import authRouter from './core/auth/auth.router.js';

const r = Router();

r.use('/users', userRouter);
r.use('/roles', roleRouter);
r.use('/accounts', accountRouter);
r.use('/permissions', permissionRouter);
r.use(authRouter);

const router = r;
export default router;
