import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { generateSessionToken } from '../domain/auth/session.service.js';
import { UserRole, TaskStatus, TaskPriority, TaskDependencyType } from '@prisma/client';
import type { ApiSuccessResponse, ApiErrorResponse } from '@kenenisa-os/shared';

vi.mock('../lib/prisma.js', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
    },
    milestone: {
      findFirst: vi.fn(),
    },
    task: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    taskDependency: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((items: unknown) => {
      if (Array.isArray(items)) {
        return Promise.all(items);
      }
      return Promise.resolve(items);
    }),
  };

  return { prisma: mockPrisma };
});

const app = createApp();

describe('Step 5 Task Execution Engine & Dependency Test Suite', () => {
  const mockUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'kenenisa@kenenisa-os.internal',
    firstName: 'Kenenisa',
    lastName: 'Beyan',
    displayName: 'Kenenisa Beyan',
    role: UserRole.OWNER,
    isActive: true,
  };

  const projId = '22222222-2222-2222-2222-222222222222';
  const taskId1 = '33333333-3333-3333-3333-333333333333';
  const taskId2 = '44444444-4444-4444-4444-444444444444';

  const { rawToken, tokenHash } = generateSessionToken();

  beforeEach(() => {
    vi.clearAllMocks();

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

  describe('1. Task CRUD & Pagination', () => {
    it('GET /api/v1/tasks retrieves user tasks', async () => {
      const mockTask = {
        id: taskId1,
        userId: mockUser.id,
        projectId: projId,
        title: 'Implement Task API',
        status: TaskStatus.READY,
        priority: TaskPriority.P1,
        estimateMinutes: 60,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.task.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([mockTask]);
      (prisma.task.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/tasks')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<typeof mockTask[]>;
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].title).toBe('Implement Task API');
    });

    it('POST /api/v1/tasks creates a task under a valid project', async () => {
      (prisma.project.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: projId,
        userId: mockUser.id,
      });

      const createdTask = {
        id: taskId1,
        userId: mockUser.id,
        projectId: projId,
        title: 'Setup PostgreSQL Indexes',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.P2,
        estimateMinutes: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.task.create as ReturnType<typeof vi.fn>).mockResolvedValue(createdTask);

      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          projectId: projId,
          title: 'Setup PostgreSQL Indexes',
          estimateMinutes: 30,
        });

      expect(res.status).toBe(201);
      const body = res.body as ApiSuccessResponse<typeof createdTask>;
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Setup PostgreSQL Indexes');
    });
  });

  describe('2. Task State Machine & Readiness Algorithm', () => {
    it('POST /api/v1/tasks/:id/start fails if task has unresolved blockers', async () => {
      (prisma.task.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: taskId1,
        userId: mockUser.id,
        status: TaskStatus.BLOCKED,
      });

      // Mock 1 unsatisfied blocker
      (prisma.taskDependency.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

      const res = await request(app)
        .post(`/api/v1/tasks/${taskId1}/start`)
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(400);
      const body = res.body as ApiErrorResponse;
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('TASK_HAS_UNRESOLVED_DEPENDENCIES');
    });

    it('POST /api/v1/tasks/:id/complete updates status to DONE and sets completedAt timestamp', async () => {
      (prisma.task.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: taskId1,
        userId: mockUser.id,
        status: TaskStatus.IN_PROGRESS,
      });

      (prisma.task.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: taskId1,
        userId: mockUser.id,
        status: TaskStatus.DONE,
        completedAt: new Date(),
      });

      (prisma.taskDependency.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const res = await request(app)
        .post(`/api/v1/tasks/${taskId1}/complete`)
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<{ status: string }>;
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('DONE');
    });
  });

  describe('3. Dependency Cycle Detection & Safety', () => {
    it('POST /api/v1/tasks/:id/dependencies rejects self dependency (A -> A)', async () => {
      const res = await request(app)
        .post(`/api/v1/tasks/${taskId1}/dependencies`)
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          blockingTaskId: taskId1,
          dependencyType: TaskDependencyType.BLOCKS,
        });

      expect(res.status).toBe(400);
      const body = res.body as ApiErrorResponse;
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('SELF_DEPENDENCY_NOT_ALLOWED');
    });

    it('POST /api/v1/tasks/:id/dependencies rejects cycle (A -> B -> A)', async () => {
      (prisma.task.findFirst as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ id: taskId1, userId: mockUser.id }) // dependentTask
        .mockResolvedValueOnce({ id: taskId2, userId: mockUser.id }); // blockingTask

      (prisma.taskDependency.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      // Simulate BFS: taskId2 leads to taskId1
      (prisma.taskDependency.findMany as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce([{ dependentTaskId: taskId2 }])
        .mockResolvedValueOnce([{ dependentTaskId: taskId1 }]);

      const res = await request(app)
        .post(`/api/v1/tasks/${taskId1}/dependencies`)
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          blockingTaskId: taskId2,
          dependencyType: TaskDependencyType.BLOCKS,
        });

      expect(res.status).toBe(400);
      const body = res.body as ApiErrorResponse;
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('DEPENDENCY_CYCLE_DETECTED');
    });
  });

  describe('4. IDOR Protection', () => {
    it('GET /api/v1/tasks/:id returns 404 for task owned by another user', async () => {
      (prisma.task.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/tasks/99999999-9999-9999-9999-999999999999')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(404);
      const body = res.body as ApiErrorResponse;
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('RESOURCE_NOT_FOUND');
    });
  });
});
