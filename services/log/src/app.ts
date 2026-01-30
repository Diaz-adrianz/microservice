import express from 'express';
import httpStatus from 'http-status';
import { env } from './config/env.js';
import router from './router.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

// request parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// apis
app.use('/', router);

// not found
app.use((_, res) => {
  res.status(httpStatus.NOT_FOUND).json({
    message: `[${env.APP_NAME}] API endpoint not found`,
  });
});

// global error handling
app.use(errorMiddleware);

export default app;
