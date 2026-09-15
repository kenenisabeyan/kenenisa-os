import { prisma } from '../../lib/prisma.js';
import { verifyPassword } from '../../utils/password.js';
import { AuthenticationError } from '../../utils/errors.js';
import { createSession, revokeSession, revokeAllSessionsForUser } from './session.service.js';
import { toPublicUser } from './auth.utils.js';
import { recordAuditLog } from '../../services/audit.service.js';
import type { LoginInput, PublicUserDto } from '@kenenisa-os/shared';

export interface LoginResult {
  rawToken: string;
  user: PublicUserDto;
}

export class AuthService {
  /**
   * Authenticates a user by email and password.
   * On success, creates a new session and returns the unhashed session token & safe public user DTO.
   * On failure, throws a generic AuthenticationError to prevent user enumeration.
   */
  public static async login(
    input: LoginInput,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<LoginResult> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.isActive) {
      // Record failed login audit log for existing user or unknown attempt
      if (user) {
        await recordAuditLog({
          userId: user.id,
          entityType: 'User',
          entityId: user.id,
          action: 'LOGIN_FAILURE',
          metadata: { reason: 'User inactive or bad credentials', ipAddress },
        });
      }
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(user.passwordHash, input.password);

    if (!isPasswordValid) {
      await recordAuditLog({
        userId: user.id,
        entityType: 'User',
        entityId: user.id,
        action: 'LOGIN_FAILURE',
        metadata: { reason: 'Invalid password', ipAddress },
      });
      throw new AuthenticationError('Invalid email or password');
    }

    // Password is valid -> create fresh session
    const { rawToken, session } = await createSession({
      userId: user.id,
      userAgent,
      ipAddress,
    });

    // Record login audit event
    await recordAuditLog({
      userId: user.id,
      entityType: 'Session',
      entityId: session.id,
      action: 'LOGIN_SUCCESS',
      metadata: { userAgent, ipAddress },
    });

    return {
      rawToken,
      user: toPublicUser(user),
    };
  }

  /**
   * Logs out the current session by revoking it in the database.
   */
  public static async logout(sessionId: string, userId: string): Promise<void> {
    await revokeSession(sessionId);
    await recordAuditLog({
      userId,
      entityType: 'Session',
      entityId: sessionId,
      action: 'LOGOUT',
    });
  }

  /**
   * Logs out all active sessions for a user.
   */
  public static async logoutAll(userId: string): Promise<number> {
    const count = await revokeAllSessionsForUser(userId);
    await recordAuditLog({
      userId,
      entityType: 'User',
      entityId: userId,
      action: 'SESSION_REVOKED',
      metadata: { count },
    });
    return count;
  }
}
