import BaseService from '../../base/service.base.js';
import { browseQueryParser } from '../../lib/browse-query/parser.js';
import type { BrowseQuery } from '../../lib/browse-query/schema.js';
import { prisma } from '../../lib/prisma/index.js';
import RabbitMQ from '../../lib/rabbitmq/index.js';
import { QUEUES } from '../../lib/rabbitmq/queues.js';
import type {
  UpdatePermission,
  UpsertPermissions,
} from './permission.schema.js';

class PermissionService extends BaseService {
  constructor() {
    super(prisma);
  }

  release = async (...reqServices: string[]) => {
    const services = (
      await this.db.permission.groupBy({
        by: ['service'],
        where: {
          ...(reqServices.length && {
            service: { in: reqServices },
          }),
        },
      })
    ).map((s) => s.service);

    const roles = await this.db.role.findMany({
      where: { isActive: true },
      select: {
        name: true,
        permissions: {
          where: {
            service: { in: services },
            isActive: true,
          },
          select: { service: true, resource: true, action: true },
        },
      },
    });

    const servicesMap: Record<string, Record<string, string[]>> = {};

    for (const service of services) {
      const roleMap: Record<string, string[]> = {};
      for (const role of roles) {
        const perms = role.permissions
          .filter((permission) => permission.service === service)
          .map((permission) => `${permission.resource}.${permission.action}`);

        roleMap[role.name] = perms;
      }
      servicesMap[service] = roleMap;
    }

    const rabbit = await RabbitMQ.getInstance();
    rabbit.produce(QUEUES.AUTH_PERMISSIONS_RELEASED, servicesMap);
  };

  upsertMany = async (payload: UpsertPermissions) => {
    for (const perm of payload.permissions)
      await this.db.permission.upsert({
        where: {
          service_resource_action: {
            action: perm.action,
            resource: perm.resource,
            service: perm.service,
          },
        },
        update: perm,
        create: perm,
      });

    // TODO: publish event permission.update
  };

  browse = async (query?: BrowseQuery) => {
    const q = browseQueryParser(query);
    const data = await this.db.permission.findMany({ ...q });
    const count = query?.paginate
      ? await this.db.permission.count({ where: q.where })
      : undefined;

    return this.paginate(data, { count, take: q.take, skip: q.skip });
  };

  read = async (id: string) => {
    const data = await this.db.permission.findUniqueOrThrow({ where: { id } });
    return data;
  };

  update = async (id: string, payload: UpdatePermission) => {
    const data = await this.db.permission.update({
      where: { id },
      data: payload,
    });
    return data;
  };
}

const permissionService = new PermissionService();
export { permissionService, PermissionService };
