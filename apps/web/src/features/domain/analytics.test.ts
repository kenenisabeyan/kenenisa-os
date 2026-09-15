import { describe, it, expect, vi } from 'vitest';
import {
  fetchAnalyticsOverview,
  fetchExecutionTrend,
  fetchProjectAnalytics,
  fetchGoalAnalytics,
  fetchWorkstreamAnalytics,
  fetchPlanningAnalytics,
  fetchCapacityAnalytics,
  fetchOverdueAnalytics,
  fetchBlockedAnalytics,
  fetchLearningAnalytics,
  fetchLearningTrend,
  fetchSkillAnalytics,
  fetchEvidenceAnalytics,
  fetchWeeklyHistory,
} from '../analytics/api.js';

vi.mock('../../lib/api-client.js', () => ({
  apiClient: vi.fn().mockImplementation((url: string) => {
    if (url.includes('/api/v1/analytics/overview')) {
      return Promise.resolve({
        period: { from: '2026-09-01', to: '2026-09-30', period: 'month' },
        execution: {
          totalTasks: 20,
          completedTasks: 15,
          inProgressTasks: 3,
          readyTasks: 2,
          blockedTasks: 0,
          reviewTasks: 0,
          cancelledTasks: 0,
          overdueTasks: 1,
          completionRate: 75,
          estimatedMinutes: 1200,
          actualMinutes: 1150,
          completedEstimatedMinutes: 900,
        },
        planning: {
          daysPlanned: 20,
          daysWithTimeBlocks: 18,
          plannedMinutes: 4800,
          daysWithCompletedPlans: 15,
          plannedTaskMinutes: 4000,
          tasklessPlannedMinutes: 800,
        },
        learning: {
          learningItemsTotal: 5,
          learningItemsStarted: 4,
          learningItemsCompleted: 3,
          learningItemsInProgress: 1,
          learningItemsPaused: 0,
          learningMinutes: 900,
          learningActivityDays: 12,
        },
        projects: { totalProjects: 4, activeProjects: 3, completedProjects: 1, onHoldProjects: 0 },
        goals: { totalGoals: 3, inProgressGoals: 2, achievedGoals: 1 },
        evidence: { evidenceCreated: 6, evidenceVerified: 4, evidenceUnverified: 2 },
        capacity: {
          availableMinutes: 9600,
          plannedMinutes: 4800,
          remainingMinutes: 4800,
          utilizationPercentage: 50,
          overCapacityDays: 0,
        },
        reviews: { reviewsCreated: 4, reviewsCompleted: 3, reviewsDraft: 1 },
      });
    }

    if (url.includes('/api/v1/analytics/execution/trend')) {
      return Promise.resolve([
        { date: '2026-09-01', completedTasks: 2, createdTasks: 3, blockedTasks: 0, overdueTasks: 0 },
      ]);
    }

    if (url.includes('/api/v1/analytics/projects')) {
      return Promise.resolve([
        {
          projectId: 'p-1',
          projectName: 'KENENISA OS',
          workstreamName: 'Core Platform',
          goalTitle: 'Launch V1',
          status: 'ACTIVE',
          totalTasks: 10,
          completedTasks: 8,
          openTasks: 2,
          blockedTasks: 0,
          overdueTasks: 0,
          milestonesTotal: 4,
          milestonesCompleted: 3,
          completionPercentage: 80,
        },
      ]);
    }

    if (url.includes('/api/v1/analytics/goals')) {
      return Promise.resolve([
        {
          goalId: 'g-1',
          title: 'Career Readiness',
          workstreamName: 'Career & Professional',
          status: 'IN_PROGRESS',
          priority: 'P1',
          projectsTotal: 2,
          activeProjects: 2,
          completedProjects: 0,
          tasksTotal: 15,
          completedTasks: 10,
          overdueTasks: 1,
          targetDate: '2026-10-31',
          progressPercentage: 66.7,
        },
      ]);
    }

    if (url.includes('/api/v1/analytics/workstreams')) {
      return Promise.resolve([
        {
          workstreamId: 'ws-1',
          name: 'Personal Platform Engine',
          status: 'ACTIVE',
          priorityWeight: 1,
          goalsCount: 2,
          activeGoals: 2,
          projectsCount: 3,
          activeProjects: 2,
          tasksCount: 20,
          completedTasks: 15,
          blockedTasks: 1,
          overdueTasks: 1,
          learningItems: 4,
          learningMinutes: 600,
          evidenceCount: 3,
        },
      ]);
    }

    if (url.includes('/api/v1/analytics/planning')) {
      return Promise.resolve({
        daysPlanned: 20,
        daysWithTimeBlocks: 18,
        plannedMinutes: 4800,
        daysWithCompletedPlans: 15,
        plannedTaskMinutes: 4000,
        tasklessPlannedMinutes: 800,
        estimatedTaskMinutes: 1200,
        scheduledTimeBlockMinutes: 4800,
        actualLoggedTaskMinutes: 1150,
      });
    }

    if (url.includes('/api/v1/analytics/capacity')) {
      return Promise.resolve({
        totalAvailableMinutes: 9600,
        totalPlannedMinutes: 4800,
        totalRemainingMinutes: 4800,
        utilizationPercentage: 50,
        overCapacityDays: 0,
        daysEvaluated: 20,
      });
    }

    if (url.includes('/api/v1/analytics/overdue')) {
      return Promise.resolve({
        currentOverdueTasks: 1,
        overdueCreatedDuringPeriod: 1,
        overdueCompletedDuringPeriod: 0,
        overdueByWorkstream: [{ name: 'Core Platform', count: 1 }],
        overdueByProject: [{ name: 'KENENISA OS', count: 1 }],
      });
    }

    if (url.includes('/api/v1/analytics/blocked')) {
      return Promise.resolve({
        currentlyBlocked: 1,
        blockedDuringPeriod: 1,
        unblockedDuringPeriod: 2,
        dependencyBlocked: 1,
        manuallyBlocked: 0,
      });
    }

    if (url.includes('/api/v1/analytics/learning/trend')) {
      return Promise.resolve([{ date: '2026-09-01', minutes: 120, activities: 1, itemsCompleted: 0 }]);
    }

    if (url.includes('/api/v1/analytics/learning')) {
      return Promise.resolve({
        learningItemsTotal: 5,
        learningItemsStarted: 4,
        learningItemsCompleted: 3,
        learningItemsInProgress: 1,
        learningItemsPaused: 0,
        learningMinutes: 900,
        learningActivityDays: 12,
      });
    }

    if (url.includes('/api/v1/analytics/skills')) {
      return Promise.resolve([
        {
          skillId: 'sk-1',
          name: 'System Architecture',
          category: 'Engineering',
          currentLevel: 'INTERMEDIATE',
          targetLevel: 'ADVANCED',
          status: 'ACTIVE',
          linkedLearningItems: 3,
          linkedProjects: 2,
          linkedEvidence: 4,
        },
      ]);
    }

    if (url.includes('/api/v1/analytics/evidence')) {
      return Promise.resolve({
        evidenceCreated: 6,
        evidenceVerified: 4,
        evidenceUnverified: 2,
        byType: [{ type: 'GITHUB_REPOSITORY', count: 3 }],
      });
    }

    if (url.includes('/api/v1/analytics/weekly-history')) {
      return Promise.resolve([
        {
          weekStart: '2026-09-07',
          weekEnd: '2026-09-13',
          tasksCompleted: 12,
          tasksCreated: 15,
          tasksBlocked: 1,
          tasksOverdue: 0,
          plannedMinutes: 2400,
          availableMinutes: 3360,
          learningMinutes: 480,
          learningItemsCompleted: 1,
          evidenceCreated: 2,
          projectsActive: 3,
          projectsCompleted: 0,
          reviewCompleted: true,
        },
      ]);
    }

    return Promise.resolve({});
  }),
}));

