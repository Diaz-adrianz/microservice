import fs from 'fs';
import path from 'path';
import { program } from 'commander';

program.option('--group <group>', 'Name of core group');
program.option('--name <name>', 'Name of prisma model (pascal case)');

program.parse(process.argv);

const options = program.opts();

if (!options.name) {
  console.error(
    '--name are required. Name of prisma model in PascalCase or following schema casing'
  );
  process.exit(1);
}

const group = options.group ?? '';
const name = options.name;
const nameLower = name.toLowerCase();
const modelName = name.charAt(0).toLowerCase() + name.slice(1);
const basePath = path.join(`./src/core/${group}`, nameLower);

if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
}

const files = [
  {
    name: nameLower + '.schema.ts',
    content: `import * as y from 'yup';

// create one
export const create${name}Schema = y.object({
  // ...
});

export type Create${name} = y.InferType<typeof create${name}Schema>;

// update one
export const update${name}Schema = y.object({
  // ...
});

export type Update${name} = y.InferType<typeof update${name}Schema>;
`,
  },
  {
    name: nameLower + '.router.ts',
    content: `import { Router } from 'express';
import { ${nameLower}Controller } from './${nameLower}.controller.js';
import { validate } from '../../middlewares/validator.middleware.js';
import { browseQuerySchema } from '../../lib/browse-query/schema.js';
import { create${name}Schema, update${name}Schema } from './${nameLower}.schema.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermissions } from '../../middlewares/permission.middleware.js';

const r = Router(),
  controller = ${nameLower}Controller;

r.get(
  '/browse',
  requireAuth(),
  requirePermissions('${nameLower}.browse'),
  validate({ query: browseQuerySchema }),
  controller.browse
);

r.post(
  '/create',
  requireAuth(),
  requirePermissions('${nameLower}.create'),
  validate({ body: create${name}Schema }),
  controller.create
);

r.get(
  '/read/:id', 
  requireAuth(),
  requirePermissions('${nameLower}.read'),
  controller.read
);

r.patch(
  '/update/:id',
  requireAuth(),
  requirePermissions('${nameLower}.update'),
  validate({ body: update${name}Schema }),
  controller.update
);

r.delete(
  '/delete-hard/:id', 
  requireAuth(),
  requirePermissions('${nameLower}.delete-hard'),
  controller.deleteHard
);

const ${nameLower}Router = r;
export default ${nameLower}Router;
`,
  },
  {
    name: nameLower + '.controller.ts',
    content: `import type { Request, Response } from 'express';
import BaseController from '../../base/controller.base.js';
import { ${nameLower}Service, ${name}Service } from './${nameLower}.service.js';
import type { Create${name}, Update${name} } from './${nameLower}.schema.js';
import type { BrowseQuery } from '../../lib/browse-query/schema.js';

class ${name}Controller extends BaseController {
  #service: ${name}Service;

  constructor() {
    super();
    this.#service = ${nameLower}Service;
  }

  browse = async (req: Request<{}, {}, {}, BrowseQuery>, res: Response) => {
    const data = await this.#service.browse(req.validQuery);
    return this.success(res, data, '${name} list restrieved');
  };

  create = async (req: Request<{}, {}, Create${name}>, res: Response) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, '${name} created');
  };

  read = async (req: Request<{ id: string }>, res: Response) => {
    const data = await this.#service.read(req.params.id);
    return this.success(res, data, '${name} retrieved');
  };

  update = async (
    req: Request<{ id: string }, {}, Update${name}>,
    res: Response
  ) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.created(res, data, '${name} updated');
  };

  deleteHard = async (req: Request<{ id: string }>, res: Response) => {
    await this.#service.deleteHard(req.params.id);
    return this.noContent(res);
  };
}

const ${nameLower}Controller = new ${name}Controller();
export { ${nameLower}Controller, ${name}Controller };
`,
  },
  {
    name: nameLower + '.service.ts',
    content: `import BaseService from '../../base/service.base.js';
import { browseQueryParser } from '../../lib/browse-query/parser.js';
import type { BrowseQuery } from '../../lib/browse-query/schema.js';
import { prisma } from '../../lib/prisma/index.js';
import type { Create${name}, Update${name} } from './${nameLower}.schema.js';

class ${name}Service extends BaseService {
  constructor() {
    super(prisma);
  }

  browse = async (query?: BrowseQuery) => {
    const q = browseQueryParser(query);
    const data = await this.db.${nameLower}.findMany({ ...q });
    const count = query?.paginate
      ? await this.db.${nameLower}.count({ where: q.where })
      : undefined;

    return this.paginate(data, { count, take: q.take, skip: q.skip });
  };

  create = async (payload: Create${name}) => {
    const data = await this.db.${nameLower}.create({ data: payload });
    return data;
  };

  read = async (id: string) => {
    const data = await this.db.${nameLower}.findUniqueOrThrow({ where: { id } });
    return data;
  };

  update = async (id: string, payload: Update${name}) => {
    const data = await this.db.${nameLower}.update({ where: { id }, data: payload });
    return data;
  };

  deleteHard = async (id: string) => {
    const data = await this.db.${nameLower}.delete({ where: { id } });
    return data;
  };
}

const ${nameLower}Service = new ${name}Service();
export { ${nameLower}Service, ${name}Service };
`,
  },
];

console.log('=== Core Generator ===');

files.forEach((file) => {
  fs.writeFileSync(path.join(basePath, file.name), file.content);
  console.log(`🚩 Created file: ${path.join(basePath, file.name)}`);
});

console.log(`✅ Generator completed for ${modelName}`);
