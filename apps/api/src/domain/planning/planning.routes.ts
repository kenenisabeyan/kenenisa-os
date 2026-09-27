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
  getMultiHorizonOverviewHandler,
  getDailyFactualSummaryHandler,
  listYearPlansHandler,
  getYearPlanHandler,
  createYearPlanHandler,
  updateYearPlanHandler,
  listMonthPlansHandler,
  getMonthPlanHandler,
  createMonthPlanHandler,
  updateMonthPlanHandler,
  listOutcomesHandler,
  createOutcomeHandler,
  updateOutcomeHandler,
  deleteOutcomeHandler,
  confirmOutcomeHandler,
  linkOutcomeEvidenceHandler,
} from './planning.controller.js';

export const planningRouter = Router();

planningRouter.use(requireAuth);

// Multi-Horizon Overview & Summaries
planningRouter.get('/overview', getMultiHorizonOverviewHandler);
planningRouter.get('/summary/daily/:date?', getDailyFactualSummaryHandler);

// Yearly Plans
planningRouter.get('/year', listYearPlansHandler);
planningRouter.get('/year/:year', getYearPlanHandler);
planningRouter.post('/year', createYearPlanHandler);
planningRouter.patch('/year/:year', updateYearPlanHandler);

// Monthly Plans
planningRouter.get('/month', listMonthPlansHandler);
planningRouter.get('/month/:year/:month', getMonthPlanHandler);
planningRouter.post('/month', createMonthPlanHandler);
planningRouter.patch('/month/:year/:month', updateMonthPlanHandler);

// Outcome Tracking Engine
planningRouter.get('/outcomes', listOutcomesHandler);
planningRouter.post('/outcomes', createOutcomeHandler);
planningRouter.patch('/outcomes/:id', updateOutcomeHandler);
planningRouter.delete('/outcomes/:id', deleteOutcomeHandler);
planningRouter.post('/outcomes/:id/confirm', confirmOutcomeHandler);
planningRouter.post('/outcomes/:id/evidence', linkOutcomeEvidenceHandler);

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