describe('Frontend Analytics API Client Suite', () => {
  it('fetches analytics overview correctly', async () => {
    const data = await fetchAnalyticsOverview({ period: 'month' });
    expect(data.execution.completedTasks).toBe(15);
    expect(data.execution.completionRate).toBe(75);
  });

  it('fetches execution trend correctly', async () => {
    const trend = await fetchExecutionTrend({ period: 'month' });
    expect(trend).toHaveLength(1);
    expect(trend[0].completedTasks).toBe(2);
  });

  it('fetches project analytics correctly', async () => {
    const projects = await fetchProjectAnalytics();
    expect(projects[0].projectName).toBe('KENENISA OS');
    expect(projects[0].completionPercentage).toBe(80);
  });

  it('fetches goal analytics correctly', async () => {
    const goals = await fetchGoalAnalytics();
    expect(goals[0].title).toBe('Career Readiness');
    expect(goals[0].progressPercentage).toBe(66.7);
  });

  it('fetches workstream analytics correctly', async () => {
    const ws = await fetchWorkstreamAnalytics();
    expect(ws[0].name).toBe('Personal Platform Engine');
  });

  it('fetches planning and capacity analytics correctly', async () => {
    const plan = await fetchPlanningAnalytics();
    const cap = await fetchCapacityAnalytics();
    expect(plan.plannedMinutes).toBe(4800);
    expect(cap.utilizationPercentage).toBe(50);
  });

  it('fetches overdue and blocked analytics correctly', async () => {
    const ov = await fetchOverdueAnalytics();
    const bl = await fetchBlockedAnalytics();
    expect(ov.currentOverdueTasks).toBe(1);
    expect(bl.currentlyBlocked).toBe(1);
  });

  it('fetches learning and skills analytics correctly', async () => {
    const learn = await fetchLearningAnalytics();
    const trend = await fetchLearningTrend();
    const sk = await fetchSkillAnalytics();
    expect(learn.learningMinutes).toBe(900);
    expect(trend[0].minutes).toBe(120);
    expect(sk[0].name).toBe('System Architecture');
  });

  it('fetches evidence and weekly history correctly', async () => {
    const ev = await fetchEvidenceAnalytics();
    const hist = await fetchWeeklyHistory();
    expect(ev.evidenceCreated).toBe(6);
    expect(hist[0].reviewCompleted).toBe(true);
  });
});
