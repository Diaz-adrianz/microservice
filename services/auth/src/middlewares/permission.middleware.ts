import type { NextFunction, Request, Response } from 'express';
import { Forbidden } from './error.middleware.js';
import { redis } from '../lib/redis/index.js';
import { prisma } from '../lib/prisma/index.js';

const requirePermissions =
  (...permissions: string[]) =>
  async (req: Request<{}, {}, {}, {}>, _: Response, next: NextFunction) => {
    if (!req.user?.roles?.length) throw new Forbidden();

    const roles = req.user.roles;

    const keys = roles.map((r) => `perms:${r}`);
    const cachedArr = await redis.mget(keys);

    const permsSet = new Set<string>();
    const missingRoles: string[] = [];

    for (let i = 0; i < roles.length; i++) {
      const cached = cachedArr[i];
      if (!cached) {
        missingRoles.push(roles[i]);
        continue;
      }
      try {
        const perms = JSON.parse(cached) as string[];
        for (const p of perms) permsSet.add(p);
      } catch {
        missingRoles.push(roles[i]);
      }
    }

    if (missingRoles.length) {
      const dbRoles = await prisma.role.findMany({
        where: { name: { in: missingRoles }, isActive: true },
        include: {
          permissions: {
            where: { service: 'auth', isActive: true },
            select: { resource: true, action: true },
          },
        },
      });

      if (dbRoles.length !== new Set(missingRoles).size) throw new Forbidden();

      const multi = redis.multi();
      for (const r of dbRoles) {
        const perms = r.permissions.map((p) => `${p.resource}.${p.action}`);
        for (const p of perms) permsSet.add(p);
        multi.set(`perms:${r.name}`, JSON.stringify(perms));
      }
      await multi.exec();
    }

    if (!permissions.some((p) => permsSet.has(p))) throw new Forbidden();

    next();
  };

export { requirePermissions };
