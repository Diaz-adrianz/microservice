import type { Response } from 'express';
import httpStatus from 'http-status';

class BaseController {
  constructor() {}

  success = <T>(res: Response, data: T, message: string = 'Success') => {
    return res.status(httpStatus.OK).json({
      status: true,
      message,
      data,
    });
  };

  created = <T>(res: Response, data: T, message: string = 'Created') => {
    return res.status(httpStatus.CREATED).json({
      status: true,
      message,
      data,
    });
  };

  noContent = (res: Response) => {
    return res.status(httpStatus.NO_CONTENT).send();
  };
}

export default BaseController;
