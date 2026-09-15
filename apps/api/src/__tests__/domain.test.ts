import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { generateSessionToken } from '../domain/auth/session.service.js';
import { UserRole, WorkstreamStatus, GoalStatus, TaskPriority } from '@prisma/client';
import type { ApiSuccessResponse, ApiErrorResponse } from '@kenenisa-os/shared';

// Typed interface for Prisma mock functions
interface MockPrismaModel {
  findMany: ReturnType<typeof vi.fn>;
  findFirst: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  updateMany: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

vi.mock('../lib/prisma.js', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
    },
    workstream: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    goal: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    milestone: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((items: unknown) => {
      if (Array.isArray(items)) {
        return Promise.all(items);
      }
      if (typeof items === 'function') {
        return (items as (tx: unknown) => unknown)(mockPrisma);
      }
      return Promise.resolve(items);
    }),
  };

  return { prisma: mockPrisma };
});

const app = createApp();

describe('Step 4 Domain Test Suite (Workstreams → Goals → Projects → Milestones)', () => {
  const mockUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'kenenisa@kenenisa-os.internal',
    passwordHash: 'hash',
    firstName: 'Kenenisa',
    lastName: 'Beyan',
    displayName: 'Kenenisa Beyan',
    role: UserRole.OWNER,
    isActive: true,
  };

  const wsId1 = '22222222-2222-2222-2222-222222222222';
  const wsId2 = '33333333-3333-3333-3333-333333333333';
  const goalId1 = '44444444-4444-4444-4444-444444444444';
  const milestoneId1 = '55555555-5555-5555-5555-555555555555';
  const milestoneId2 = '66666666-6666-6666-6666-666666666666';

  const { rawToken, tokenHash } = generateSessionToken();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup active authentication session by default
    (prisma.session.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'session-123',
      userId: mockUser.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 86400000),
      lastUsedAt: new Date(),
      revokedAt: null,
      user: mockUser,
    });
  });

  describe('1. Workstream Management & IDOR Protection', () => {
    it('GET /api/v1/workstreams retrieves user-scoped list', async () => {
      const mockWs = {
        id: wsId1,
        userId: mockUser.id,
        name: 'AI Engineering',
        slug: 'ai-engineering',
        description: 'LLM research',
        status: WorkstreamStatus.ACTIVE,
        priorityWeight: 8,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { goals: 2, projects: 1 },
      };

      (prisma.workstream.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([mockWs]);
      (prisma.workstream.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/workstreams')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<typeof mockWs[]>;
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe('AI Engineering');
    });

    it('GET /api/v1/workstreams/:id returns 404 for another user resource (IDOR protection)', async () => {
      (prisma.workstream.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/workstreams/77777777-7777-7777-7777-777777777777')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(404);
      const body = res.body as ApiErrorResponse;
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND');
    });

    it('POST /api/v1/workstreams creates a new workstream', async () => {
      const createdWs = {
        id: wsId1,
        userId: mockUser.id,
        name: 'EDOT Platform',
        slug: 'edot-platform',
        description: 'Digital education tools',
        status: WorkstreamStatus.ACTIVE,
        priorityWeight: 7,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.workstream.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (prisma.workstream.create as ReturnType<typeof vi.fn>).mockResolvedValue(createdWs);

      const res = await request(app)
        .post('/api/v1/workstreams')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          name: 'EDOT Platform',
          priorityWeight: 7,
        });

      expect(res.status).toBe(201);
      const body = res.body as ApiSuccessResponse<typeof createdWs>;
      expect(body.success).toBe(true);
      expect(body.data.slug).toBe('edot-platform');
    });
  });

  describe('2. Goals Management & Status Transitions', () => {
    it('POST /api/v1/goals creates goal under user workstream', async () => {
      const mockWs = { id: wsId1, userId: mockUser.id };
      (prisma.workstream.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockWs);

      const createdGoal = {
        id: goalId1,
        userId: mockUser.id,
        workstreamId: wsId1,
        title: 'Complete ASTU Graduation Requirements',
        status: GoalStatus.PLANNED,
        priority: TaskPriority.P1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.goal.create as ReturnType<typeof vi.fn>).mockResolvedValue(createdGoal);

      const res = await request(app)
        .post('/api/v1/goals')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          workstreamId: wsId1,
          title: 'Complete ASTU Graduation Requirements',
          priority: 'P1',
        });

      expect(res.status).toBe(201);
      const body = res.body as ApiSuccessResponse<typeof createdGoal>;
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Complete ASTU Graduation Requirements');
    });

    it('POST /api/v1/goals/:id/complete updates status to ACHIEVED and sets completedAt timestamp', async () => {
      const existingGoal = {
        id: goalId1,
        userId: mockUser.id,
        workstreamId: wsId1,
        title: 'Achieve Goal',
        status: GoalStatus.IN_PROGRESS,
        completedAt: null,
      };

      (prisma.goal.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(existingGoal);
      (prisma.goal.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...existingGoal,
        status: GoalStatus.ACHIEVED,
        completedAt: new Date(),
      });

      const res = await request(app)
        .post(`/api/v1/goals/${goalId1}/complete`)
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<typeof existingGoal>;
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('ACHIEVED');
    });
  });

  describe('3. Projects & Cross-Workstream Mismatch Validation', () => {
    it('POST /api/v1/projects rejects goal belonging to a different workstream', async () => {
      const mockWs = { id: wsId1, userId: mockUser.id };
      const mismatchGoal = { id: goalId1, userId: mockUser.id, workstreamId: wsId2 };

      (prisma.workstream.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockWs);
      (prisma.goal.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mismatchGoal);

      const res = await request(app)
        .post('/api/v1/projects')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          workstreamId: wsId1,
          goalId: goalId1,
          name: 'KENENISA OS Core',
        });

      expect(res.status).toBe(400);
      const body = res.body as ApiErrorResponse;
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('4. Milestones & Transactional Reordering', () => {
    it('POST /api/v1/milestones/reorder transactionally updates milestone sort orders', async () => {
      const m1 = { id: milestoneId1, userId: mockUser.id, projectId: '88888888-8888-8888-8888-888888888888', sortOrder: 1 };
      const m2 = { id: milestoneId2, userId: mockUser.id, projectId: '88888888-8888-8888-8888-888888888888', sortOrder: 2 };

      const milestoneRepo = prisma.milestone as unknown as MockPrismaModel;
      milestoneRepo.findFirst
        .mockResolvedValueOnce(m1)
        .mockResolvedValueOnce(m2);

      const res = await request(app)
        .post('/api/v1/milestones/reorder')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          items: [
            { id: milestoneId1, sortOrder: 2 },
            { id: milestoneId2, sortOrder: 1 },
          ],
        });

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<{ success: boolean; count: number }>;
      expect(body.success).toBe(true);
      expect(body.data.count).toBe(2);
    });
  });
});
