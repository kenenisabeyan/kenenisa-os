import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { authRateLimiter } from '../../middleware/rateLimit.js';

export const authRouter = Router();

authRouter.post('/login', authRateLimiter, (req, res, next) =>
  AuthController.login(req, res, next),
);
authRouter.post('/logout', (req, res, next) => AuthController.logout(req, res, next));
authRouter.get('/me', requireAuth, (req, res, next) => AuthController.me(req, res, next));
authRouter.post('/logout-all', requireAuth, (req, res, next) =>
  AuthController.logoutAll(req, res, next),
);
