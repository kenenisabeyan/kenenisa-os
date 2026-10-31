import { Router } from 'express';
import { GraduationController } from './graduation.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const graduationRouter = Router();

graduationRouter.use(requireAuth);

graduationRouter.get('/overview', (req, res, next) => GraduationController.getOverview(req, res, next));
graduationRouter.post('/initialize', (req, res, next) => GraduationController.initializeWorkspace(req, res, next));
graduationRouter.patch('/settings', (req, res, next) => GraduationController.updateSettings(req, res, next));

