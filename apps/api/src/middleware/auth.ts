import type { Request, Response, NextFunction } from 'express';
import { validateSession } from '../domain/auth/session.service.js';
import { AUTH_COOKIE_NAME } from '../utils/cookies.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import type { AuthenticatedRequest } from '../domain/auth/auth.types.js';
import type { UserRole } from '@kenenisa-os/shared';

/**
 * Authentication Middleware (`requireAuth`)
 * Extracts raw session token from HTTP-only cookie (or Bearer header in test env),
 * validates the token hash against active PostgreSQL sessions, verifies user active status,
 * and attaches `user` and `session` to the request context.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const cookies = req.cookies as Record<string, string> | undefined;
    let rawToken: string | undefined = cookies?.[AUTH_COOKIE_NAME];

    // Fallback support for Authorization: Bearer <token> (useful in automated tests)
    if (!rawToken && req.headers.authorization?.startsWith('Bearer ')) {
      rawToken = req.headers.authorization.substring(7);
    }

    if (!rawToken) {
      throw new AuthenticationError('Authentication required');
    }

    const result = await validateSession(rawToken);

    if (!result) {
      throw new AuthenticationError('Invalid or expired session');
    }

    (req as AuthenticatedRequest).user = result.user;
    (req as AuthenticatedRequest).session = result.session;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Authorization Middleware (`requireRole`)
 * Checks that the authenticated user possesses one of the allowed system roles.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      return next(new AuthorizationError('You are not authorized to perform this action'));
    }

    next();
  };
}

/**
 * Owner-only Authorization Guard (`requireOwner`)
 */
export const requireOwner = requireRole('OWNER');

/**
 * Scopes database query parameters to the authenticated user ID to enforce IDOR protection.
 */
export function getAuthenticatedUserId(req: Request): string {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    throw new AuthenticationError('Authentication required');
  }
  return authReq.user.id;
}
