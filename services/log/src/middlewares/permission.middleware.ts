import type { NextFunction, Request, Response } from 'express';

const requirePermissions =
  (...permissions: string[]) =>
  async (req: Request<{}, {}, {}, {}>, _: Response, next: NextFunction) => {
    next();
  };

export { requirePermissions };
