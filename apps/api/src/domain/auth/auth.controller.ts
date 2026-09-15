import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { setAuthCookie, clearAuthCookie } from '../../utils/cookies.js';
import { sendSuccess } from '../../utils/response.js';
import { toPublicUser } from './auth.utils.js';
import { loginSchema } from '@kenenisa-os/shared';
import type { AuthenticatedRequest } from './auth.types.js';

export class AuthController {
  /**
   * POST /api/v1/auth/login
   */
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = loginSchema.parse(req.body);
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.socket.remoteAddress;

      const { rawToken, user } = await AuthService.login(validatedInput, userAgent, ipAddress);

      setAuthCookie(res, rawToken);

      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Login successful',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as Partial<AuthenticatedRequest>;
      if (authReq.session && authReq.user) {
        await AuthService.logout(authReq.session.id, authReq.user.id);
      }

      clearAuthCookie(res);

      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Logged out successfully',
        data: null,
      });
    } catch (error) {
      clearAuthCookie(res);
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  public static me(req: Request, res: Response, next: NextFunction): void {
    try {
      const authReq = req as AuthenticatedRequest;

      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Authenticated user profile retrieved successfully',
        data: {
          user: toPublicUser(authReq.user),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout-all
   */
  public static async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      await AuthService.logoutAll(authReq.user.id);

      clearAuthCookie(res);

      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'All active sessions revoked successfully',
        data: null,
      });
    } catch (error) {
      clearAuthCookie(res);
      next(error);
    }
  }
}
