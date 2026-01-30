import type { Request, Response } from 'express';
import BaseController from '../../base/controller.base.js';
import { permissionService, PermissionService } from './permission.service.js';
import type {
  UpdatePermission,
  UpsertPermissions,
} from './permission.schema.js';
import type { BrowseQuery } from '../../lib/browse-query/schema.js';

class PermissionController extends BaseController {
  #service: PermissionService;

  constructor() {
    super();
    this.#service = permissionService;
  }

  release = async (req: Request, res: Response) => {
    await this.#service.release();
    return this.success(res, null, 'Permissions released');
  };

  upsertMany = async (
    req: Request<{ id: string }, {}, UpsertPermissions>,
    res: Response
  ) => {
    const data = await this.#service.upsertMany(req.body);
    return this.created(res, data, 'Permissions updated');
  };

  browse = async (req: Request<{}, {}, {}, BrowseQuery>, res: Response) => {
    const data = await this.#service.browse(req.validQuery);
    return this.success(res, data, 'Permission list restrieved');
  };

  read = async (req: Request<{ id: string }>, res: Response) => {
    const data = await this.#service.read(req.params.id);
    return this.success(res, data, 'Permission retrieved');
  };

  update = async (
    req: Request<{ id: string }, {}, UpdatePermission>,
    res: Response
  ) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.created(res, data, 'Permission updated');
  };
}

const permissionController = new PermissionController();
export { permissionController, PermissionController };
