import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from './output/client.js';
import { env } from '../../config/env.js';

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export { prisma, PrismaClient, Prisma };
