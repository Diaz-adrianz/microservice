import BaseService from '../../base/service.base.js';
import { browseQueryParser } from '../../lib/browse-query/parser.js';
import type { BrowseQuery } from '../../lib/browse-query/schema.js';
import { prisma } from '../../lib/prisma/index.js';
import type {
  UpdatePermission,
  UpsertPermissions,
} from './permission.schema.js';

class PermissionService extends BaseService {
  constructor() {
    super(prisma);
  }

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
