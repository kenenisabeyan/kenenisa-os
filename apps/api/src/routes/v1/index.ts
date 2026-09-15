import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from '../../domain/auth/auth.routes.js';
import { workstreamRouter } from '../../domain/workstreams/workstream.routes.js';
import { goalRouter } from '../../domain/goals/goal.routes.js';
import { projectRouter } from '../../domain/projects/project.routes.js';
import { milestoneRouter } from '../../domain/milestones/milestone.routes.js';
import { taskRouter } from '../../domain/tasks/task.routes.js';

export const v1Router = Router();

v1Router.use('/', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/workstreams', workstreamRouter);
v1Router.use('/goals', goalRouter);
v1Router.use('/projects', projectRouter);
v1Router.use('/milestones', milestoneRouter);
v1Router.use('/tasks', taskRouter);

