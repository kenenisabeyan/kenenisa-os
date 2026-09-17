import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { generateSessionToken } from '../domain/auth/session.service.js';
import { UserRole } from '@prisma/client';
import type { ApiSuccessResponse, PublicUserDto } from '@kenenisa-os/shared';

interface MockPrismaUser {
  findMany: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

interface MockPrismaSession {
  findUnique: ReturnType<typeof vi.fn>;
  updateMany: ReturnType<typeof vi.fn>;
}

vi.mock('../lib/prisma.js', () => {
  const mockPrisma = {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    userSettings: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb: (tx: unknown) => unknown) => cb(mockPrisma)),
    $disconnect: vi.fn(),
  };

  return { prisma: mockPrisma };
});

const app = createApp();

describe('User Management API Test Suite (Owner / Admin Access)', () => {
  const mockOwner = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'beyankenenisa@kenenisa.com',
    passwordHash: 'hash',
    firstName: 'Kenenisa',
    lastName: 'Beyan',
    displayName: 'Kenenisa Beyan',
    role: UserRole.OWNER,
    isActive: true,
    createdAt: new Date('2026-09-15T00:00:00Z'),
    updatedAt: new Date('2026-09-15T00:00:00Z'),
  };

  const mockStandardUser = {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'team.member@kenenisa.com',
    passwordHash: 'hash',
    firstName: 'Team',
    lastName: 'Member',
    displayName: 'Team Member',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date('2026-09-16T00:00:00Z'),
    updatedAt: new Date('2026-09-16T00:00:00Z'),
  };

  let ownerToken: string;

  beforeEach(() => {
    vi.clearAllMocks();
    const { rawToken, tokenHash } = generateSessionToken();
    ownerToken = rawToken;

    const mockSessionRepo = prisma.session as unknown as MockPrismaSession;
    mockSessionRepo.findUnique.mockResolvedValue({
      id: 'session-owner',
      userId: mockOwner.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 86400000),
      lastUsedAt: new Date(),
      revokedAt: null,
      user: mockOwner,
    });
  });

  it('1. GET /api/v1/users returns all system users for Owner', async () => {
    const mockUserRepo = prisma.user as unknown as MockPrismaUser;
    mockUserRepo.findMany.mockResolvedValue([mockOwner, mockStandardUser]);

    const res = await request(app)
      .get('/api/v1/users')
      .set('Cookie', [`auth_session=${ownerToken}`]);

    expect(res.status).toBe(200);
    const body = res.body as ApiSuccessResponse<{ users: PublicUserDto[] }>;
    expect(body.success).toBe(true);
    expect(body.data.users).toHaveLength(2);
    expect(body.data.users[0].email).toBe('beyankenenisa@kenenisa.com');
  });

  it('2. POST /api/v1/users allows Owner to provision a new user account', async () => {
    const mockUserRepo = prisma.user as unknown as MockPrismaUser;
    mockUserRepo.findUnique.mockResolvedValue(null);
    mockUserRepo.create.mockResolvedValue(mockStandardUser);

    const res = await request(app)
      .post('/api/v1/users')
      .set('Cookie', [`auth_session=${ownerToken}`])
      .send({
        email: 'newuser@kenenisa.com',
        password: 'SecureUserPassword#2026!',
        firstName: 'New',
        lastName: 'Engineer',
        role: 'USER',
      });

    expect(res.status).toBe(201);
    const body = res.body as ApiSuccessResponse<{ user: PublicUserDto }>;
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe('team.member@kenenisa.com');
  });

  it('3. POST /api/v1/users rejects duplicate email creation', async () => {
    const mockUserRepo = prisma.user as unknown as MockPrismaUser;
    mockUserRepo.findUnique.mockResolvedValue(mockOwner);

    const res = await request(app)
      .post('/api/v1/users')
      .set('Cookie', [`auth_session=${ownerToken}`])
      .send({
        email: 'beyankenenisa@kenenisa.com',
        password: 'SecureUserPassword#2026!',
        firstName: 'Kenenisa',
        lastName: 'Beyan',
        role: 'OWNER',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('A user with this email address already exists');
  });

  it('4. PATCH /api/v1/users/:id updates user role and status', async () => {
    const mockUserRepo = prisma.user as unknown as MockPrismaUser;
    mockUserRepo.findUnique.mockResolvedValue(mockStandardUser);
    mockUserRepo.update.mockResolvedValue({
      ...mockStandardUser,
      role: UserRole.ADMIN,
    });

    const res = await request(app)
      .patch(`/api/v1/users/${mockStandardUser.id}`)
      .set('Cookie', [`auth_session=${ownerToken}`])
      .send({ role: 'ADMIN' });

    expect(res.status).toBe(200);
    const body = res.body as ApiSuccessResponse<{ user: PublicUserDto }>;
    expect(body.data.user.role).toBe('ADMIN');
  });

  it('5. GET /api/v1/users fails with 403 for unauthorized non-admin user', async () => {
    const { rawToken, tokenHash } = generateSessionToken();
    const mockSessionRepo = prisma.session as unknown as MockPrismaSession;
    mockSessionRepo.findUnique.mockResolvedValue({
      id: 'session-standard',
      userId: mockStandardUser.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 86400000),
      lastUsedAt: new Date(),
      revokedAt: null,
      user: mockStandardUser,
    });

    const res = await request(app)
      .get('/api/v1/users')
      .set('Cookie', [`auth_session=${rawToken}`]);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
