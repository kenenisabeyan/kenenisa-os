import crypto from 'crypto';
import { prisma } from '../../lib/prisma.js';
import { verifyPassword, hashPassword } from '../../utils/password.js';
import { AuthenticationError } from '../../utils/errors.js';
import { createSession, revokeSession, revokeAllSessionsForUser } from './session.service.js';
import { toPublicUser } from './auth.utils.js';
import { recordAuditLog } from '../../services/audit.service.js';
import type {
  LoginInput,
  PublicUserDto,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@kenenisa-os/shared';

interface PasswordResetCode {
  userId: string;
  email: string;
  code: string;
  expiresAt: number;
}

// In-memory token store for password reset verification codes (15-minute TTL)
const resetCodeStore = new Map<string, PasswordResetCode>();

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

  /**
   * Updates user password after verifying current password.
   */
  public static async changePassword(
    userId: string,
    input: ChangePasswordInput,
    ipAddress?: string,
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    const isCurrentValid = await verifyPassword(user.passwordHash, input.currentPassword);
    if (!isCurrentValid) {
      await recordAuditLog({
        userId: user.id,
        entityType: 'User',
        entityId: user.id,
        action: 'PASSWORD_CHANGE_FAILURE',
        metadata: { reason: 'Incorrect current password', ipAddress },
      });
      throw new AuthenticationError('Current password is incorrect');
    }

    const newPasswordHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    await recordAuditLog({
      userId: user.id,
      entityType: 'User',
      entityId: user.id,
      action: 'PASSWORD_CHANGE_SUCCESS',
      metadata: { ipAddress },
    });
  }

  /**
   * Generates a 6-digit password reset verification code for a valid user.
   */
  public static async requestPasswordReset(
    input: ForgotPasswordInput,
    ipAddress?: string,
  ): Promise<{ email: string; resetCode: string; expiresInMinutes: number }> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.isActive) {
      throw new AuthenticationError('No active account found with this email address.');
    }

    // Generate cryptographically secure 6-digit numeric recovery code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expiresInMinutes = 15;
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

    resetCodeStore.set(normalizedEmail, {
      userId: user.id,
      email: normalizedEmail,
      code: resetCode,
      expiresAt,
    });

    console.info(`🔑 [KENENISA OS Security] Password reset code for ${normalizedEmail}: ${resetCode}`);

    await recordAuditLog({
      userId: user.id,
      entityType: 'User',
      entityId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      metadata: { ipAddress, expiresInMinutes },
    });

    return {
      email: normalizedEmail,
      resetCode,
      expiresInMinutes,
    };
  }

  /**
   * Verifies the 6-digit reset code and sets a new password.
   */
  public static async resetPassword(
    input: ResetPasswordInput,
    ipAddress?: string,
  ): Promise<void> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const entry = resetCodeStore.get(normalizedEmail);

    if (!entry) {
      throw new AuthenticationError(
        'No pending password reset request found. Please request a new code.',
      );
    }

    if (Date.now() > entry.expiresAt) {
      resetCodeStore.delete(normalizedEmail);
      throw new AuthenticationError('Password reset code has expired. Please request a new code.');
    }

    if (entry.code !== input.code.trim()) {
      await recordAuditLog({
        userId: entry.userId,
        entityType: 'User',
        entityId: entry.userId,
        action: 'PASSWORD_RESET_FAILURE',
        metadata: { reason: 'Invalid verification code', ipAddress },
      });
      throw new AuthenticationError('Invalid reset verification code. Please check and try again.');
    }

    const newPasswordHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: entry.userId },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate existing sessions across all devices for security
    await revokeAllSessionsForUser(entry.userId);

    // Consume the reset code
    resetCodeStore.delete(normalizedEmail);

    await recordAuditLog({
      userId: entry.userId,
      entityType: 'User',
      entityId: entry.userId,
      action: 'PASSWORD_RESET_SUCCESS',
      metadata: { ipAddress },
    });

    console.info(`✅ [KENENISA OS Security] Password successfully reset for ${normalizedEmail}`);
  }

  /**
   * Retrieves security audit logs for a user.
   */
  public static async getAuditLogsForUser(userId: string, limit = 50) {
    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return logs.map((log) => ({
      id: log.id,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      metadata: log.metadata as Record<string, unknown> | null,
      createdAt: log.createdAt.toISOString(),
    }));
  }
}


