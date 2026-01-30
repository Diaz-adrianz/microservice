import moment from 'moment';
import {
  isBoolString,
  isDateString,
  isNullString,
  isNumberString,
} from '../../utils/type.js';
import type { BrowseQuery } from './schema.js';

// utils
const deserializeValue = (value: string) => {
  if (isNumberString(value)) return parseInt(value);
  else if (isBoolString(value)) return value === 'true';
  else if (isNullString(value)) return null;
  else if (isDateString(value)) return moment(value).toDate();
  return value;
};

const deserializeKeyValue = (
  result: Record<string, any>,
  serialized: string,
  valueBuilder: (val: string) => any,
  opts: { useOR: boolean } = { useOR: false }
) => {
  if (!serialized) return result;

  const orItems: Record<string, any>[] = [];
  const pairs = serialized.split('+');

  for (const pair of pairs) {
    const [keysString, value] = pair.split(':');
    if (!keysString || !value) continue;

    const keys = keysString.split('.');
    const target = opts.useOR ? {} : result;
    let current = target;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = valueBuilder(value);
      } else {
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key];
      }
    });

    if (opts.useOR) orItems.push(target);
  }

  if (opts.useOR) result.OR = orItems;

  return result;
};

// types
export type BrowseQueryParsed = {
  where?: {
    AND: Record<string, any>[];
  };
  take?: number;
  skip?: number;
  orderBy?: Record<string, any>;
};

// parser
export const browseQueryParser = (query?: BrowseQuery): BrowseQueryParsed => {
  if (!query) return {};

  const search = {};
  if (query.search)
    deserializeKeyValue(
      search,
      query.search,
      (v) => ({
        contains: deserializeValue(v),
      }),
      { useOR: true }
    );

  const starts = {};
  if (query.starts)
    deserializeKeyValue(
      starts,
      query.starts,
      (v) => ({
        startsWith: deserializeValue(v),
      }),
      { useOR: true }
    );

  const where = {};
  if (query.where)
    deserializeKeyValue(where, query.where, (v) => deserializeValue(v));

  const in_ = {};
  if (query.in_)
    deserializeKeyValue(in_, query.in_, (v) => ({
      in: v.split(',').map(deserializeValue),
    }));

  const nin_ = {};
  if (query.nin_)
    deserializeKeyValue(nin_, query.nin_, (v) => ({
      notIn: v.split(',').map(deserializeValue),
    }));

  const not_ = {};
  if (query.not_)
    deserializeKeyValue(not_, query.not_, (v) => ({
      not: deserializeValue(v),
    }));

  const gt = {};
  if (query.gt)
    deserializeKeyValue(gt, query.gt, (v) => ({
      gt: deserializeValue(v),
    }));

  const gte = {};
  if (query.gte)
    deserializeKeyValue(gte, query.gte, (v) => ({
      gte: deserializeValue(v),
    }));

  const lt = {};
  if (query.lt)
    deserializeKeyValue(lt, query.lt, (v) => ({
      lt: deserializeValue(v),
    }));

  const lte = {};
  if (query.lte)
    deserializeKeyValue(lte, query.lte, (v) => ({
      lte: deserializeValue(v),
    }));

  const order = {};
  if (query.order)
    deserializeKeyValue(order, query.order, (v) => deserializeValue(v));

  const pagination: { take?: number; skip?: number } = {};
  if (query.limit > 0) {
    pagination['take'] = query.limit;
  }

  if (query.paginate) {
    if (pagination['take'] && pagination['take'] > 0) {
      const page = query.page && query.page > 0 ? query.page : 1;
      pagination['skip'] = (page - 1) * (pagination['take'] || 0);
    }
  }

  return {
    where: {
      AND: [search, starts, where, in_, nin_, not_, gt, gte, lt, lte],
    },
    take: pagination['take'],
    skip: pagination['skip'],
    orderBy: order,
  };
};

export const browseQueryConcat = (
  query: BrowseQuery,
  field: {
    [K in keyof BrowseQuery]: BrowseQuery[K] extends string | undefined
      ? K
      : never;
  }[keyof BrowseQuery],
  value: string
) => {
  if (!field) return query;
  query[field] = query[field] ? `${query[field]}+${value}` : value;
  return query;
};
