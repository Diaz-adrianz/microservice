import { prisma } from '../../src/lib/prisma/index.js';
import seedPermission from './data/permission.seed.js';
import seedUser from './data/user.seed.js';
import seedRole from './data/role.seed.js';

async function main() {
  await seedRole(prisma);
  await seedPermission(prisma);
  await seedUser(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
