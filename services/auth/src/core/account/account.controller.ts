import type { Request, Response } from 'express';
import BaseController from '../../base/controller.base.js';
import { accountService, AccountService } from './account.service.js';
import type { BrowseQuery } from '../../lib/browse-query/schema.js';

class AccountController extends BaseController {
  #service: AccountService;

  constructor() {
    super();
    this.#service = accountService;
  }

  browse = async (req: Request<{}, {}, {}, BrowseQuery>, res: Response) => {
    const data = await this.#service.browse(req.validQuery);
    return this.success(res, data, 'Account list restrieved');
  };

  read = async (req: Request<{ id: string }>, res: Response) => {
    const data = await this.#service.read(req.params.id);
    return this.success(res, data, 'Account retrieved');
  };

  deleteHard = async (req: Request<{ id: string }>, res: Response) => {
    await this.#service.deleteHard(req.params.id);
    return this.noContent(res);
  };
}

const accountController = new AccountController();
export { accountController, AccountController };
