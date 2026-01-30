import { Router } from 'express';
import logEventRouter from './core/logevent/logevent.router.js';

const r = Router();

r.use('/event', logEventRouter);

const router = r;
export default router;
