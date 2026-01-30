import * as y from 'yup';

// utils
const serializeKeyValueTest = (value?: string) => {
  return value ? value.split('+').every((el) => el.includes(':')) : true;
}; // valid -> "key:value+key.key:value+...."

// schemas
export const browseQuerySchema = y.object({
  search: y.string().optional().test(serializeKeyValueTest),
  starts: y.string().optional().test(serializeKeyValueTest),
  where: y.string().optional().test(serializeKeyValueTest),
  in_: y.string().optional().test(serializeKeyValueTest),
  nin_: y.string().optional().test(serializeKeyValueTest),
  not_: y.string().optional().test(serializeKeyValueTest),
  gt: y.string().optional().test(serializeKeyValueTest),
  gte: y.string().optional().test(serializeKeyValueTest),
  lt: y.string().optional().test(serializeKeyValueTest),
  lte: y.string().optional().test(serializeKeyValueTest),
  paginate: y.boolean().optional().default(true),
  limit: y.number().optional().default(20),
  page: y.number().optional().default(1),
  order: y.string().optional().test(serializeKeyValueTest),
});

// types
export type BrowseQuery = y.InferType<typeof browseQuerySchema>;
