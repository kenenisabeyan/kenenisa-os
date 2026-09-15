import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { generateSessionToken } from '../domain/auth/session.service.js';
import { UserRole, TimeBlockStatus } from '@prisma/client';
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  DailyPlanningResponseDto,
  DailyPlanDto,
  TimeBlockDto,
  DailyCapacityDto,
  WeeklyPlanningResponseDto,
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
    dailyPlan: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    timeBlock: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    weeklyPlan: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    task: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  };

  return { prisma: mockPrisma };
});

const app = createApp();

describe('Step 7 Planning & Capacity Engine Test Suite', () => {
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
      weekStartsOn: 1,
      dailyWorkCapacityMinutes: 480,
      weeklyWorkCapacityMinutes: 2400,
    });
  });

  describe('1. Daily Plan Endpoints & Ownership', () => {
    it('GET /api/v1/planning/daily returns daily planning overview', async () => {
      (prisma.dailyPlan.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (prisma.timeBlock.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (prisma.task.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/planning/daily?date=2026-09-16')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<DailyPlanningResponseDto>;
      expect(body.success).toBe(true);
      expect(body.data.date).toBe('2026-09-16');
      expect(body.data.capacity.capacityMinutes).toBe(480);
      expect(body.data.capacity.plannedMinutes).toBe(0);
    });

    it('POST /api/v1/planning/daily creates a daily plan', async () => {
      (prisma.dailyPlan.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (prisma.dailyPlan.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'dp-1',
        userId: mockUser.id,
        date: new Date('2026-09-16T00:00:00.000Z'),
        mustWinTaskId: null,
        notes: 'Initial daily plan',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        mustWinTask: null,
      });

      const res = await request(app)
        .post('/api/v1/planning/daily')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          date: '2026-09-16',
          notes: 'Initial daily plan',
        });

      expect(res.status).toBe(201);
      const body = res.body as ApiSuccessResponse<DailyPlanDto>;
      expect(body.success).toBe(true);
      expect(body.data.date).toBe('2026-09-16');
    });

    it('POST /api/v1/planning/daily fails if duplicate plan exists for date', async () => {
      (prisma.dailyPlan.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'dp-1',
        userId: mockUser.id,
        date: new Date('2026-09-16T00:00:00.000Z'),
      });

      const res = await request(app)
        .post('/api/v1/planning/daily')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({ date: '2026-09-16' });

      expect(res.status).toBe(400);
      const body = res.body as ApiErrorResponse;
      expect(body.success).toBe(false);
    });
  });

  describe('2. Time Block Validation & Schedule Conflict Detection', () => {
    it('POST /api/v1/planning/time-blocks rejects invalid time range (startAt >= endAt)', async () => {
      const res = await request(app)
        .post('/api/v1/planning/time-blocks')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          title: 'Invalid Block',
          startAt: '2026-09-16T10:00:00.000Z',
          endAt: '2026-09-16T09:00:00.000Z',
        });

      expect(res.status).toBe(400);
      const body = res.body as ApiErrorResponse;
      expect(body.success).toBe(false);
    });

    it('POST /api/v1/planning/time-blocks rejects overlapping time block with HTTP 400 TIME_BLOCK_CONFLICT', async () => {
      // Mock existing overlapping block from 09:00 to 11:00
      (prisma.timeBlock.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        {
          id: 'tb-existing',
          title: 'Existing Deep Work',
          startAt: new Date('2026-09-16T09:00:00.000Z'),
          endAt: new Date('2026-09-16T11:00:00.000Z'),
        },
      ]);

      const res = await request(app)
        .post('/api/v1/planning/time-blocks')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          title: 'Conflicting Meeting',
          startAt: '2026-09-16T10:00:00.000Z',
          endAt: '2026-09-16T12:00:00.000Z',
        });

      expect(res.status).toBe(400);
      const body = res.body as ApiErrorResponse;
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('TIME_BLOCK_CONFLICT');
    });

    it('POST /api/v1/planning/time-blocks allows adjacent time blocks (09:00-10:00 and 10:00-11:00)', async () => {
      // Mock no overlapping block for adjacent window
      (prisma.timeBlock.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (prisma.timeBlock.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'tb-2',
        userId: mockUser.id,
        dailyPlanId: null,
        taskId: null,
        title: 'Adjacent Block',
        startAt: new Date('2026-09-16T10:00:00.000Z'),
        endAt: new Date('2026-09-16T11:00:00.000Z'),
        status: TimeBlockStatus.PLANNED,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        task: null,
      });

      const res = await request(app)
        .post('/api/v1/planning/time-blocks')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          title: 'Adjacent Block',
          startAt: '2026-09-16T10:00:00.000Z',
          endAt: '2026-09-16T11:00:00.000Z',
        });

      expect(res.status).toBe(201);
      const body = res.body as ApiSuccessResponse<TimeBlockDto>;
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Adjacent Block');
    });
  });

  describe('3. Capacity Engine Calculations', () => {
    it('GET /api/v1/planning/capacity/daily computes plannedMinutes, utilizationPercent, and overCapacity', async () => {
      (prisma.timeBlock.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        {
          startAt: new Date('2026-09-16T09:00:00.000Z'),
          endAt: new Date('2026-09-16T13:00:00.000Z'), // 240 mins
        },
        {
          startAt: new Date('2026-09-16T14:00:00.000Z'),
          endAt: new Date('2026-09-16T18:00:00.000Z'), // 240 mins
        },
      ]);

      const res = await request(app)
        .get('/api/v1/planning/capacity/daily?date=2026-09-16')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<DailyCapacityDto>;
      expect(body.success).toBe(true);
      expect(body.data.plannedMinutes).toBe(480);
      expect(body.data.remainingMinutes).toBe(0);
      expect(body.data.utilizationPercent).toBe(100);
      expect(body.data.overCapacity).toBe(false);
    });
  });

  describe('4. Weekly Planning & Ownership Protection', () => {
    it('GET /api/v1/planning/weekly returns weekly planning overview', async () => {
      (prisma.weeklyPlan.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (prisma.timeBlock.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (prisma.dailyPlan.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (prisma.task.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/planning/weekly?weekStart=2026-09-14')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<WeeklyPlanningResponseDto>;
      expect(body.success).toBe(true);
      expect(body.data.weekStart).toBe('2026-09-14');
      expect((body.data.capacity as unknown as Record<string, unknown>).weeklyCapacityMinutes).toBeUndefined(); // nested under capacity
      expect(body.data.capacity.capacityMinutes).toBe(2400);
    });

    it('DELETE /api/v1/planning/time-blocks/:id returns 404 for block owned by another user', async () => {
      (prisma.timeBlock.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/v1/planning/time-blocks/99999999-9999-9999-9999-999999999999')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(res.status).toBe(404);
      const body = res.body as ApiErrorResponse;
      expect(body.success).toBe(false);
    });
  });
});
