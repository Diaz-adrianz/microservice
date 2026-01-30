import httpStatus from 'http-status';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { ValidationError } from 'yup';
import { MulterError } from 'multer';
import {
  PrismaClientValidationError,
  PrismaClientKnownRequestError,
} from '../lib/prisma/output/internal/prismaNamespace.js';

class HttpError extends Error {
  httpCode: number;
  stack?: string;

  constructor(message = 'An error occured', stack?: string) {
    super(message);
    this.name = this.constructor.name;
    this.httpCode = httpStatus.INTERNAL_SERVER_ERROR;
    this.stack = stack;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFound extends HttpError {
  constructor(message = 'Data not found') {
    super(message);
    this.httpCode = httpStatus.NOT_FOUND;
  }
}

class Unauthenticated extends HttpError {
  constructor(message = 'Authentication required') {
    super(message);
    this.httpCode = httpStatus.UNAUTHORIZED;
  }
}

class BadRequest extends HttpError {
  constructor(message = 'Invalid request data') {
    super(message);
    this.httpCode = httpStatus.BAD_REQUEST;
  }
}

class Forbidden extends HttpError {
  constructor(message = 'Access denied') {
    super(message);
    this.httpCode = httpStatus.FORBIDDEN;
  }
}

class ServerError extends HttpError {
  constructor(message = 'Internal server error') {
    super(message);
    this.httpCode = httpStatus.INTERNAL_SERVER_ERROR;
  }
}

const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  _: NextFunction
) => {
  let httpCode = err.httpCode || 500,
    message = err.message || 'Terjadi kesalahan',
    data = undefined;
  const stack = env.isDevelopment ? err?.stack?.split('\n') : undefined;

  if (env.isDevelopment) console.log(err);

  if (err instanceof PrismaClientKnownRequestError && err.code == 'P2003') {
    httpCode = httpStatus.UNPROCESSABLE_ENTITY;
    message = 'Cannot change this data because it is linked to other data';
  } else if (err instanceof PrismaClientValidationError) {
    httpCode = httpStatus.BAD_REQUEST;
    if (err.message.includes('Unknown argument')) {
      const part = err.message.match(/Unknown argument `[^`]+`/);
      message = part ? part[0] : 'Unknown argument on request';
    } else if (err.message.includes('Unknown field')) {
      const part = err.message.match(
        /Unknown field `[^`]+` for select statement`/
      );
      message = part ? part[0] : 'Unknown field name on request';
    }
  } else if (
    err instanceof PrismaClientKnownRequestError &&
    err.code == 'P2025'
  ) {
    httpCode = httpStatus.NOT_FOUND;
    message = `${err.meta?.modelName ?? 'Data'} not found`;
  } else if (
    err instanceof PrismaClientKnownRequestError &&
    err.code == 'P2002'
  ) {
    httpCode = httpStatus.CONFLICT;
    const target =
      (err.meta?.driverAdapterError as any)?.cause?.originalMessage?.replace(
        /^duplicate key value violates unique constraint "(.*)_key"$/,
        '$1'
      ) ?? '';
    if (target)
      message = `An entry with the same value for ${target} already exists.`;
    else message = 'There are duplicate values';
  } else if (err instanceof ValidationError) {
    httpCode = httpStatus.UNPROCESSABLE_ENTITY;
    message = 'Validation failed';
    data = err.inner.map((i) =>
      i.errors
        .map((e) =>
          e.toLowerCase().includes(i.path?.toLowerCase() ?? '')
            ? e
            : `${i.path ?? ''}: ${e}`
        )
        .join(', ')
    );
  } else if (err instanceof MulterError) {
    httpCode = httpStatus.UNPROCESSABLE_ENTITY;
    message = 'Unprocessable data';
    data = err.field;
  } else if (err instanceof HttpError) {
    httpCode = err.httpCode;
    message = err.message;
  } else {
    console.error(err);
  }

  res.status(httpCode).json({
    status: httpCode > 199 && httpCode < 300,
    message: message,
    data: data,
    stack: stack,
  });
};

export {
  errorMiddleware,
  ServerError,
  NotFound,
  Unauthenticated,
  Forbidden,
  BadRequest,
};
