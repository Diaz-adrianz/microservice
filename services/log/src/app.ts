import express from 'express';
import httpStatus from 'http-status';
import { env } from './config/env.js';

const app = express();

// request parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/ping', (req, res) => {
  return res.send('PONG');
});

// not found
app.use((_, res) => {
  res.status(httpStatus.NOT_FOUND).json({
    message: `[${env.APP_NAME}] API endpoint not found`,
  });
});

export default app;
