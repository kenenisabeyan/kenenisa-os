import { prisma } from '../../lib/prisma.js';
import { hashPassword } from '../../utils/password.js';
import { ConflictError, NotFoundError, ValidationError } from '../../utils/errors.js';
import { toPublicUser } from '../auth/auth.utils.js';
import { recordAuditLog } from '../../services/audit.service.js';
import { revokeAllSessionsForUser } from '../auth/session.service.js';
import { UserRole, TaskPriority } from '@prisma/client';
import type { CreateUserInput, UpdateUserInput, PublicUserDto } from '@kenenisa-os/shared';

export class UserService {
  /**
   * Retrieves all registered users in the system.
   */
  public static async getAllUsers(): Promise<PublicUserDto[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map(toPublicUser);
  }

  /**
   * Retrieves a single user by ID.
   */
  public static async getUserById(userId: string): Promise<PublicUserDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return toPublicUser(user);
  }

  /**
   * Creates/provisions a new user account (Owner / Admin action).
   */
  public static async createUser(
    input: CreateUserInput,
    createdByUserId: string,
    ipAddress?: string,
  ): Promise<PublicUserDto> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Check email uniqueness
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const displayName =
      input.displayName?.trim() || `${input.firstName.trim()} ${input.lastName.trim()}`;
    const role = (input.role as UserRole) || UserRole.USER;

    // Atomically create user and default UserSettings inside transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          displayName,
          role,
          isActive: true,
        },
      });

      await tx.userSettings.create({
        data: {
          userId: user.id,
          timezone: 'Africa/Addis_Ababa',
          weekStartsOn: 1,
          dailyWorkCapacityMinutes: 480,
          weeklyWorkCapacityMinutes: 2400,
          defaultTaskPriority: TaskPriority.P2,
          defaultProjectView: 'board',
          theme: 'dark',
        },
      });

      return user;
    });

    await recordAuditLog({
      userId: createdByUserId,
      entityType: 'User',
      entityId: newUser.id,
      action: 'USER_CREATED',
      metadata: { email: newUser.email, role: newUser.role, ipAddress },
    });

    return toPublicUser(newUser);
  }

  /**
   * Updates an existing user account's profile, role, or active status.
   */
  public static async updateUser(
    targetUserId: string,
    input: UpdateUserInput,
    updatedByUserId: string,
    ipAddress?: string,
  ): Promise<PublicUserDto> {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Prevent deactivating own account if performing operation on self
    if (targetUserId === updatedByUserId && input.isActive === false) {
      throw new ValidationError('You cannot deactivate your own active account');
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(input.firstName && { firstName: input.firstName.trim() }),
        ...(input.lastName && { lastName: input.lastName.trim() }),
        ...(input.displayName && { displayName: input.displayName.trim() }),
        ...(input.role && { role: input.role as UserRole }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });

    // If user was deactivated, revoke all active sessions immediately
    if (input.isActive === false) {
      await revokeAllSessionsForUser(targetUserId);
    }

    await recordAuditLog({
      userId: updatedByUserId,
      entityType: 'User',
      entityId: targetUserId,
      action: 'USER_UPDATED',
      metadata: { changes: input, ipAddress },
    });

    return toPublicUser(updatedUser);
  }

  /**
   * Deletes / removes a user account.
   */
  public static async deleteUser(
    targetUserId: string,
    deletedByUserId: string,
    ipAddress?: string,
  ): Promise<void> {
    if (targetUserId === deletedByUserId) {
      throw new ValidationError('You cannot delete your own logged-in account');
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await revokeAllSessionsForUser(targetUserId);
    await prisma.user.delete({
      where: { id: targetUserId },
    });

    await recordAuditLog({
      userId: deletedByUserId,
      entityType: 'User',
      entityId: targetUserId,
      action: 'USER_DELETED',
      metadata: { deletedEmail: user.email, ipAddress },
    });
  }
}
