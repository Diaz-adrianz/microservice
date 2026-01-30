import type { NextFunction, Request, Response } from 'express';
import { authService } from '../core/auth/auth.service.js';

const requireAuth = () => {
  return async (
    req: Request<{}, {}, {}, {}>,
    _: Response,
    next: NextFunction
  ) => {
    const token = req.headers.authorization?.split(' ')[1],
      payload = await authService.verifyAccess(token ?? '');

    req.user = {
      id: payload.sub,
      roles: payload.rls,
    };

    next();
  };
};

export { requireAuth };
