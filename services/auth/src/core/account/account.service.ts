import BaseService from '../../base/service.base.js';
import { browseQueryParser } from '../../lib/browse-query/parser.js';
import type { BrowseQuery } from '../../lib/browse-query/schema.js';
import { prisma } from '../../lib/prisma/index.js';

class AccountService extends BaseService {
  constructor() {
    super(prisma);
  }

  isOwner = async (id: string, userId: string) => {
    const count = await this.db.account.count({ where: { id, userId } });
    return count > 0;
  };

  browse = async (query?: BrowseQuery) => {
    const q = browseQueryParser(query);
    const data = await this.db.account.findMany({ ...q });
    const count = query?.paginate
      ? await this.db.account.count({ where: q.where })
      : undefined;

    return this.paginate(data, { count, take: q.take, skip: q.skip });
  };

  read = async (id: string) => {
    const data = await this.db.account.findUniqueOrThrow({ where: { id } });
    return data;
  };

  deleteHard = async (id: string) => {
    const data = await this.db.account.delete({ where: { id } });
    return data;
  };
}

const accountService = new AccountService();
export { accountService, AccountService };
