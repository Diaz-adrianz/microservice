import { Prisma, PrismaClient } from '../../../src/lib/prisma/index.ts';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { roleMap } from './role.seed';

dotenv.config();

const saltPassword = async (password: string) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
};

const userList: Prisma.UserCreateInput[] = [
  {
    email: 'superadmin@example.com',
    name: 'Superadmin',
    isActive: true,
    isVerified: true,
    accounts: {
      create: {
        type: 'credentials',
        provider: 'local',
        providerAccountId: 'local-superadmin@example.com',
        password: await saltPassword(process.env.DUMMY_USER_PASSWORD!),
      },
    },
    roles: { connect: [{ id: roleMap['Superadmin'] }] },
  },
  {
    email: 'admin@example.com',
    name: 'Admin',
    isActive: true,
    isVerified: true,
    accounts: {
      create: {
        type: 'credentials',
        provider: 'local',
        providerAccountId: 'local-admin@example.com',
        password: await saltPassword(process.env.DUMMY_USER_PASSWORD!),
      },
    },
    roles: { connect: [{ id: roleMap['Admin'] }] },
  },
  {
    email: 'user@example.com',
    name: 'User',
    isActive: true,
    isVerified: true,
    accounts: {
      create: {
        type: 'credentials',
        provider: 'local',
        providerAccountId: 'local-user@example.com',
        password: await saltPassword(process.env.DUMMY_USER_PASSWORD!),
      },
    },
    roles: { connect: [{ id: roleMap['User'] }] },
  },
] as const;

async function seedUser(prisma: PrismaClient) {
  let count = 0;
  for (const data of userList) {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing) continue;

      await prisma.user.create({ data });
      count += 1;
    } catch (error) {
      console.error('❌', error);
    }
  }

  console.log(`✅ User seeder ${userList.length} data ${count} inserted`);
}

export default seedUser;
