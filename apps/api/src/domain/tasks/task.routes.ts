import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  listTasksHandler,
  getTaskHandler,
  createTaskHandler,
  updateTaskHandler,
  startTaskHandler,
  blockTaskHandler,
  completeTaskHandler,
  reopenTaskHandler,
  cancelTaskHandler,
  reorderTasksHandler,
  createSubtaskHandler,
  addDependencyHandler,
  removeDependencyHandler,
} from './task.controller.js';

export const taskRouter = Router();

taskRouter.use(requireAuth);

taskRouter.get('/', listTasksHandler);
taskRouter.post('/reorder', reorderTasksHandler);
taskRouter.get('/:id', getTaskHandler);
taskRouter.post('/', createTaskHandler);
taskRouter.patch('/:id', updateTaskHandler);
taskRouter.post('/:id/start', startTaskHandler);
taskRouter.post('/:id/block', blockTaskHandler);
taskRouter.post('/:id/complete', completeTaskHandler);
taskRouter.post('/:id/reopen', reopenTaskHandler);
taskRouter.post('/:id/cancel', cancelTaskHandler);

// Subtasks & Dependencies
taskRouter.post('/:id/subtasks', createSubtaskHandler);
taskRouter.post('/:id/dependencies', addDependencyHandler);
taskRouter.delete('/:id/dependencies/:dependencyId', removeDependencyHandler);
