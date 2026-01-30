import fs from 'fs';
import path from 'path';
import { program } from 'commander';

program.option('--name <name>', 'Name of prisma model (pascal case)');

program.parse(process.argv);

const options = program.opts();

if (!options.name) {
  console.error(
    '--name are required. Name of prisma model in PascalCase or following schema casing'
  );
  process.exit(1);
}

const name = options.name;
const nameLower = name.toLowerCase();
const modelName = name.charAt(0).toLowerCase() + name.slice(1);

const seedPath = path.join('./prisma/seeds/data');
const seedsIndexPath = path.join('./prisma/seeds/index.ts');

if (!fs.existsSync(seedPath)) {
  fs.mkdirSync(seedPath, { recursive: true });
}

const files = [
  {
    name: `${nameLower}.seed.ts`,
    content: `import { Prisma, PrismaClient } from '../../../src/lib/prisma/index.ts';

const ${nameLower}List: Prisma.${name}CreateManyInput[] = [
  // ...
] as const;

async function seed${name}(prisma: PrismaClient) {
  try {
    const result = await prisma.${nameLower}.createMany({
      data: ${nameLower}List,
      skipDuplicates: true,
    });

    console.log(
      \`✅ ${name} seeder \${${nameLower}List.length} data \${result.count} inserted\`
    );
  } catch (error) {
    console.error('❌', error);
  }
}

export default seed${name};
    `,
  },
];

function write() {
  console.log('=== Seed Generator ===');

  files.forEach((file) => {
    fs.writeFileSync(path.join(seedPath, file.name), file.content);
    console.log(`🚩 Created file: ${path.join(seedPath, file.name)}`);
  });

  try {
    const seedsIndexContent = fs.readFileSync(seedsIndexPath, 'utf-8');
    const newSeedsIndexContent = seedsIndexContent
      .replace(
        "import { prisma } from '../../src/lib/prisma/index.js';",
        `import { prisma } from '../../src/lib/prisma/index.js';\nimport seed${name} from './data/${nameLower}.seed.js';`
      )
      .replace(
        'async function main() {',
        `async function main() {\n  await seed${name}(prisma);`
      );

    fs.writeFileSync(seedsIndexPath, newSeedsIndexContent);

    console.log(`🚩 Updated file: ${seedsIndexPath}`);
  } catch (error) {
    console.log('❌', error);
  }

  console.log(`✅ Generator completed for ${modelName}`);
}

write();
