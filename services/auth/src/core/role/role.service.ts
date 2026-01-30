import BaseService from '../../base/service.base.js';
import { browseQueryParser } from '../../lib/browse-query/parser.js';
import type { BrowseQuery } from '../../lib/browse-query/schema.js';
import { prisma } from '../../lib/prisma/index.js';
import type { CreateRole, UpdateRole } from './role.schema.js';

class RoleService extends BaseService {
  constructor() {
    super(prisma);
  }

  browse = async (query?: BrowseQuery) => {
    const q = browseQueryParser(query);
    const data = await this.db.role.findMany({ ...q });
    const count = query?.paginate
      ? await this.db.role.count({ where: q.where })
      : undefined;

    return this.paginate(data, { count, take: q.take, skip: q.skip });
  };

  create = async (payload: CreateRole) => {
    const data = await this.db.role.create({ data: payload });
    // TODO: publish event role.update
    return data;
  };

  read = async (id: string) => {
    const data = await this.db.role.findUniqueOrThrow({
      where: { id },
      include: {
        permissions: {
          select: {
            id: true,
            service: true,
            resource: true,
            action: true,
            isActive: true,
          },
        },
      },
    });
    return data;
  };

  update = async (id: string, payload: UpdateRole) => {
    const data = await this.db.role.update({ where: { id }, data: payload });
    // TODO: publish event role.update
    return data;
  };

  deleteHard = async (id: string) => {
    const data = await this.db.role.delete({ where: { id } });
    // TODO: publish event role.update
    return data;
  };
}

const roleService = new RoleService();
export { roleService, RoleService };
