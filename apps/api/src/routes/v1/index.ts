import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from '../../domain/auth/auth.routes.js';
import { workstreamRouter } from '../../domain/workstreams/workstream.routes.js';
import { goalRouter } from '../../domain/goals/goal.routes.js';
import { projectRouter } from '../../domain/projects/project.routes.js';
import { milestoneRouter } from '../../domain/milestones/milestone.routes.js';
import { taskRouter } from '../../domain/tasks/task.routes.js';
import { dashboardRouter } from '../../domain/dashboard/dashboard.routes.js';
import { planningRouter } from '../../domain/planning/planning.routes.js';
import { learningRouter, skillRouter } from '../../domain/learning/learning.routes.js';
import evidenceRouter from '../../domain/evidence/evidence.routes.js';
import reviewRouter from '../../domain/reviews/review.routes.js';
import analyticsRouter from '../../domain/analytics/analytics.routes.js';
import opportunityRouter from '../../domain/opportunities/opportunity.routes.js';

export const v1Router = Router();

v1Router.use('/', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/workstreams', workstreamRouter);
v1Router.use('/goals', goalRouter);
v1Router.use('/projects', projectRouter);
v1Router.use('/milestones', milestoneRouter);
v1Router.use('/tasks', taskRouter);
v1Router.use('/dashboard', dashboardRouter);
v1Router.use('/planning', planningRouter);
v1Router.use('/learning', learningRouter);
v1Router.use('/skills', skillRouter);
v1Router.use('/evidence', evidenceRouter);
v1Router.use('/reviews', reviewRouter);
v1Router.use('/analytics', analyticsRouter);
v1Router.use('/opportunities', opportunityRouter);






