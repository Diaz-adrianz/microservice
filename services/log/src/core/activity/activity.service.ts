import BaseService from '../../base/service.base.js';
import { browseQueryParser } from '../../lib/browse-query/parser.js';
import type { BrowseQuery } from '../../lib/browse-query/schema.js';
import { prisma } from '../../lib/prisma/index.js';

class ActivityService extends BaseService {
  constructor() {
    super(prisma);
  }

  browse = async (query?: BrowseQuery) => {
    const q = browseQueryParser(query);
    const data = await this.db.activity.findMany({
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
      ? await this.db.activity.count({ where: q.where })
      : undefined;

    return this.paginate(data, { count, take: q.take, skip: q.skip });
  };

  read = async (id: string) => {
    const data = await this.db.activity.findUniqueOrThrow({
      where: { id },
    });
    return data;
  };
}

const activityService = new ActivityService();
export { activityService, ActivityService };
