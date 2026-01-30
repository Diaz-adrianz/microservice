import { Prisma, PrismaClient } from '../../../src/lib/prisma/index.ts';

const roleList: Prisma.RoleCreateManyInput[] = [
  {
    id: '93edd59a-f5be-46ed-af3f-e4ccf5860201',
    name: 'Superadmin',
  },
  {
    id: 'fd6fd4b3-ec4c-4595-9f8d-daf151dd1c51',
    name: 'Admin',
  },
  {
    id: '95537bc4-46f7-41ee-8e75-89fd018ae9d7',
    name: 'User',
  },
];

export const roleMap = roleList.reduce<Record<string, string>>((a, c) => {
  if (c.id) a[c.name] = c.id;
  return a;
}, {});

async function seedRole(prisma: PrismaClient) {
  try {
    const result = await prisma.role.createMany({
      data: roleList,
      skipDuplicates: true,
    });

    console.log(
      `✅ Role seeder ${roleList.length} data ${result.count} inserted`
    );
  } catch (error) {
    console.error('❌', error);
  }
}

export default seedRole;
