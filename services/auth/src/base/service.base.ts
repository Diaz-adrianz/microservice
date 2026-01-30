import type { PrismaClient } from '../lib/prisma/index.js';

class BaseService {
  db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  paginate = <T>(
    data: T,
    params: { count?: number; take?: number; skip?: number }
  ): {
    items: T;
    page?: number;
    limit?: number;
    totalItems?: number;
    totalPages?: number;
  } => {
    const { count, take, skip = 0 } = params;
    if (!count) return { items: data };

    const size = take && take > 0 ? take : count;
    const page = Math.floor(skip / size) + 1;
    const totalPages = Math.ceil(count / size);

    return {
      page,
      limit: size,
      totalItems: count,
      totalPages,
      items: data,
    };
  };

  transform = <T>(
    data: T,
    transform: Partial<{
      [K in keyof T]: (val: T[K]) => T[K];
    }>
  ): T => {
    const result = {} as T;

    for (const key in data)
      if (transform[key] && typeof transform[key] === 'function')
        result[key] = transform[key]!(data[key]) as T[typeof key];
      else result[key] = data[key];

    return result;
  };
}

export default BaseService;
