import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { getUserActiveSessions, revokeSessionForUser } from './session.service.js';
import { setAuthCookie, clearAuthCookie } from '../../utils/cookies.js';
import { sendSuccess } from '../../utils/response.js';
import { toPublicUser } from './auth.utils.js';
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  forgotEmailSchema,
} from '@kenenisa-os/shared';
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

  /**
   * POST /api/v1/auth/change-password
   */
  public static async changePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const validatedInput = changePasswordSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;

      await AuthService.changePassword(authReq.user.id, validatedInput, ipAddress);

      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Password changed successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/sessions
   */
  public static async getActiveSessions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const rawSessions = await getUserActiveSessions(authReq.user.id);

      const sessions = rawSessions.map((s) => ({
        id: s.id,
        expiresAt: s.expiresAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
        lastUsedAt: s.lastUsedAt.toISOString(),
        userAgent: s.userAgent,
        ipAddress: s.ipAddress,
        isCurrent: s.id === authReq.session.id,
      }));

      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Active sessions retrieved successfully',
        data: { sessions },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/auth/sessions/:sessionId
   */
  public static async revokeSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const sessionId = req.params.sessionId as string;

      await revokeSessionForUser(authReq.user.id, sessionId);

      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Session revoked successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/audit-logs
   */
  public static async getAuditLogs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const logs = await AuthService.getAuditLogsForUser(authReq.user.id);

      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Security audit logs retrieved successfully',
        data: { logs },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   */
  public static async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validatedInput = forgotPasswordSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;

      const result = await AuthService.requestPasswordReset(validatedInput, ipAddress);

      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Password reset code generated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   */
  public static async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validatedInput = resetPasswordSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;

      await AuthService.resetPassword(validatedInput, ipAddress);

      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Password reset successfully. You can now log in.',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/forgot-email
   */
  public static async forgotEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validatedInput = forgotEmailSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;

      const result = await AuthService.recoverEmail(validatedInput, ipAddress);

      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Matching registered accounts retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}


