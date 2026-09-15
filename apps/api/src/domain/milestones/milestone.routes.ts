import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  listMilestonesHandler,
  getMilestoneHandler,
  createMilestoneHandler,
  updateMilestoneHandler,
  completeMilestoneHandler,
  reopenMilestoneHandler,
  reorderMilestonesHandler,
} from './milestone.controller.js';

export const milestoneRouter = Router();

milestoneRouter.use(requireAuth);

milestoneRouter.get('/', listMilestonesHandler);
milestoneRouter.get('/:id', getMilestoneHandler);
milestoneRouter.post('/', createMilestoneHandler);
milestoneRouter.patch('/:id', updateMilestoneHandler);
milestoneRouter.post('/reorder', reorderMilestonesHandler);
milestoneRouter.post('/:id/complete', completeMilestoneHandler);
milestoneRouter.post('/:id/reopen', reopenMilestoneHandler);
