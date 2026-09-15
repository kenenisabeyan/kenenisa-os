import { Router } from 'express';
import { v1Router } from './v1/index.js';
import { healthController } from '../controllers/health.controller.js';

export const apiRouter = Router();

// Mount API v1 router
apiRouter.use('/v1', v1Router);

// Legacy root /health endpoint for backward compatibility with infrastructure checks
apiRouter.get('/health', (req, res, next) => healthController.getHealth(req, res, next));
