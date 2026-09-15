import { Router } from 'express';
import { healthController } from '../../controllers/health.controller.js';

export const healthRouter = Router();

healthRouter.get('/health', (req, res, next) => healthController.getHealth(req, res, next));
healthRouter.get('/live', (req, res, next) => healthController.getLiveness(req, res, next));
healthRouter.get('/ready', (req, res, next) => healthController.getReadiness(req, res, next));
