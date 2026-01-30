import type { NextFunction, Request, Response } from 'express';
import { Unauthenticated } from './error.middleware';

const requireAuth = () => {
  return async (
    req: Request<{}, {}, {}, {}>,
    _: Response,
    next: NextFunction
  ) => {
    const userId = req.headers['x-user-id'] as string | undefined;
    if (!userId) throw new Unauthenticated();

    try {
      req.user = {
        id: userId,
        roles:
          (req.headers['x-user-roles'] as string | undefined)?.split(',') ?? [],
      };
    } catch {
      throw new Unauthenticated();
    }
    next();
  };
};

export { requireAuth };
