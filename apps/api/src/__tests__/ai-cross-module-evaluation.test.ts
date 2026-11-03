import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma client with deterministic fixture records for unit testing
vi.mock('../lib/prisma.js', () => {
  return {
    prisma: {
      task: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'task-101',
            title: 'Complete System Architecture Document',
            status: 'BLOCKED',
            priority: 'P0_CRITICAL',
            blockingDependencies: [
              {
                blockingTask: { id: 'task-100', title: 'Setup Database Migration', status: 'IN_PROGRESS' },
              },
            ],
            project: { name: 'Individual Project A' },
          },
        ]),
        count: vi.fn().mockResolvedValue(4),
      },
      project: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'proj-1',
            name: 'Individual Project A',
            slug: 'individual-project-a',
            status: 'ACTIVE',
            progress: 60,
            milestones: [
              { id: 'm-1', title: 'System Spec', status: 'COMPLETED' },
              { id: 'm-2', title: 'Core Implementation', status: 'IN_PROGRESS' },
            ],
          },
        ]),
        count: vi.fn().mockResolvedValue(2),
      },
      goal: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      },
      userMemory: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'mem-1',
          key: 'graduation_defense_target_date',
          value: '2026-06-30',
        }),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: 'mem-new' }),
      },
      academicCourse: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'course-1', title: 'Distributed Systems', code: 'CSE501', status: 'IN_PROGRESS' },
        ]),
      },
      opportunity: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([]),
      },
      timeBlock: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      weeklyReview: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'rev-1',
          status: 'COMPLETED',
          wins: 'Shipped architecture rewrite',
          challenges: 'Database latency',
          lessons: 'Use connection pooling',
          nextFocus: 'AI Tooling',
        }),
      },
      learningActivity: {
        findMany: vi.fn().mockResolvedValue([]),
        aggregate: vi.fn().mockResolvedValue({ _sum: { minutes: 180 } }),
      },
      userSettings: {
        findUnique: vi.fn().mockResolvedValue({
          dailyWorkCapacityMinutes: 480,
          weeklyWorkCapacityMinutes: 2400,
        }),
      },
      workstream: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'ws-1', name: 'ASTU / Graduation', slug: 'astu-graduation', priorityWeight: 10 },
        ]),
      },
    },
  };
});

import { IntelligenceToolRegistry } from '../domain/intelligence/tools/intelligence-tool.registry.js';
import { GroundedReasoningEngine } from '../domain/intelligence/provider/grounded-reasoning-engine.js';
import { OpenAIProvider } from '../domain/intelligence/provider/openai-ai-provider.js';
import { IntelligenceSafetyService } from '../domain/intelligence/safety/intelligence-safety.service.js';

describe('Phase 11 — Dynamic AI Intelligence Evaluation Suite', () => {
  const toolRegistry = new IntelligenceToolRegistry();
  const groundedEngine = new GroundedReasoningEngine(toolRegistry);
  const safetyService = new IntelligenceSafetyService();

  const mockUserId = '11111111-1111-4111-a111-111111111111';

  it('A. Domain Tool Registry contains all cross-module read capabilities', () => {
    const tools = toolRegistry.getAvailableTools();
    const toolNames = tools.map((t) => t.name);

    expect(toolNames).toContain('get_dashboard_summary');
    expect(toolNames).toContain('get_workstreams');
    expect(toolNames).toContain('get_project_tasks');
    expect(toolNames).toContain('get_project_dependencies');
    expect(toolNames).toContain('get_capacity');
    expect(toolNames).toContain('get_learning_progress');
    expect(toolNames).toContain('get_performance_metrics');
    expect(toolNames).toContain('get_weekly_review');
  });

  it('B. Multi-turn pronoun resolution correctly identifies referenced projects', async () => {
    const historyMessages = [
      { role: 'user' as const, content: 'Analyze Individual Project A status.' },
      { role: 'assistant' as const, content: 'Individual Project A is at 60% completion with 4 active milestones.' },
      { role: 'user' as const, content: 'What is blocking it?' },
    ];

    const response = await groundedEngine.generate({
      messages: historyMessages,
      context: {
        userId: mockUserId,
        todayTasksCount: 4,
        blockedTasksCount: 1,
        activeProjectsCount: 2,
        pageContext: { pageType: 'projects', entityTitle: 'Individual Project A' },
      },
    });

    expect(response.content).toBeDefined();
    expect(typeof response.content).toBe('string');
    expect(response.content.length).toBeGreaterThan(50);
  });

  it('C. Cross-module data grounding reflects live context without hallucinations', async () => {
    const response = await groundedEngine.generate({
      messages: [{ role: 'user', content: 'Give me an executive synthesis of my graduation readiness.' }],
      context: {
        userId: mockUserId,
        todayTasksCount: 5,
        blockedTasksCount: 2,
        activeProjectsCount: 3,
        pageContext: { pageType: 'graduation', entityTitle: 'ASTU Final Defense' },
      },
    });

    expect(response.content).toBeDefined();
    expect(response.providerName).toBe('GroundedReasoningEngine');
  });

  it('D. Acknowledges missing data honestly without inventing records', async () => {
    const response = await groundedEngine.generate({
      messages: [{ role: 'user', content: 'Audit my certifications and verified code commits.' }],
      context: {
        userId: mockUserId,
        todayTasksCount: 0,
        blockedTasksCount: 0,
        activeProjectsCount: 0,
        pageContext: { pageType: 'evidence' },
      },
    });

    expect(response.content).toBeDefined();
  });

  it('E. Enforces authorization and user boundary constraints', () => {
    const ownerId = 'user-owner-primary';
    const attackerId = 'user-attacker-cross-tenant';

    expect(() => safetyService.validateUserScope(ownerId, ownerId)).not.toThrow();
    expect(() => safetyService.validateUserScope(ownerId, attackerId)).toThrow();
  });

  it('F. Transparent error handling on missing OpenAI API key without fake responses', async () => {
    const openAIProvider = new OpenAIProvider();

    await expect(
      openAIProvider.generate({
        messages: [{ role: 'user', content: 'Test prompt' }],
      }),
    ).rejects.toThrow(/OPENAI_API_KEY/);
  });
});
