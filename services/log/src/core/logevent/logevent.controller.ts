import type { Request, Response } from 'express';
import BaseController from '../../base/controller.base.js';
import type { BrowseQuery } from '../../lib/browse-query/schema.js';
import { logEventService, LogEventService } from './logevent.service.js';

class LogEventController extends BaseController {
  #service: LogEventService;

  constructor() {
    super();
    this.#service = logEventService;
  }

  browse = async (req: Request<{}, {}, {}, BrowseQuery>, res: Response) => {
    const data = await this.#service.browse(req.validQuery);
    return this.success(res, data, 'LogEvent list restrieved');
  };

  read = async (req: Request<{ id: string }>, res: Response) => {
    const data = await this.#service.read(req.params.id);
    return this.success(res, data, 'LogEvent retrieved');
  };
}

const logEventController = new LogEventController();
export { logEventController, LogEventController };
