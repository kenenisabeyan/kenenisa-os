import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  listGoalsHandler,
  getGoalHandler,
  createGoalHandler,
  updateGoalHandler,
  completeGoalHandler,
  reopenGoalHandler,
} from './goal.controller.js';

export const goalRouter = Router();

goalRouter.use(requireAuth);

goalRouter.get('/', listGoalsHandler);
goalRouter.get('/:id', getGoalHandler);
goalRouter.post('/', createGoalHandler);
goalRouter.patch('/:id', updateGoalHandler);
goalRouter.post('/:id/complete', completeGoalHandler);
goalRouter.post('/:id/reopen', reopenGoalHandler);
