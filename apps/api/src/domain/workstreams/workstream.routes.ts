import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  listWorkstreamsHandler,
  getWorkstreamHandler,
  createWorkstreamHandler,
  updateWorkstreamHandler,
  archiveWorkstreamHandler,
} from './workstream.controller.js';

export const workstreamRouter = Router();

workstreamRouter.use(requireAuth);

workstreamRouter.get('/', listWorkstreamsHandler);
workstreamRouter.get('/:id', getWorkstreamHandler);
workstreamRouter.post('/', createWorkstreamHandler);
workstreamRouter.patch('/:id', updateWorkstreamHandler);
workstreamRouter.post('/:id/archive', archiveWorkstreamHandler);
