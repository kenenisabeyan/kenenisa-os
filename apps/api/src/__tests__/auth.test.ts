import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateSessionToken, hashSessionToken } from '../domain/auth/session.service.js';
import { UserRole } from '@prisma/client';
import type { ApiSuccessResponse, ApiErrorResponse, PublicUserDto } from '@kenenisa-os/shared';

// Typed interface for Prisma mock functions
interface MockPrismaUser {
  findUnique: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

interface MockPrismaSession {
  create: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  updateMany: ReturnType<typeof vi.fn>;
  deleteMany: ReturnType<typeof vi.fn>;
}

// Mock Prisma client for deterministic, hermetic unit tests
vi.mock('../lib/prisma.js', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    userSettings: {
      upsert: vi.fn(),
    },
    $transaction: vi.fn((cb: (tx: unknown) => unknown) => cb(mockPrisma)),
    $disconnect: vi.fn(),
  };

  return { prisma: mockPrisma };
});

const app = createApp();

describe('Authentication & Session Comprehensive Test Suite', () => {
  const testPassword = 'kenenisa@3077215';
  let mockPasswordHash: string;
  const mockUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'beyankenenisa@kenenisa.com',
    passwordHash: '',
    firstName: 'Kenenisa',
    lastName: 'Beyan',
    displayName: 'Kenenisa Beyan',
    role: UserRole.OWNER,
    isActive: true,
    createdAt: new Date('2026-09-15T00:00:00Z'),
    updatedAt: new Date('2026-09-15T00:00:00Z'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPasswordHash = await hashPassword(testPassword);
    mockUser.passwordHash = mockPasswordHash;
  });

  describe('Password Security & Token Hashing', () => {
    it('Argon2id hashes password securely and verifies correctly', async () => {
      const hash = await hashPassword('MySecurePassword123!');
      expect(hash).toContain('$argon2id$');

      const isValid = await verifyPassword(hash, 'MySecurePassword123!');
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword(hash, 'WrongPassword123!');
      expect(isInvalid).toBe(false);
    });

    it('generateSessionToken creates cryptographically random 32-byte token and SHA-256 hash', () => {
      const { rawToken, tokenHash } = generateSessionToken();
      expect(rawToken).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(tokenHash).toHaveLength(64); // SHA-256 = 64 hex chars
      expect(tokenHash).toBe(hashSessionToken(rawToken));
      expect(tokenHash).not.toBe(rawToken);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('1. Valid owner login succeeds, sets HTTP-Only cookie, and omits passwordHash', async () => {
      const mockUserRepo = prisma.user as unknown as MockPrismaUser;
      const mockSessionRepo = prisma.session as unknown as MockPrismaSession;

      mockUserRepo.findUnique.mockResolvedValue(mockUser);
      mockSessionRepo.create.mockResolvedValue({
        id: 'session-123',
        userId: mockUser.id,
        tokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
        revokedAt: null,
      });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'beyankenenisa@kenenisa.com',
        password: testPassword,
      });

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<{ user: PublicUserDto }>;
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe('beyankenenisa@kenenisa.com');
      expect(body.data.user.role).toBe('OWNER');

      // Verify passwordHash is NOT returned in response DTO
      expect((body.data.user as unknown as Record<string, unknown>).passwordHash).toBeUndefined();

      // Verify Set-Cookie header parameters
      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('auth_session=');
      expect(cookies[0]).toContain('HttpOnly');
      expect(cookies[0]).toContain('SameSite=Lax');
      expect(cookies[0]).toContain('Path=/');
    });

    it('2. Wrong password fails with generic authentication error', async () => {
      const mockUserRepo = prisma.user as unknown as MockPrismaUser;
      mockUserRepo.findUnique.mockResolvedValue(mockUser);

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'beyankenenisa@kenenisa.com',
        password: 'IncorrectPassword123!',
      });

      expect(res.status).toBe(401);
      const body = res.body as ApiErrorResponse;
      expect(body.success).toBe(false);
      expect(body.message).toBe('Invalid email or password');
      expect(body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('3. Unknown email fails with generic authentication error (prevents user enumeration)', async () => {
      const mockUserRepo = prisma.user as unknown as MockPrismaUser;
      mockUserRepo.findUnique.mockResolvedValue(null);

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nonexistent@kenenisa.com',
        password: testPassword,
      });

      expect(res.status).toBe(401);
      const body = res.body as ApiErrorResponse;
      expect(body.success).toBe(false);
      expect(body.message).toBe('Invalid email or password');
    });

    it('4. Inactive user cannot login', async () => {
      const mockUserRepo = prisma.user as unknown as MockPrismaUser;
      mockUserRepo.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'beyankenenisa@kenenisa.com',
        password: testPassword,
      });

      expect(res.status).toBe(401);
      const body = res.body as ApiErrorResponse;
      expect(body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/v1/auth/me & Protected Routing', () => {
    it('5. GET /api/v1/auth/me succeeds with valid session token', async () => {
      const { rawToken, tokenHash } = generateSessionToken();
      const mockSessionRepo = prisma.session as unknown as MockPrismaSession;

      mockSessionRepo.findUnique.mockResolvedValue({
        id: 'session-123',
        userId: mockUser.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 86400000),
        lastUsedAt: new Date(),
        revokedAt: null,
        user: mockUser,
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<{ user: PublicUserDto }>;
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe('beyankenenisa@kenenisa.com');
      expect(body.data.user.role).toBe('OWNER');
    });

    it('6. GET /api/v1/auth/me fails without session cookie (401)', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      const body = res.body as ApiErrorResponse;
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('7. Revoked or expired session fails authentication (401)', async () => {
      const { rawToken } = generateSessionToken();
      const mockSessionRepo = prisma.session as unknown as MockPrismaSession;

      mockSessionRepo.findUnique.mockResolvedValue({
        id: 'session-123',
        userId: mockUser.id,
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() + 86400000),
        revokedAt: new Date(), // Revoked!
        user: mockUser,
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('8. Logout revokes active session and clears auth cookie', async () => {
      const { rawToken, tokenHash } = generateSessionToken();
      const mockSessionRepo = prisma.session as unknown as MockPrismaSession;

      mockSessionRepo.findUnique.mockResolvedValue({
        id: 'session-123',
        userId: mockUser.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 86400000),
        lastUsedAt: new Date(),
        revokedAt: null,
        user: mockUser,
      });

      mockSessionRepo.update.mockResolvedValue({
        id: 'session-123',
        revokedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<null>;
      expect(body.success).toBe(true);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies[0]).toContain('auth_session=;');
    });
  });

  describe('POST /api/v1/auth/change-password', () => {
    it('successfully changes password with valid current password and new valid password', async () => {
      const { rawToken, tokenHash } = generateSessionToken();
      const mockSessionRepo = prisma.session as unknown as MockPrismaSession;
      const mockUserRepo = prisma.user as unknown as MockPrismaUser;

      mockSessionRepo.findUnique.mockResolvedValue({
        id: 'session-123',
        userId: mockUser.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 86400000),
        lastUsedAt: new Date(),
        revokedAt: null,
        user: mockUser,
      });

      mockUserRepo.findUnique.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue({
        ...mockUser,
        passwordHash: 'new-hashed-password',
      });

      const res = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          currentPassword: testPassword,
          newPassword: 'NewSecurePassword#2026!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Password changed successfully');
    });

    it('fails when current password is incorrect', async () => {
      const { rawToken, tokenHash } = generateSessionToken();
      const mockSessionRepo = prisma.session as unknown as MockPrismaSession;
      const mockUserRepo = prisma.user as unknown as MockPrismaUser;

      mockSessionRepo.findUnique.mockResolvedValue({
        id: 'session-123',
        userId: mockUser.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 86400000),
        lastUsedAt: new Date(),
        revokedAt: null,
        user: mockUser,
      });

      mockUserRepo.findUnique.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          currentPassword: 'WrongCurrentPassword!',
          newPassword: 'NewSecurePassword#2026!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Current password is incorrect');
    });
  });

  describe('POST /api/v1/auth/forgot-password & /api/v1/auth/reset-password', () => {
    it('generates recovery reset code for valid user', async () => {
      const mockUserRepo = prisma.user as unknown as MockPrismaUser;
      mockUserRepo.findUnique.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: mockUser.email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(mockUser.email);
      expect(res.body.data.resetCode).toBeDefined();
      expect(typeof res.body.data.resetCode).toBe('string');
      expect(res.body.data.resetCode).toHaveLength(6);
    });

    it('fails to generate reset code for non-existent user', async () => {
      const mockUserRepo = prisma.user as unknown as MockPrismaUser;
      mockUserRepo.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@kenenisa.com' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No active account found');
    });

    it('successfully resets password with valid recovery code', async () => {
      const mockUserRepo = prisma.user as unknown as MockPrismaUser;
      mockUserRepo.findUnique.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue({ ...mockUser });

      // Step 1: Request code
      const forgotRes = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: mockUser.email });

      const code = forgotRes.body.data.resetCode;

      // Step 2: Reset password
      const resetRes = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          email: mockUser.email,
          code,
          newPassword: 'BrandNewPassword#2026!',
        });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.success).toBe(true);
      expect(resetRes.body.message).toContain('Password reset successfully');
      expect(mockUserRepo.update).toHaveBeenCalled();
    });

    it('fails to reset password with invalid code', async () => {
      const mockUserRepo = prisma.user as unknown as MockPrismaUser;
      mockUserRepo.findUnique.mockResolvedValue(mockUser);

      // Request valid code
      await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: mockUser.email });

      // Attempt with wrong code
      const resetRes = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          email: mockUser.email,
          code: '000000',
          newPassword: 'BrandNewPassword#2026!',
        });

      expect(resetRes.status).toBe(401);
      expect(resetRes.body.success).toBe(false);
      expect(resetRes.body.message).toContain('Invalid reset verification code');
    });
  });
});
