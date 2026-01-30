import type { NextFunction, Request, Response } from 'express';
import * as y from 'yup';

const validate = <
  B extends y.ObjectSchema<any> | undefined,
  Q extends y.ObjectSchema<any> | undefined,
>(schemas: {
  body?: B;
  query?: Q;
}) => {
  return async (
    req: Request<
      {},
      {},
      B extends y.ObjectSchema<any> ? y.InferType<B> : {},
      Q extends y.ObjectSchema<any> ? y.InferType<Q> : {}
    >,
    _: Response,
    next: NextFunction
  ) => {
    if (schemas.body) {
      const validBody = await schemas.body.validate(req.body ?? {}, {
        abortEarly: false,
        stripUnknown: true,
        strict: true,
      });
      req.body = validBody;
    }

    if (schemas.query) {
      const validQuery = await schemas.query.validate(req.query ?? {}, {
        abortEarly: false,
        stripUnknown: true,
      });
      req.validQuery = validQuery;
    }

    next();
  };
};

export { validate };
