import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { authRateLimiter } from '../../middleware/rateLimit.js';

export const authRouter = Router();

authRouter.post('/login', authRateLimiter, (req, res, next) =>
  AuthController.login(req, res, next),
);
authRouter.post('/forgot-password', authRateLimiter, (req, res, next) =>
  AuthController.forgotPassword(req, res, next),
);
authRouter.post('/reset-password', authRateLimiter, (req, res, next) =>
  AuthController.resetPassword(req, res, next),
);
authRouter.post('/forgot-email', authRateLimiter, (req, res, next) =>
  AuthController.forgotEmail(req, res, next),
);
authRouter.post('/logout', (req, res, next) => AuthController.logout(req, res, next));
authRouter.get('/me', requireAuth, (req, res, next) => AuthController.me(req, res, next));
authRouter.post('/logout-all', requireAuth, (req, res, next) =>
  AuthController.logoutAll(req, res, next),
);
authRouter.post('/change-password', requireAuth, authRateLimiter, (req, res, next) =>
  AuthController.changePassword(req, res, next),
);
authRouter.get('/sessions', requireAuth, (req, res, next) =>
  AuthController.getActiveSessions(req, res, next),
);
authRouter.delete('/sessions/:sessionId', requireAuth, (req, res, next) =>
  AuthController.revokeSession(req, res, next),
);
authRouter.get('/audit-logs', requireAuth, (req, res, next) =>
  AuthController.getAuditLogs(req, res, next),
);


