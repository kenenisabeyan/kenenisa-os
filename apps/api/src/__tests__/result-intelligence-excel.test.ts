import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { generateSessionToken } from '../domain/auth/session.service.js';
import { UserRole, PlanHorizon, PlanOutcomeState, ResultSource } from '@prisma/client';
import { ResultIntelligenceService } from '../domain/results/result-intelligence.service.js';
import { ExcelExportService } from '../domain/results/excel-export.service.js';

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
    planOutcome: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    task: {
      findMany: vi.fn(),
    },
    resultExportLog: {
      create: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});

describe('Result Intelligence & Excel Reporting Test Suite', () => {
  const app = createApp();
  const mockUserId = '99999999-9999-9999-9999-999999999999';
  let mockToken: string;

  beforeEach(() => {
    vi.clearAllMocks();

    const tokenObj = generateSessionToken();
    mockToken = tokenObj.rawToken;

    const mockUser = {
      id: mockUserId,
      email: 'owner@kenenisa.com',
      role: UserRole.OWNER,
      isActive: true,
      displayName: 'Kenenisa',
    };

    (prisma.user.findUnique as any).mockResolvedValue(mockUser);

    (prisma.session.findUnique as any).mockResolvedValue({
      id: 'session-id-123',
      userId: mockUserId,
      tokenHash: tokenObj.tokenHash,
      expiresAt: new Date(Date.now() + 86400000),
      lastUsedAt: new Date(),
      revokedAt: null,
      user: mockUser,
    });
  });

  describe('ResultIntelligenceService Unit Tests', () => {
    it('computes factual result overview stats correctly', async () => {
      (prisma.planOutcome.findMany as any).mockResolvedValue([
        { id: '1', horizon: PlanHorizon.DAILY, outcomeState: PlanOutcomeState.COMPLETED },
        { id: '2', horizon: PlanHorizon.DAILY, outcomeState: PlanOutcomeState.PARTIALLY_COMPLETED },
        { id: '3', horizon: PlanHorizon.WEEKLY, outcomeState: PlanOutcomeState.MISSED },
        { id: '4', horizon: PlanHorizon.MONTHLY, outcomeState: PlanOutcomeState.BLOCKED },
        { id: '5', horizon: PlanHorizon.YEARLY, outcomeState: PlanOutcomeState.IN_PROGRESS },
      ]);

      const overview = await ResultIntelligenceService.getResultOverview(mockUserId);

      expect(overview.totalPlanned).toBe(5);
      expect(overview.completed).toBe(1);
      expect(overview.partiallyCompleted).toBe(1);
      expect(overview.missed).toBe(1);
      expect(overview.blocked).toBe(1);
      expect(overview.inProgress).toBe(1);
      expect(overview.byHorizon.DAILY.total).toBe(2);
      expect(overview.byHorizon.DAILY.completed).toBe(1);
    });

    it('generates actionable advance recommendations based on blockers and missed items', async () => {
      (prisma.planOutcome.findMany as any)
        .mockResolvedValueOnce([
          { id: 'out-block-1', title: 'Implement Payment API', priority: 'P0', outcomeState: PlanOutcomeState.BLOCKED, taskId: 'task-1' },
        ])
        .mockResolvedValueOnce([
          { id: 'out-miss-1', title: 'Study Operating Systems', priority: 'P1', outcomeState: PlanOutcomeState.MISSED, taskId: 'task-2' },
        ]);

      (prisma.task.findMany as any).mockResolvedValue([
        { id: 'task-ready-1', title: 'Setup DB Schema', priority: 'P0' },
      ]);

      const recs = await ResultIntelligenceService.getRecommendations(mockUserId);

      expect(recs.length).toBeGreaterThanOrEqual(2);
      expect(recs[0].actionType).toBe('RESOLVE_BLOCKER');
      expect(recs[0].title).toContain('Implement Payment API');
    });
  });

  describe('ExcelExportService Unit Tests', () => {
    it('generates structured in-app spreadsheet dataset with multiple sheets', async () => {
      (prisma.planOutcome.findMany as any).mockResolvedValue([
        {
          id: 'out-1',
          createdAt: new Date('2026-09-27T00:00:00.000Z'),
          horizon: PlanHorizon.DAILY,
          title: 'Build Result Intelligence',
          expectedResult: 'Pass all tests',
          actualResult: 'Completed',
          outcomeState: PlanOutcomeState.COMPLETED,
          source: ResultSource.AUTOMATIC,
          plannedMinutes: 120,
          priority: 'P1',
          workstream: { name: 'Engineering' },
          goal: { title: 'Multi-Horizon Planning' },
          project: { name: 'KENENISA OS' },
          task: { title: 'Implement Excel Engine' },
          evidenceLinks: [{ id: 'ev-link-1' }],
        },
      ]);

      (prisma.planOutcome.count as any).mockResolvedValue(1);

      const dataset = await ExcelExportService.generateSpreadsheetReport(mockUserId, { scope: 'current' });

      expect(dataset.title).toContain('KENENISA OS');
      expect(dataset.sheets.length).toBe(3); // Summary, Outcomes, Recommendations
      expect(dataset.sheets[1].name).toBe('Outcomes');
      expect(dataset.sheets[1].rows.length).toBe(1);
      expect(dataset.sheets[1].rows[0].title).toBe('Build Result Intelligence');
    });

    it('builds a valid binary .xlsx workbook buffer', async () => {
      (prisma.planOutcome.findMany as any).mockResolvedValue([
        {
          id: 'out-1',
          createdAt: new Date('2026-09-27T00:00:00.000Z'),
          horizon: PlanHorizon.DAILY,
          title: 'Test XLSX Generator',
          expectedResult: 'Valid Buffer',
          actualResult: 'Passed',
          outcomeState: PlanOutcomeState.COMPLETED,
          source: ResultSource.AUTOMATIC,
          plannedMinutes: 60,
          priority: 'P2',
          workstream: null,
          goal: null,
          project: null,
          task: null,
          evidenceLinks: [],
        },
      ]);
      (prisma.planOutcome.count as any).mockResolvedValue(1);

      const buffer = await ExcelExportService.generateXlsxBuffer(mockUserId, { scope: 'current' });

      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(100);
    });
  });

  describe('API Endpoint Integration Tests', () => {
    it('GET /api/v1/results/overview returns overview DTO', async () => {
      (prisma.planOutcome.findMany as any).mockResolvedValue([
        { id: '1', horizon: PlanHorizon.DAILY, outcomeState: PlanOutcomeState.COMPLETED },
      ]);

      const res = await request(app)
        .get('/api/v1/results/overview')
        .set('Cookie', [`auth_session=${mockToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(1);
    });

    it('GET /api/v1/results/export/preview returns spreadsheet report DTO', async () => {
      (prisma.planOutcome.findMany as any).mockResolvedValue([]);
      (prisma.planOutcome.count as any).mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/results/export/preview?scope=week')
        .set('Cookie', [`auth_session=${mockToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.sheets).toBeDefined();
    });

    it('GET /api/v1/results/export/xlsx streams binary spreadsheet file', async () => {
      (prisma.planOutcome.findMany as any).mockResolvedValue([]);
      (prisma.planOutcome.count as any).mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/results/export/xlsx?scope=month')
        .set('Cookie', [`auth_session=${mockToken}`]);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(res.header['content-disposition']).toContain('attachment; filename="kenenisa-os-results-');
    });
  });
});
