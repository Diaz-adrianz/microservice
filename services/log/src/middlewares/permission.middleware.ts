import type { NextFunction, Request, Response } from 'express';
import { Forbidden } from './error.middleware';
import { redis } from '../lib/redis';

const requirePermissions =
  (...permissions: string[]) =>
  async (req: Request<{}, {}, {}, {}>, _: Response, next: NextFunction) => {
    if (!req.user?.roles?.length) throw new Forbidden();

    const roles = req.user.roles;

    const keys = roles.map((r) => `perms:${r}`);
    const cachedArr = await redis.mget(keys);

    const permsSet = new Set<string>();

    for (let i = 0; i < roles.length; i++) {
      const cached = cachedArr[i];
      if (!cached) {
        continue;
      }
      try {
        const perms = JSON.parse(cached) as string[];
        for (const p of perms) permsSet.add(p);
      } catch {
        // silent
      }
    }

    if (!permissions.some((p) => permsSet.has(p))) throw new Forbidden();

    next();
  };

export { requirePermissions };
