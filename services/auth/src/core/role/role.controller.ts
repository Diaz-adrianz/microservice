import type { Request, Response } from 'express';
import BaseController from '../../base/controller.base.js';
import { roleService, RoleService } from './role.service.js';
import type { CreateRole, UpdateRole } from './role.schema.js';
import type { BrowseQuery } from '../../lib/browse-query/schema.js';

class RoleController extends BaseController {
  #service: RoleService;

  constructor() {
    super();
    this.#service = roleService;
  }

  browse = async (req: Request<{}, {}, {}, BrowseQuery>, res: Response) => {
    const data = await this.#service.browse(req.validQuery);
    return this.success(res, data, 'Role list restrieved');
  };

  create = async (req: Request<{}, {}, CreateRole>, res: Response) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, 'Role created');
  };

  read = async (req: Request<{ id: string }>, res: Response) => {
    const data = await this.#service.read(req.params.id);
    return this.success(res, data, 'Role retrieved');
  };

  update = async (
    req: Request<{ id: string }, {}, UpdateRole>,
    res: Response
  ) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.created(res, data, 'Role updated');
  };

  deleteHard = async (req: Request<{ id: string }>, res: Response) => {
    await this.#service.deleteHard(req.params.id);
    return this.noContent(res);
  };
}

const roleController = new RoleController();
export { roleController, RoleController };
