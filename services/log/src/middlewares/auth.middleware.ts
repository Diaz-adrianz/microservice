import type { NextFunction, Request, Response } from 'express';
import { Unauthenticated } from './error.middleware';

const requireAuth = () => {
  return async (
    req: Request<{}, {}, {}, {}>,
    _: Response,
    next: NextFunction
  ) => {
    if (!req.headers['x-user-id']) throw new Unauthenticated();
    next();
  };
};

export { requireAuth };
