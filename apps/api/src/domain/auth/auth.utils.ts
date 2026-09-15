import type { User } from '@prisma/client';
import type { PublicUserDto } from '@kenenisa-os/shared';

/**
 * Serializes internal Prisma User model into safe PublicUserDto.
 * Explicitly excludes passwordHash and any sensitive fields.
 */
export function toPublicUser(user: User): PublicUserDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
