import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  listProjectsHandler,
  getProjectHandler,
  createProjectHandler,
  updateProjectHandler,
  archiveProjectHandler,
  completeProjectHandler,
  reopenProjectHandler,
} from './project.controller.js';

export const projectRouter = Router();

projectRouter.use(requireAuth);

projectRouter.get('/', listProjectsHandler);
projectRouter.get('/:id', getProjectHandler);
projectRouter.post('/', createProjectHandler);
projectRouter.patch('/:id', updateProjectHandler);
projectRouter.post('/:id/archive', archiveProjectHandler);
projectRouter.post('/:id/complete', completeProjectHandler);
projectRouter.post('/:id/reopen', reopenProjectHandler);
