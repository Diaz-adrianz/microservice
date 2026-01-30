import type { Request, Response } from 'express';
import BaseController from '../../base/controller.base.js';
import { userService, UserService } from './user.service.js';
import type { CreateUser, UpdateUser } from './user.schema.js';
import type { BrowseQuery } from '../../lib/browse-query/schema.js';

class UserController extends BaseController {
  #service: UserService;

  constructor() {
    super();
    this.#service = userService;
  }

  browse = async (req: Request<{}, {}, {}, BrowseQuery>, res: Response) => {
    const data = await this.#service.browse(req.validQuery);
    return this.success(res, data, 'User list restrieved');
  };

  create = async (req: Request<{}, {}, CreateUser>, res: Response) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, 'User created');
  };

  read = async (req: Request<{ id: string }>, res: Response) => {
    const data = await this.#service.read(req.params.id);
    return this.success(res, data, 'User retrieved');
  };

  update = async (
    req: Request<{ id: string }, {}, UpdateUser>,
    res: Response
  ) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.created(res, data, 'User updated');
  };

  deleteHard = async (req: Request<{ id: string }>, res: Response) => {
    await this.#service.deleteHard(req.params.id);
    return this.noContent(res);
  };
}

const userController = new UserController();
export { userController, UserController };
