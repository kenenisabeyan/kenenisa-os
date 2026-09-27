import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { generateSessionToken } from '../domain/auth/session.service.js';
import { UserRole, PlanHorizon, PlanOutcomeState, TaskPriority, OutcomeVerificationState } from '@prisma/client';

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
    yearPlan: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    monthPlan: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    dailyPlan: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    weeklyPlan: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    timeBlock: {
      findMany: vi.fn(),
    },
    planOutcome: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    planOutcomeEvidence: {
      upsert: vi.fn(),
    },
    planResultSnapshot: {
      upsert: vi.fn(),
    },
    task: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    workstream: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    goal: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    evidence: {
      findFirst: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  };

  return { prisma: mockPrisma };
});

const app = createApp();

describe('Multi-Horizon Planning & Automatic Outcome Tracking Test Suite', () => {
  const mockUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'kenenisa@kenenisa-os.internal',
    firstName: 'Kenenisa',
    lastName: 'Beyan',
    displayName: 'Kenenisa Beyan',
    role: UserRole.OWNER,
    isActive: true,
  };

  let rawToken: string;

  beforeEach(() => {
    vi.clearAllMocks();

    const sessionTokens = generateSessionToken();
    rawToken = sessionTokens.rawToken;

    (prisma.session.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'session-123',
      userId: mockUser.id,
      tokenHash: sessionTokens.tokenHash,
      expiresAt: new Date(Date.now() + 86400000),
      lastUsedAt: new Date(),
      revokedAt: null,
      user: mockUser,
    });

    (prisma.userSettings.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: mockUser.id,
      timezone: 'UTC',
      weekStartsOn: 1,
    });
  });

  describe('1. Year & Month Plan Endpoints', () => {
    it('POST /api/v1/planning/year creates a new Yearly Plan', async () => {
      (prisma.yearPlan.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (prisma.yearPlan.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'year-2026',
        userId: mockUser.id,
        year: 2026,
        title: '2026 Strategic Direction',
        description: 'Mastering AI Engineering',
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2026-12-31T23:59:59.000Z'),
        status: 'ACTIVE',
        priority: TaskPriority.P1,
        expectedOutcomes: 'Deploy Production Systems',
        actualOutcomes: null,
        notes: null,
        workstreamId: null,
        goalId: null,
        projectId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/v1/planning/year')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          year: 2026,
          title: '2026 Strategic Direction',
          description: 'Mastering AI Engineering',
          startDate: '2026-01-01T00:00:00.000Z',
          endDate: '2026-12-31T23:59:59.000Z',
          expectedOutcomes: 'Deploy Production Systems',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.year).toBe(2026);
      expect(response.body.data.title).toBe('2026 Strategic Direction');
    });

    it('GET /api/v1/planning/month/:year/:month retrieves Monthly Plan', async () => {
      (prisma.monthPlan.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'month-2026-10',
        userId: mockUser.id,
        yearPlanId: 'year-2026',
        year: 2026,
        month: 10,
        title: 'October 2026 Multi-Horizon Execution',
        description: null,
        startDate: new Date('2026-10-01T00:00:00.000Z'),
        endDate: new Date('2026-10-31T23:59:59.000Z'),
        status: 'ACTIVE',
        priority: TaskPriority.P1,
        expectedOutcomes: null,
        actualOutcomes: null,
        notes: null,
        workstreamId: null,
        goalId: null,
        projectId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .get('/api/v1/planning/month/2026/10')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.data.month).toBe(10);
      expect(response.body.data.title).toBe('October 2026 Multi-Horizon Execution');
    });
  });

  describe('2. Outcome Tracking Engine', () => {
    it('POST /api/v1/planning/outcomes creates a planned outcome', async () => {
      (prisma.planOutcome.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'outcome-1',
        userId: mockUser.id,
        horizon: PlanHorizon.DAILY,
        yearPlanId: null,
        monthPlanId: null,
        weeklyPlanId: null,
        dailyPlanId: 'daily-123',
        workstreamId: null,
        goalId: null,
        projectId: null,
        milestoneId: null,
        taskId: null,
        title: 'Complete React authentication module',
        description: null,
        startDate: null,
        endDate: null,
        plannedMinutes: 120,
        priority: TaskPriority.P1,
        expectedResult: 'Pass all 18 unit tests',
        actualResult: null,
        outcomeState: PlanOutcomeState.PLANNED,
        isUserConfirmed: false,
        userExplanation: null,
        rescheduledTo: null,
        carriedForwardToId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/v1/planning/outcomes')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          horizon: 'DAILY',
          title: 'Complete React authentication module',
          expectedResult: 'Pass all 18 unit tests',
          priority: 'P1',
          plannedMinutes: 120,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.outcomeState).toBe('PLANNED');
      expect(response.body.data.title).toBe('Complete React authentication module');
    });

    it('POST /api/v1/planning/outcomes/:id/confirm saves user override and audit explanation', async () => {
      (prisma.planOutcome.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'outcome-1',
        userId: mockUser.id,
        title: 'Complete React authentication module',
        outcomeState: PlanOutcomeState.PLANNED,
        isUserConfirmed: false,
      });

      (prisma.planOutcome.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'outcome-1',
        userId: mockUser.id,
        horizon: PlanHorizon.DAILY,
        yearPlanId: null,
        monthPlanId: null,
        weeklyPlanId: null,
        dailyPlanId: null,
        workstreamId: null,
        goalId: null,
        projectId: null,
        milestoneId: null,
        taskId: null,
        title: 'Complete React authentication module',
        description: null,
        startDate: null,
        endDate: null,
        plannedMinutes: 120,
        priority: TaskPriority.P1,
        expectedResult: 'Pass all 18 unit tests',
        actualResult: 'Authentication completed, 18/18 tests passed',
        outcomeState: PlanOutcomeState.COMPLETED,
        isUserConfirmed: true,
        userExplanation: 'Verified via CI pipeline run',
        rescheduledTo: null,
        carriedForwardToId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/v1/planning/outcomes/outcome-1/confirm')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          outcomeState: 'COMPLETED',
          actualResult: 'Authentication completed, 18/18 tests passed',
          userExplanation: 'Verified via CI pipeline run',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.isUserConfirmed).toBe(true);
      expect(response.body.data.outcomeState).toBe('COMPLETED');
    });

    it('POST /api/v1/planning/outcomes/:id/evidence links authoritative proof to outcome', async () => {
      const mockOutcomeRecord = {
        id: 'outcome-1',
        userId: mockUser.id,
      };
      (prisma.planOutcome.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockOutcomeRecord);

      (prisma.evidence.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: '99999999-9999-9999-9999-999999999999',
        userId: mockUser.id,
        title: 'Auth CI Pipeline Green Run',
      });

      (prisma.planOutcomeEvidence.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'poe-1',
        planOutcomeId: 'outcome-1',
        evidenceId: '99999999-9999-9999-9999-999999999999',
        verificationState: OutcomeVerificationState.VERIFIED,
      });

      (prisma.planOutcome.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'outcome-1',
        userId: mockUser.id,
        horizon: PlanHorizon.DAILY,
        yearPlanId: null,
        monthPlanId: null,
        weeklyPlanId: null,
        dailyPlanId: null,
        workstreamId: null,
        goalId: null,
        projectId: null,
        milestoneId: null,
        taskId: null,
        title: 'Complete React authentication module',
        description: null,
        startDate: null,
        endDate: null,
        plannedMinutes: 120,
        priority: TaskPriority.P1,
        expectedResult: 'Pass all 18 unit tests',
        actualResult: '18/18 tests passed',
        outcomeState: PlanOutcomeState.COMPLETED,
        isUserConfirmed: true,
        userExplanation: null,
        rescheduledTo: null,
        carriedForwardToId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        evidenceLinks: [
          {
            id: 'poe-1',
            planOutcomeId: 'outcome-1',
            evidenceId: '99999999-9999-9999-9999-999999999999',
            verificationState: OutcomeVerificationState.VERIFIED,
            createdAt: new Date(),
            evidence: {
              id: '99999999-9999-9999-9999-999999999999',
              title: 'Auth CI Pipeline Green Run',
            },
          },
        ],
      });

      const response = await request(app)
        .post('/api/v1/planning/outcomes/outcome-1/evidence')
        .set('Cookie', [`auth_session=${rawToken}`])
        .send({
          evidenceId: '99999999-9999-9999-9999-999999999999',
          verificationState: 'VERIFIED',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.evidenceLinks.length).toBe(1);
    });
  });

  describe('3. Multi-Horizon Consolidation & Factual Summaries', () => {
    it('GET /api/v1/planning/overview returns Multi-Horizon structure', async () => {
      (prisma.yearPlan.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (prisma.monthPlan.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (prisma.dailyPlan.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (prisma.weeklyPlan.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (prisma.timeBlock.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (prisma.planOutcome.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/planning/overview')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.data.todaySummary).toBeDefined();
    });

    it('GET /api/v1/planning/summary/daily generates factual report', async () => {
      (prisma.dailyPlan.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (prisma.timeBlock.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (prisma.planOutcome.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/planning/summary/daily/2026-10-05')
        .set('Cookie', [`auth_session=${rawToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.data.summary).toContain('DAILY RESULT');
    });
  });
});
