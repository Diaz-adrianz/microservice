import { prisma, PrismaClient } from '../lib/prisma/index.js';

export const existInDatabase = (table: keyof PrismaClient) => {
  return [
    'existInDatabase',
    '${path} not found in database',
    async (id: any) => {
      if (typeof id == 'string') {
        const found = await (prisma[table] as any).count({ where: { id } });
        return found > 0;
      }
      return true;
    },
  ] as const;
};

// common enums
export const EduLevel = {
  TK: 'TK',
  SD: 'SD',
  SM: 'SM',
} as const;

export type EduLevel = (typeof EduLevel)[keyof typeof EduLevel];
