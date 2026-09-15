import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { generateSessionToken } from '../domain/auth/session.service.js';
import { UserRole, TaskStatus, TaskPriority, WorkstreamStatus, ProjectStatus } from '@prisma/client';
import type { ApiSuccessResponse, DashboardDto } from '@kenenisa-os/shared';

vi.mock('../lib/prisma.js', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
    },
    userSettings: {
      findUnique: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
    },
    workstream: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    goal: {
      count: vi.fn(),
    },
    project: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    task: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    auditLog: {
      findMany: vi.fn(),
    },
  };

  return { prisma: mockPrisma };
});

const app = createApp();

describe('Step 6 Command Center & Next Best Action Engine Test Suite', () => {
  const mockUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'kenenisa@kenenisa-os.internal',
    firstName: 'Kenenisa',
    lastName: 'Beyan',
    displayName: 'Kenenisa Beyan',
    role: UserRole.OWNER,
    isActive: true,
  };

  const { rawToken, tokenHash } = generateSessionToken();

  const createMockTask = (overrides: Record<string, unknown> = {}) => ({
    id: 'task-1',
    userId: mockUser.id,
    projectId: 'proj-1',
    milestoneId: null,
    parentTaskId: null,
    title: 'Default Task Title',
    description: 'Task description',
    status: TaskStatus.READY,
    priority: TaskPriority.P1,
    estimateMinutes: 30,
    actualMinutes: 0,
    startDate: null,
    dueDate: null,
    completedAt: null,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    project: null,
    milestone: null,
    parentTask: null,
    blockingDependencies: [],
    _count: { subtasks: 0, blockingDependencies: 0, dependentDependencies: 0 },
    ...overrides,
  });

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

    (prisma.userSettings.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: mockUser.id,
      timezone: 'UTC',
    });

    (prisma.workstream.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    (prisma.goal.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    (prisma.project.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    (prisma.task.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    (prisma.workstream.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.project.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.auditLog.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  describe('1. GET /api/v1/dashboard Endpoint Snapshot', () => {
    it('returns full Command Center snapshot with summary, NBA, today, active workstreams and projects', async () => {
      (prisma.workstream.count as ReturnType<typeof vi.fn>).mockResolvedValue(2);
      (prisma.goal.count as ReturnType<typeof vi.fn>).mockResolvedValue(5);
      (prisma.project.count as ReturnType<typeof vi.fn>).mockResolvedValue(4);
      (prisma.task.count as ReturnType<typeof vi.fn>).mockResolvedValue(10);

      const mockCandidateTask = createMockTask({
        id: 'task-1',
        title: 'High Priority Task',
        priority: TaskPriority.P1,
        dueDate: new Date('2026-09-16T12:00:00.000Z'),
        project: {
          id: 'proj-1',
          name: 'Core System',
          slug: 'core-system',
          goal: { id: 'goal-1', title: 'Achieve 100% Reliability' },
        },
      });

      (prisma.task.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([mockCandidateTask]);

      (prisma.workstream.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        {
          id: 'ws-1',
          userId: mockUser.id,
          name: 'Engineering',
          slug: 'engineering',
          description: 'Core Engineering Workstream',
          status: WorkstreamStatus.ACTIVE,
          priorityWeight: 10,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { goals: 2, projects: 3 },
        },
      ]);

      (prisma.project.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        {
          id: 'proj-1',
          userId: mockUser.id,
          workstreamId: 'ws-1',
          goalId: 'goal-1',
          name: 'Core System',
          slug: 'core-system',
          description: 'System project',
          status: ProjectStatus.ACTIVE,
          priority: TaskPriority.P1,
          startDate: null,
          targetDate: null,
          completedAt: null,
          archivedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          workstream: { id: 'ws-1', name: 'Engineering', slug: 'engineering' },
          goal: { id: 'goal-1', title: 'Achieve 100% Reliability' },
          _count: { milestones: 2, tasks: 5 },
        },
      ]);

      (prisma.auditLog.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        {
          id: 'log-1',
          userId: mockUser.id,
          action: 'CREATE',
          entityType: 'TASK',
          entityId: 'task-1',
          metadata: { title: 'High Priority Task' },
          createdAt: new Date(),
        },
      ]);

      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<DashboardDto>;
      expect(body.success).toBe(true);
      expect(body.data.summary.activeWorkstreams).toBe(2);
      expect(body.data.nextBestAction).not.toBeNull();
      expect(body.data.nextBestAction?.recommendedTask?.id).toBe('task-1');
      expect(body.data.workstreams).toHaveLength(1);
      expect(body.data.activeProjects).toHaveLength(1);
      expect(body.data.recentActivity).toHaveLength(1);
    });
  });

  describe('2. Next Best Action Deterministic Scoring Engine', () => {
    it('ranks higher score tasks first (P0 Urgent + Due Today + Goal alignment > P3 Low)', async () => {
      const urgentTask = createMockTask({
        id: 'task-urgent',
        title: 'Urgent System Repair',
        priority: TaskPriority.P0,
        dueDate: new Date('2026-09-16T08:00:00.000Z'),
        project: {
          id: 'proj-1',
          name: 'Core System',
          slug: 'core-system',
          goal: { id: 'goal-1', title: 'System Health' },
        },
      });

      const lowTask = createMockTask({
        id: 'task-low',
        title: 'Update Documentation Footer',
        priority: TaskPriority.P3,
        dueDate: null,
        project: null,
      });

      (prisma.task.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([lowTask, urgentTask]);

      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<DashboardDto>;
      expect(body.data.nextBestAction?.recommendedTask?.id).toBe('task-urgent');
      expect(body.data.nextBestAction?.score).toBeGreaterThan(70);
    });

    it('breaks score ties deterministically using (score -> dueDate -> priority -> updatedAt -> id)', async () => {
      const now = new Date('2026-09-16T01:00:00.000Z');
      const earlierDue = new Date('2026-09-16T04:00:00.000Z');
      const laterDue = new Date('2026-09-16T18:00:00.000Z');

      const taskA = createMockTask({
        id: 'task-a',
        title: 'Task A',
        priority: TaskPriority.P1,
        dueDate: laterDue,
        updatedAt: now,
      });

      const taskB = createMockTask({
        id: 'task-b',
        title: 'Task B',
        priority: TaskPriority.P1,
        dueDate: earlierDue,
        updatedAt: now,
      });

      (prisma.task.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([taskA, taskB]);

      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<DashboardDto>;
      expect(body.data.nextBestAction?.recommendedTask?.id).toBe('task-b');
    });

    it('excludes candidate tasks with active/unsatisfied BLOCKS dependencies', async () => {
      const blockedTaskCandidate = createMockTask({
        id: 'task-blocked',
        title: 'Dependent Task',
        priority: TaskPriority.P0,
        dueDate: new Date(),
        blockingDependencies: [
          {
            id: 'dep-1',
            blockingTaskId: 'blocker-1',
            dependentTaskId: 'task-blocked',
            dependencyType: 'BLOCKS',
            createdAt: new Date(),
            blockingTask: { id: 'blocker-1', title: 'Blocker Task', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.P1 },
          },
        ],
        _count: { subtasks: 0, blockingDependencies: 1, dependentDependencies: 0 },
      });

      const unblockedTask = createMockTask({
        id: 'task-clear',
        title: 'Clear Task',
        priority: TaskPriority.P2,
        dueDate: null,
      });

      (prisma.task.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([blockedTaskCandidate, unblockedTask]);

      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<DashboardDto>;
      expect(body.data.nextBestAction?.recommendedTask?.id).toBe('task-clear');
    });
  });
});
