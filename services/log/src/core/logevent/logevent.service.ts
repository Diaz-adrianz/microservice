import BaseService from '../../base/service.base.js';
import { browseQueryParser } from '../../lib/browse-query/parser.js';
import type { BrowseQuery } from '../../lib/browse-query/schema.js';
import { prisma } from '../../lib/prisma/index.js';

class LogEventService extends BaseService {
  constructor() {
    super(prisma);
  }

  browse = async (query?: BrowseQuery) => {
    const q = browseQueryParser(query);
    const data = await this.db.logEvent.findMany({
      ...q,
      select: {
        id: true,
        ts: true,
        level: true,
        service: true,
        actorType: true,
        actorName: true,
        actorId: true,
        message: true,
      },
    });
    const count = query?.paginate
      ? await this.db.logEvent.count({ where: q.where })
      : undefined;

    return this.paginate(data, { count, take: q.take, skip: q.skip });
  };

  read = async (id: string) => {
    const data = await this.db.logEvent.findUniqueOrThrow({
      where: { id },
    });
    return data;
  };
}

const logEventService = new LogEventService();
export { logEventService, LogEventService };
