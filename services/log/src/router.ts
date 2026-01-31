import { Router } from 'express';
import activityRouter from './core/activity/activity.router';

const r = Router();

r.use('/activities', activityRouter);

const router = r;
export default router;
