import bcrypt from 'bcrypt';
import BaseService from '../../base/service.base.js';
import { browseQueryParser } from '../../lib/browse-query/parser.js';
import type { BrowseQuery } from '../../lib/browse-query/schema.js';
import { prisma } from '../../lib/prisma/index.js';
import type { CreateUser, UpdateUser } from './user.schema.js';
import { AccountProvider, AccountType } from '../account/account.schema.js';

class UserService extends BaseService {
  constructor() {
    super(prisma);
  }

  comparePassword = async (data: string, encrypted: string) => {
    return await bcrypt.compare(data, encrypted);
  };

  hashPassword = async (data: string) => {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(data, salt);
  };

  browse = async (query?: BrowseQuery) => {
    const q = browseQueryParser(query);
    const data = await this.db.user.findMany({ ...q });
    const count = query?.paginate
      ? await this.db.user.count({ where: q.where })
      : undefined;

    return this.paginate(data, { count, take: q.take, skip: q.skip });
  };

  create = async (payload: CreateUser) => {
    const password = await this.hashPassword(payload.password);
    const data = await this.db.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        accounts: {
          create: {
            type: AccountType.CREDENTIALS,
            provider: AccountProvider.LOCAL,
            providerAccountId: 'local-' + payload.email,
            password: password,
          },
        },
        roles: { connect: { name: payload.roleName } },
      },
    });
    return data;
  };

  read = async (id: string) => {
    const data = await this.db.user.findUniqueOrThrow({ where: { id } });
    return data;
  };

  update = async (id: string, payload: UpdateUser) => {
    const data = await this.db.user.update({ where: { id }, data: payload });
    return data;
  };

  deleteHard = async (id: string) => {
    const data = await this.db.user.delete({ where: { id } });
    return data;
  };
}

const userService = new UserService();
export { userService, UserService };
