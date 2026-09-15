/**
 * Authentication and authorization types for KENENISA OS.
 * Shared across apps/api and apps/web.
 */

export type UserRole = 'OWNER' | 'ADMIN' | 'USER';

export interface PublicUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSessionDto {
  id: string;
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string;
  userAgent?: string | null;
}

export interface AuthResponseData {
  user: PublicUserDto;
}

export type AuthState = 'UNKNOWN' | 'AUTHENTICATED' | 'UNAUTHENTICATED';
