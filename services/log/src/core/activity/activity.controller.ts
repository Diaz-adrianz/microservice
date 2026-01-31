import type { Request, Response } from 'express';
import BaseController from '../../base/controller.base.js';
import type { BrowseQuery } from '../../lib/browse-query/schema.js';
import { activityService, ActivityService } from './activity.service.js';

class ActivityController extends BaseController {
  #service: ActivityService;

  constructor() {
    super();
    this.#service = activityService;
  }

  browse = async (req: Request<{}, {}, {}, BrowseQuery>, res: Response) => {
    const data = await this.#service.browse(req.validQuery);
    return this.success(res, data, 'Activity list restrieved');
  };

  read = async (req: Request<{ id: string }>, res: Response) => {
    const data = await this.#service.read(req.params.id);
    return this.success(res, data, 'Activity retrieved');
  };
}

const activityController = new ActivityController();
export { activityController, ActivityController };
