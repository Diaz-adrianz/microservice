import { Prisma, PrismaClient } from '../../../src/lib/prisma/index.ts';
import { roleMap } from './role.seed.ts';

const permissions: Record<
  string,
  Record<string, Record<string, string[] | undefined>>
> = {
  auth: {
    role: {
      browse: ['Superadmin'],
      create: ['Superadmin'],
      read: ['Superadmin'],
      update: ['Superadmin'],
      delete: ['Superadmin'],
    },
    permission: {
      browse: ['Superadmin'],
      create: ['Superadmin'],
      read: ['Superadmin'],
    },
    account: {
      browse: undefined,
      read: undefined,
      delete: undefined,
    },
    user: {
      browse: ['Superadmin', 'Admin'],
      create: ['Superadmin'],
      read: undefined,
      update: ['Superadmin'],
      delete: ['Superadmin'],
    },
  },
};

const permissionList: Prisma.PermissionCreateInput[] = Object.entries(
  permissions
)
  .map(([service, resources]) =>
    Object.entries(resources)
      .map(([resource, actions]) =>
        Object.entries(actions)
          .map(([action, roles]) => {
            return {
              service,
              resource,
              action,
              roles: {
                connect:
                  roles != undefined
                    ? roles
                        .map((r) =>
                          roleMap[r] ? { id: roleMap[r] } : undefined
                        )
                        .filter((r) => r != undefined)
                    : [
                        { id: roleMap['Superadmin'] },
                        { id: roleMap['Admin'] },
                        { id: roleMap['User'] },
                      ],
              },
            };
          })
          .flat()
      )
      .flat()
  )
  .flat();

async function seedPermission(prisma: PrismaClient) {
  let count = 0;
  for (const data of permissionList) {
    try {
      const existing = await prisma.permission.findUnique({
        where: {
          service_resource_action: {
            service: data.service,
            resource: data.resource,
            action: data.action,
          },
        },
        select: { id: true },
      });
      if (existing) {
        await prisma.permission.update({
          data,
          where: {
            service_resource_action: {
              service: data.service,
              resource: data.resource,
              action: data.action,
            },
          },
        });
      } else {
        await prisma.permission.create({ data });
        count += 1;
      }
    } catch (error) {
      console.error('❌', error);
    }
  }

  console.log(
    `✅ Permission seeder ${permissionList.length} data ${count} inserted`
  );
}

export default seedPermission;
