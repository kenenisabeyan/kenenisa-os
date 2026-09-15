import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { UserRole } from '@prisma/client';
import type {
  ApiSuccessResponse,
  LearningItemDto,
  SkillDto,
  SkillDetailDto,
  LearningActivityDto,
  LearningMetricsDto,
} from '@kenenisa-os/shared';

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
    skill: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    learningItem: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    learningActivity: {
      create: vi.fn(),
      aggregate: vi.fn(),
    },
    learningItemSkill: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});

describe('Learning & Skills Intelligence Integration Test Suite', () => {
  let app: ReturnType<typeof createApp>;
  const rawToken = 'test-session-token-1234567890';

  const mockUser = {
    id: 'user-owner-123',
    email: 'kenenisa@example.com',
    firstName: 'Kenenisa',
    lastName: 'Beyan',
    displayName: 'Kenenisa Beyan',
    role: UserRole.OWNER,
    isActive: true,
  };

  const mockSession = {
    id: 'session-123',
    userId: mockUser.id,
    tokenHash: 'hashed-token',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    revokedAt: null,
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();

    (prisma.session.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
  });

  describe('1. Learning Items API', () => {
    it('GET /api/v1/learning/items returns learning items list', async () => {
      (prisma.learningItem.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        {
          id: 'li-1',
          userId: mockUser.id,
          projectId: null,
          title: 'Distributed Systems',
          description: 'Core consensus algorithms',
          type: 'COURSE',
          status: 'IN_PROGRESS',
          source: 'MIT',
          url: null,
          estimatedMinutes: 300,
          progressPercent: 20,
          startedAt: new Date(),
          targetDate: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          project: null,
          skills: [],
          activities: [{ minutes: 60 }],
          _count: { activities: 1, skills: 0 },
        },
      ]);
      (prisma.learningItem.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/learning/items')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<LearningItemDto[]>;
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].title).toBe('Distributed Systems');
      expect(body.data[0].totalLoggedMinutes).toBe(60);
    });

    it('POST /api/v1/learning/items creates learning item', async () => {
      (prisma.learningItem.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'li-new',
        userId: mockUser.id,
        projectId: null,
        title: 'PostgreSQL Internals',
        description: 'Storage engine',
        type: 'BOOK',
        status: 'NOT_STARTED',
        source: null,
        url: null,
        estimatedMinutes: 240,
        progressPercent: 0,
        startedAt: null,
        targetDate: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: null,
        skills: [],
        activities: [],
        _count: { activities: 0, skills: 0 },
      });

      const res = await request(app)
        .post('/api/v1/learning/items')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          title: 'PostgreSQL Internals',
          type: 'BOOK',
          estimatedMinutes: 240,
        });

      expect(res.status).toBe(201);
      const body = res.body as ApiSuccessResponse<LearningItemDto>;
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('PostgreSQL Internals');
    });

    it('POST /api/v1/learning/items/:id/activities records learning activity', async () => {
      (prisma.learningItem.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'li-1',
        userId: mockUser.id,
        status: 'NOT_STARTED',
      });
      (prisma.learningActivity.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'act-1',
        userId: mockUser.id,
        learningItemId: 'li-1',
        date: new Date('2026-09-16T00:00:00.000Z'),
        minutes: 90,
        notes: 'Read chapter 3',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (prisma.learningItem.update as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/learning/items/li-1/activities')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          minutes: 90,
          notes: 'Read chapter 3',
        });

      expect(res.status).toBe(201);
      const body = res.body as ApiSuccessResponse<LearningActivityDto>;
      expect(body.success).toBe(true);
      expect(body.data.minutes).toBe(90);
    });

    it('GET /api/v1/learning/metrics computes factual metrics', async () => {
      (prisma.learningItem.count as ReturnType<typeof vi.fn>).mockImplementation((opts: { where?: { status?: string; projectId?: { not: null } } }) => {
        if (opts?.where?.status === 'IN_PROGRESS') return Promise.resolve(2);
        if (opts?.where?.status === 'COMPLETED') return Promise.resolve(3);
        if (opts?.where?.projectId) return Promise.resolve(1);
        return Promise.resolve(5);
      });
      (prisma.learningActivity.aggregate as ReturnType<typeof vi.fn>).mockResolvedValue({
        _sum: { minutes: 450 },
      });
      (prisma.skill.count as ReturnType<typeof vi.fn>).mockResolvedValue(4);

      const res = await request(app)
        .get('/api/v1/learning/metrics')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<LearningMetricsDto>;
      expect(body.success).toBe(true);
      expect(body.data.totalItems).toBe(5);
      expect(body.data.totalLoggedMinutes).toBe(450);
      expect(body.data.activeSkillsCount).toBe(4);
    });
  });

  describe('2. Skills API & Relationships', () => {
    it('POST /api/v1/skills creates skill with generated slug', async () => {
      (prisma.skill.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (prisma.skill.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'skill-1',
        userId: mockUser.id,
        name: 'Database Architecture',
        slug: 'database-architecture',
        description: 'PostgreSQL & Query tuning',
        category: 'Backend',
        currentLevel: 'INTERMEDIATE',
        targetLevel: 'ADVANCED',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { learningItems: 0 },
      });

      const res = await request(app)
        .post('/api/v1/skills')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          name: 'Database Architecture',
          category: 'Backend',
          currentLevel: 'INTERMEDIATE',
          targetLevel: 'ADVANCED',
        });

      expect(res.status).toBe(201);
      const body = res.body as ApiSuccessResponse<SkillDto>;
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Database Architecture');
      expect(body.data.slug).toBe('database-architecture');
    });

    it('GET /api/v1/skills/:id returns skill detail with linked learning items', async () => {
      (prisma.skill.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'skill-1',
        userId: mockUser.id,
        name: 'Database Architecture',
        slug: 'database-architecture',
        description: null,
        category: 'Backend',
        currentLevel: 'INTERMEDIATE',
        targetLevel: 'ADVANCED',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { learningItems: 1 },
        learningItems: [
          {
            learningItem: {
              id: 'li-1',
              userId: mockUser.id,
              projectId: 'proj-1',
              title: 'PostgreSQL Optimization',
              description: null,
              type: 'COURSE',
              status: 'IN_PROGRESS',
              source: null,
              url: null,
              estimatedMinutes: 120,
              progressPercent: 50,
              startedAt: null,
              targetDate: null,
              completedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              project: { id: 'proj-1', name: 'KENENISA OS', slug: 'kenenisa-os' },
            },
          },
        ],
      });

      const res = await request(app)
        .get('/api/v1/skills/skill-1')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<SkillDetailDto>;
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Database Architecture');
      expect(body.data.learningItems).toHaveLength(1);
      expect(body.data.appliedProjects).toHaveLength(1);
      expect(body.data.appliedProjects[0].name).toBe('KENENISA OS');
    });

    it('GET /api/v1/learning/items/:id returns 404 for item owned by another user', async () => {
      (prisma.learningItem.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/learning/items/99999999-9999-9999-9999-999999999999')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(404);
    });
  });
});
