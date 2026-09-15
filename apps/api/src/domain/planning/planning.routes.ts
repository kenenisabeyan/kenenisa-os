import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  getDailyPlanHandler,
  createDailyPlanHandler,
  updateDailyPlanHandler,
  listTimeBlocksHandler,
  getTimeBlockHandler,
  createTimeBlockHandler,
  updateTimeBlockHandler,
  deleteTimeBlockHandler,
  getDailyCapacityHandler,
  getWeeklyCapacityHandler,
  getWeeklyPlanHandler,
  createWeeklyPlanHandler,
  updateWeeklyPlanHandler,
} from './planning.controller.js';

export const planningRouter = Router();

planningRouter.use(requireAuth);

// Daily Plans
planningRouter.get('/daily', getDailyPlanHandler);
planningRouter.get('/daily/:date', getDailyPlanHandler);
planningRouter.post('/daily', createDailyPlanHandler);
planningRouter.patch('/daily/:date', updateDailyPlanHandler);

// Time Blocks
planningRouter.get('/time-blocks', listTimeBlocksHandler);
planningRouter.get('/time-blocks/:id', getTimeBlockHandler);
planningRouter.post('/time-blocks', createTimeBlockHandler);
planningRouter.patch('/time-blocks/:id', updateTimeBlockHandler);
planningRouter.delete('/time-blocks/:id', deleteTimeBlockHandler);

// Capacity Engine
planningRouter.get('/capacity/daily', getDailyCapacityHandler);
planningRouter.get('/capacity/weekly', getWeeklyCapacityHandler);

// Weekly Plans
planningRouter.get('/weekly', getWeeklyPlanHandler);
planningRouter.get('/weekly/:weekStart', getWeeklyPlanHandler);
planningRouter.post('/weekly', createWeeklyPlanHandler);
planningRouter.patch('/weekly/:weekStart', updateWeeklyPlanHandler);
