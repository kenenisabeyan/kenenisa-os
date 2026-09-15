import { prisma } from '../../lib/prisma.js';
import {
  AnalyticsQuery,
  AnalyticsOverviewDto,
  ExecutionTrendPointDto,
  ProjectAnalyticsItemDto,
  GoalAnalyticsItemDto,
  WorkstreamAnalyticsItemDto,
  PlanningAnalyticsDto,
  CapacityAnalyticsDto,
  OverdueAnalyticsDto,
  BlockedAnalyticsDto,
  LearningAnalyticsDto,
  LearningTrendPointDto,
  SkillAnalyticsItemDto,
  EvidenceAnalyticsDto,
  EvidenceTrendPointDto,
  ReviewAnalyticsDto,
  WeeklyHistorySnapshotDto,
} from '@kenenisa-os/shared';
import { resolveDateRange, calculatePercentage, generateDateSeries } from './analytics.utils.js';

export class AnalyticsService {
  /**
   * Helper to calculate duration in minutes from TimeBlock startAt and endAt.
   */
  private getTimeBlockMinutes(startAt: Date, endAt: Date): number {
    const diff = endAt.getTime() - startAt.getTime();
    return Math.max(0, Math.round(diff / (1000 * 60)));
  }

  /**
   * 1. Overview Analytics
   */
  async getOverview(userId: string, query: AnalyticsQuery): Promise<AnalyticsOverviewDto> {
    const range = resolveDateRange(query);
    const now = new Date();

    const [
      allTasks,
      overdueTaskCount,
      dailyPlans,
      timeBlocks,
      learningItems,
      learningActivities,
      userSettings,
      projects,
      goals,
      evidenceList,
      reviewsList,
    ] = await Promise.all([
      prisma.task.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          estimateMinutes: true,
          actualMinutes: true,
          createdAt: true,
          completedAt: true,
        },
      }),
      prisma.task.count({
        where: {
          userId,
          status: { notIn: ['DONE', 'CANCELLED'] },
          dueDate: { lt: now },
        },
      }),
      prisma.dailyPlan.findMany({
        where: {
          userId,
          date: { gte: range.from, lte: range.to },
        },
        include: {
          timeBlocks: true,
        },
      }),
      prisma.timeBlock.findMany({
        where: {
          userId,
          startAt: { gte: range.from, lte: range.to },
        },
        select: {
          startAt: true,
          endAt: true,
          taskId: true,
        },
      }),
      prisma.learningItem.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          completedAt: true,
        },
      }),
      prisma.learningActivity.findMany({
        where: {
          userId,
          date: { gte: range.from, lte: range.to },
        },
        select: {
          minutes: true,
          date: true,
        },
      }),
      prisma.userSettings.findUnique({ where: { userId } }),
      prisma.project.findMany({ where: { userId }, select: { status: true } }),
      prisma.goal.findMany({ where: { userId }, select: { status: true } }),
      prisma.evidence.findMany({
        where: {
          userId,
          date: { gte: range.from, lte: range.to },
        },
        select: { verified: true },
      }),
      prisma.weeklyReview.findMany({
        where: { userId },
        select: { status: true, createdAt: true },
      }),
    ]);

    // Task Execution stats
    const tasksInPeriod = allTasks.filter(
      (t) =>
        (t.createdAt >= range.from && t.createdAt <= range.to) ||
        (t.completedAt && t.completedAt >= range.from && t.completedAt <= range.to)
    );
    const totalTasks = tasksInPeriod.length;
    const completedTasks = tasksInPeriod.filter((t) => t.status === 'DONE').length;
    const inProgressTasks = tasksInPeriod.filter((t) => t.status === 'IN_PROGRESS').length;
    const readyTasks = tasksInPeriod.filter((t) => t.status === 'READY').length;
    const blockedTasks = tasksInPeriod.filter((t) => t.status === 'BLOCKED').length;
    const reviewTasks = tasksInPeriod.filter((t) => t.status === 'REVIEW').length;
    const cancelledTasks = tasksInPeriod.filter((t) => t.status === 'CANCELLED').length;

    const eligibleForCompletion = totalTasks - cancelledTasks;
    const completionRate = calculatePercentage(completedTasks, eligibleForCompletion);

    const estimatedMinutes = tasksInPeriod.reduce((acc, t) => acc + (t.estimateMinutes || 0), 0);
    const actualMinutes = tasksInPeriod.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);
    const completedEstimatedMinutes = tasksInPeriod
      .filter((t) => t.status === 'DONE')
      .reduce((acc, t) => acc + (t.estimateMinutes || 0), 0);

    // Planning stats
    const daysPlanned = dailyPlans.length;
    const daysWithTimeBlocks = dailyPlans.filter((p) => p.timeBlocks.length > 0).length;
    const plannedMinutes = timeBlocks.reduce(
      (acc, tb) => acc + this.getTimeBlockMinutes(tb.startAt, tb.endAt),
      0
    );
    const daysWithCompletedPlans = dailyPlans.filter((p) => p.status === 'completed').length;

    const plannedTaskMinutes = timeBlocks
      .filter((tb) => tb.taskId !== null)
      .reduce((acc, tb) => acc + this.getTimeBlockMinutes(tb.startAt, tb.endAt), 0);
    const tasklessPlannedMinutes = plannedMinutes - plannedTaskMinutes;

    // Capacity stats
    const dailyCapacityMinutes = userSettings?.dailyWorkCapacityMinutes || 480;
    const availableCapacity = daysPlanned * dailyCapacityMinutes;
    const remainingMinutes = Math.max(0, availableCapacity - plannedMinutes);
    const utilizationPercentage = calculatePercentage(plannedMinutes, availableCapacity);
    const overCapacityDays = dailyPlans.filter((p) => {
      const dayPlannedMins = p.timeBlocks.reduce(
        (acc, tb) => acc + this.getTimeBlockMinutes(tb.startAt, tb.endAt),
        0
      );
      return dayPlannedMins > dailyCapacityMinutes;
    }).length;

    // Learning stats
    const learningMinutes = learningActivities.reduce((acc, a) => acc + a.minutes, 0);
    const uniqueActivityDates = new Set(
      learningActivities.map((a) => a.date.toISOString().split('T')[0])
    ).size;

    return {
      period: {
        from: range.fromDateStr,
        to: range.toDateStr,
        period: range.period,
      },
      execution: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        readyTasks,
        blockedTasks,
        reviewTasks,
        cancelledTasks,
        overdueTasks: overdueTaskCount,
        completionRate,
        estimatedMinutes,
        actualMinutes,
        completedEstimatedMinutes,
      },
      planning: {
        daysPlanned,
        daysWithTimeBlocks,
        plannedMinutes,
        daysWithCompletedPlans,
        plannedTaskMinutes,
        tasklessPlannedMinutes,
      },
      learning: {
        learningItemsTotal: learningItems.length,
        learningItemsStarted: learningItems.filter((l) => l.status === 'IN_PROGRESS').length,
        learningItemsCompleted: learningItems.filter((l) => l.status === 'COMPLETED').length,
        learningItemsInProgress: learningItems.filter((l) => l.status === 'IN_PROGRESS').length,
        learningItemsPaused: learningItems.filter((l) => l.status === 'PAUSED').length,
        learningMinutes,
        learningActivityDays: uniqueActivityDates,
      },
      projects: {
        totalProjects: projects.length,
        activeProjects: projects.filter((p) => p.status === 'ACTIVE').length,
        completedProjects: projects.filter((p) => p.status === 'COMPLETED').length,
        onHoldProjects: projects.filter((p) => p.status === 'ON_HOLD').length,
      },
      goals: {
        totalGoals: goals.length,
        inProgressGoals: goals.filter((g) => g.status === 'IN_PROGRESS').length,
        achievedGoals: goals.filter((g) => g.status === 'ACHIEVED').length,
      },
      evidence: {
        evidenceCreated: evidenceList.length,
        evidenceVerified: evidenceList.filter((e) => e.verified).length,
        evidenceUnverified: evidenceList.filter((e) => !e.verified).length,
      },
      capacity: {
        availableMinutes: availableCapacity,
        plannedMinutes,
        remainingMinutes,
        utilizationPercentage,
        overCapacityDays,
      },
      reviews: {
        reviewsCreated: reviewsList.length,
        reviewsCompleted: reviewsList.filter((r) => r.status === 'COMPLETED').length,
        reviewsDraft: reviewsList.filter((r) => r.status === 'DRAFT').length,
      },
    };
  }

  /**
   * 2. Execution Trend
   */
  async getExecutionTrend(userId: string, query: AnalyticsQuery): Promise<ExecutionTrendPointDto[]> {
    const range = resolveDateRange(query);
    const dateSeries = generateDateSeries(range.fromDateStr, range.toDateStr);

    const tasks = await prisma.task.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        completedAt: true,
        dueDate: true,
      },
    });

    return dateSeries.map((dateStr) => {
      const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
      const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

      const createdTasks = tasks.filter((t) => t.createdAt >= dayStart && t.createdAt <= dayEnd).length;
      const completedTasks = tasks.filter(
        (t) => t.completedAt && t.completedAt >= dayStart && t.completedAt <= dayEnd
      ).length;
      const blockedTasks = tasks.filter(
        (t) => t.status === 'BLOCKED' && t.createdAt <= dayEnd
      ).length;
      const overdueTasks = tasks.filter(
        (t) =>
          t.status !== 'DONE' &&
          t.status !== 'CANCELLED' &&
          t.dueDate &&
          t.dueDate < dayEnd &&
          t.createdAt <= dayEnd
      ).length;

      return {
        date: dateStr,
        completedTasks,
        createdTasks,
        blockedTasks,
        overdueTasks,
      };
    });
  }

  /**
   * 3. Project Analytics
   */
  async getProjectAnalytics(userId: string, _query: AnalyticsQuery): Promise<ProjectAnalyticsItemDto[]> {
    const now = new Date();
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        workstream: { select: { name: true } },
        goal: { select: { title: true } },
        tasks: {
          select: {
            id: true,
            status: true,
            dueDate: true,
          },
        },
        milestones: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return projects.map((p) => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter((t) => t.status === 'DONE').length;
      const openTasks = p.tasks.filter((t) => t.status !== 'DONE' && t.status !== 'CANCELLED').length;
      const blockedTasks = p.tasks.filter((t) => t.status === 'BLOCKED').length;
      const overdueTasks = p.tasks.filter(
        (t) => t.status !== 'DONE' && t.status !== 'CANCELLED' && t.dueDate && t.dueDate < now
      ).length;

      const milestonesTotal = p.milestones.length;
      const milestonesCompleted = p.milestones.filter((m) => m.status === 'REACHED').length;

      const eligibleTasks = totalTasks - p.tasks.filter((t) => t.status === 'CANCELLED').length;
      const completionPercentage = calculatePercentage(completedTasks, eligibleTasks);

      return {
        projectId: p.id,
        projectName: p.name,
        workstreamName: p.workstream?.name ?? null,
        goalTitle: p.goal?.title ?? null,
        status: p.status,
        totalTasks,
        completedTasks,
        openTasks,
        blockedTasks,
        overdueTasks,
        milestonesTotal,
        milestonesCompleted,
        completionPercentage,
      };
    });
  }

  /**
   * 4. Goal Analytics
   */
  async getGoalAnalytics(userId: string, _query: AnalyticsQuery): Promise<GoalAnalyticsItemDto[]> {
    const now = new Date();
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        workstream: { select: { name: true } },
        projects: {
          select: {
            id: true,
            status: true,
            tasks: {
              select: {
                id: true,
                status: true,
                dueDate: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return goals.map((g) => {
      const projectsTotal = g.projects.length;
      const activeProjects = g.projects.filter((p) => p.status === 'ACTIVE').length;
      const completedProjects = g.projects.filter((p) => p.status === 'COMPLETED').length;

      const allGoalTasks = g.projects.flatMap((p) => p.tasks);
      const tasksTotal = allGoalTasks.length;
      const completedTasks = allGoalTasks.filter((t) => t.status === 'DONE').length;
      const overdueTasks = allGoalTasks.filter(
        (t) => t.status !== 'DONE' && t.status !== 'CANCELLED' && t.dueDate && t.dueDate < now
      ).length;

      const eligibleTasks = tasksTotal - allGoalTasks.filter((t) => t.status === 'CANCELLED').length;
      const progressPercentage = calculatePercentage(completedTasks, eligibleTasks);

      return {
        goalId: g.id,
        title: g.title,
        workstreamName: g.workstream?.name ?? null,
        status: g.status,
        priority: g.priority,
        projectsTotal,
        activeProjects,
        completedProjects,
        tasksTotal,
        completedTasks,
        overdueTasks,
        targetDate: g.targetDate ? g.targetDate.toISOString() : null,
        progressPercentage,
      };
    });
  }

  /**
   * 5. Workstream Analytics
   */
  async getWorkstreamAnalytics(userId: string, _query: AnalyticsQuery): Promise<WorkstreamAnalyticsItemDto[]> {
    const now = new Date();
    const workstreams = await prisma.workstream.findMany({
      where: { userId },
      include: {
        goals: {
          select: {
            id: true,
            status: true,
          },
        },
        projects: {
          select: {
            id: true,
            status: true,
            tasks: {
              select: {
                id: true,
                status: true,
                dueDate: true,
              },
            },
            learningItems: {
              select: {
                id: true,
                activities: {
                  select: { minutes: true },
                },
              },
            },
            evidence: {
              select: { evidenceId: true },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return workstreams.map((w) => {
      const goalsCount = w.goals.length;
      const activeGoals = w.goals.filter((g) => g.status === 'IN_PROGRESS').length;

      const projectsCount = w.projects.length;
      const activeProjects = w.projects.filter((p) => p.status === 'ACTIVE').length;

      const allTasks = w.projects.flatMap((p) => p.tasks);
      const tasksCount = allTasks.length;
      const completedTasks = allTasks.filter((t) => t.status === 'DONE').length;
      const blockedTasks = allTasks.filter((t) => t.status === 'BLOCKED').length;
      const overdueTasks = allTasks.filter(
        (t) => t.status !== 'DONE' && t.status !== 'CANCELLED' && t.dueDate && t.dueDate < now
      ).length;

      const allLearningItems = w.projects.flatMap((p) => p.learningItems);
      const learningItemsCount = allLearningItems.length;
      const learningMinutes = allLearningItems
        .flatMap((l) => l.activities)
        .reduce((acc, act) => acc + act.minutes, 0);

      const evidenceCount = new Set(w.projects.flatMap((p) => p.evidence.map((e) => e.evidenceId))).size;

      return {
        workstreamId: w.id,
        name: w.name,
        status: w.status,
        priorityWeight: w.priorityWeight,
        goalsCount,
        activeGoals,
        projectsCount,
        activeProjects,
        tasksCount,
        completedTasks,
        blockedTasks,
        overdueTasks,
        learningItems: learningItemsCount,
        learningMinutes,
        evidenceCount,
      };
    });
  }

  /**
   * 6. Planning Analytics
   */
  async getPlanningAnalytics(userId: string, query: AnalyticsQuery): Promise<PlanningAnalyticsDto> {
    const range = resolveDateRange(query);

    const dailyPlans = await prisma.dailyPlan.findMany({
      where: {
        userId,
        date: { gte: range.from, lte: range.to },
      },
      include: {
        timeBlocks: true,
      },
    });

    const tasksInPeriod = await prisma.task.findMany({
      where: {
        userId,
        createdAt: { gte: range.from, lte: range.to },
      },
      select: {
        estimateMinutes: true,
        actualMinutes: true,
      },
    });

    const daysPlanned = dailyPlans.length;
    const daysWithTimeBlocks = dailyPlans.filter((p) => p.timeBlocks.length > 0).length;
    const daysWithCompletedPlans = dailyPlans.filter((p) => p.status === 'completed').length;

    const allTimeBlocks = dailyPlans.flatMap((p) => p.timeBlocks);
    const plannedMinutes = allTimeBlocks.reduce(
      (acc, tb) => acc + this.getTimeBlockMinutes(tb.startAt, tb.endAt),
      0
    );

    const plannedTaskMinutes = allTimeBlocks
      .filter((tb) => tb.taskId !== null)
      .reduce((acc, tb) => acc + this.getTimeBlockMinutes(tb.startAt, tb.endAt), 0);
    const tasklessPlannedMinutes = plannedMinutes - plannedTaskMinutes;

    const estimatedTaskMinutes = tasksInPeriod.reduce((acc, t) => acc + (t.estimateMinutes || 0), 0);
    const actualLoggedTaskMinutes = tasksInPeriod.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);

    return {
      daysPlanned,
      daysWithTimeBlocks,
      plannedMinutes,
      daysWithCompletedPlans,
      plannedTaskMinutes,
      tasklessPlannedMinutes,
      estimatedTaskMinutes,
      scheduledTimeBlockMinutes: plannedMinutes,
      actualLoggedTaskMinutes,
    };
  }

  /**
   * 7. Capacity Analytics
   */
  async getCapacityAnalytics(userId: string, query: AnalyticsQuery): Promise<CapacityAnalyticsDto> {
    const range = resolveDateRange(query);

    const [userSettings, dailyPlans] = await Promise.all([
      prisma.userSettings.findUnique({ where: { userId } }),
      prisma.dailyPlan.findMany({
        where: {
          userId,
          date: { gte: range.from, lte: range.to },
        },
        include: { timeBlocks: true },
      }),
    ]);

    const dailyCapacity = userSettings?.dailyWorkCapacityMinutes || 480;
    const daysEvaluated = dailyPlans.length;
    const totalAvailableMinutes = daysEvaluated * dailyCapacity;

    const totalPlannedMinutes = dailyPlans.reduce((acc, p) => {
      const dayPlanned = p.timeBlocks.reduce(
        (tAcc, tb) => tAcc + this.getTimeBlockMinutes(tb.startAt, tb.endAt),
        0
      );
      return acc + dayPlanned;
    }, 0);

    const totalRemainingMinutes = Math.max(0, totalAvailableMinutes - totalPlannedMinutes);
    const utilizationPercentage = calculatePercentage(totalPlannedMinutes, totalAvailableMinutes);

    const overCapacityDays = dailyPlans.filter((p) => {
      const dayPlanned = p.timeBlocks.reduce(
        (tAcc, tb) => tAcc + this.getTimeBlockMinutes(tb.startAt, tb.endAt),
        0
      );
      return dayPlanned > dailyCapacity;
    }).length;

    return {
      totalAvailableMinutes,
      totalPlannedMinutes,
      totalRemainingMinutes,
      utilizationPercentage,
      overCapacityDays,
      daysEvaluated,
    };
  }

  /**
   * 8. Overdue Analytics
   */
  async getOverdueAnalytics(userId: string, query: AnalyticsQuery): Promise<OverdueAnalyticsDto> {
    const range = resolveDateRange(query);
    const now = new Date();

    const tasks = await prisma.task.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            workstream: { select: { name: true } },
          },
        },
      },
    });

    const currentOverdueTasks = tasks.filter(
      (t) => t.status !== 'DONE' && t.status !== 'CANCELLED' && t.dueDate && t.dueDate < now
    ).length;

    const overdueCreatedDuringPeriod = tasks.filter(
      (t) =>
        t.dueDate &&
        t.dueDate >= range.from &&
        t.dueDate <= range.to &&
        t.createdAt >= range.from &&
        t.createdAt <= range.to
    ).length;

    const overdueCompletedDuringPeriod = tasks.filter(
      (t) =>
        t.status === 'DONE' &&
        t.completedAt &&
        t.completedAt >= range.from &&
        t.completedAt <= range.to &&
        t.dueDate &&
        t.completedAt > t.dueDate
    ).length;

    const workstreamCounts: Record<string, number> = {};
    const projectCounts: Record<string, number> = {};

    tasks
      .filter((t) => t.status !== 'DONE' && t.status !== 'CANCELLED' && t.dueDate && t.dueDate < now)
      .forEach((t) => {
        const wsName = t.project?.workstream?.name || 'Unassigned';
        workstreamCounts[wsName] = (workstreamCounts[wsName] || 0) + 1;

        const prjName = t.project?.name || 'No Project';
        projectCounts[prjName] = (projectCounts[prjName] || 0) + 1;
      });

    return {
      currentOverdueTasks,
      overdueCreatedDuringPeriod,
      overdueCompletedDuringPeriod,
      overdueByWorkstream: Object.entries(workstreamCounts).map(([name, count]) => ({ name, count })),
      overdueByProject: Object.entries(projectCounts).map(([name, count]) => ({ name, count })),
    };
  }

  /**
   * 9. Blocked Analytics
   */
  async getBlockedAnalytics(userId: string, query: AnalyticsQuery): Promise<BlockedAnalyticsDto> {
    const range = resolveDateRange(query);

    const tasks = await prisma.task.findMany({
      where: { userId },
      include: {
        dependentDependencies: true,
      },
    });

    const currentlyBlockedTasks = tasks.filter((t) => t.status === 'BLOCKED');
    const currentlyBlocked = currentlyBlockedTasks.length;

    const dependencyBlocked = currentlyBlockedTasks.filter((t) => t.dependentDependencies.length > 0).length;
    const manuallyBlocked = currentlyBlocked - dependencyBlocked;

    const blockedDuringPeriod = tasks.filter(
      (t) => t.createdAt >= range.from && t.createdAt <= range.to && t.status === 'BLOCKED'
    ).length;

    const unblockedDuringPeriod = tasks.filter(
      (t) =>
        t.completedAt &&
        t.completedAt >= range.from &&
        t.completedAt <= range.to &&
        t.status === 'DONE'
    ).length;

    return {
      currentlyBlocked,
      blockedDuringPeriod,
      unblockedDuringPeriod,
      dependencyBlocked,
      manuallyBlocked,
    };
  }

  /**
   * 10. Learning Analytics
   */
  async getLearningAnalytics(userId: string, query: AnalyticsQuery): Promise<LearningAnalyticsDto> {
    const range = resolveDateRange(query);

    const [items, activities] = await Promise.all([
      prisma.learningItem.findMany({ where: { userId } }),
      prisma.learningActivity.findMany({
        where: {
          userId,
          date: { gte: range.from, lte: range.to },
        },
      }),
    ]);

    const learningMinutes = activities.reduce((acc, a) => acc + a.minutes, 0);
    const learningActivityDays = new Set(
      activities.map((a) => a.date.toISOString().split('T')[0])
    ).size;

    return {
      learningItemsTotal: items.length,
      learningItemsStarted: items.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'COMPLETED').length,
      learningItemsCompleted: items.filter((i) => i.status === 'COMPLETED').length,
      learningItemsInProgress: items.filter((i) => i.status === 'IN_PROGRESS').length,
      learningItemsPaused: items.filter((i) => i.status === 'PAUSED').length,
      learningMinutes,
      learningActivityDays,
    };
  }

  /**
   * 11. Learning Trend
   */
  async getLearningTrend(userId: string, query: AnalyticsQuery): Promise<LearningTrendPointDto[]> {
    const range = resolveDateRange(query);
    const dateSeries = generateDateSeries(range.fromDateStr, range.toDateStr);

    const [activities, items] = await Promise.all([
      prisma.learningActivity.findMany({
        where: {
          userId,
          date: { gte: range.from, lte: range.to },
        },
      }),
      prisma.learningItem.findMany({
        where: {
          userId,
          completedAt: { gte: range.from, lte: range.to },
        },
      }),
    ]);

    return dateSeries.map((dateStr) => {
      const dayActivities = activities.filter(
        (a) => a.date.toISOString().split('T')[0] === dateStr
      );
      const minutes = dayActivities.reduce((acc, a) => acc + a.minutes, 0);
      const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
      const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);
      const itemsCompleted = items.filter(
        (i) => i.completedAt && i.completedAt >= dayStart && i.completedAt <= dayEnd
      ).length;

      return {
        date: dateStr,
        minutes,
        activities: dayActivities.length,
        itemsCompleted,
      };
    });
  }

  /**
   * 12. Skill Analytics
   */
  async getSkillAnalytics(userId: string, _query: AnalyticsQuery): Promise<SkillAnalyticsItemDto[]> {
    const skills = await prisma.skill.findMany({
      where: { userId },
      include: {
        learningItems: {
          include: {
            learningItem: {
              select: { projectId: true },
            },
          },
        },
        evidence: { select: { id: true } },
      },
      orderBy: { name: 'asc' },
    });

    return skills.map((s) => {
      const linkedProjects = new Set(
        s.learningItems
          .map((li) => li.learningItem?.projectId)
          .filter((id): id is string => Boolean(id))
      ).size;

      return {
        skillId: s.id,
        name: s.name,
        category: s.category ?? null,
        currentLevel: s.currentLevel,
        targetLevel: s.targetLevel,
        status: s.status,
        linkedLearningItems: s.learningItems.length,
        linkedProjects,
        linkedEvidence: s.evidence.length,
      };
    });
  }

  /**
   * 13. Evidence Analytics
   */
  async getEvidenceAnalytics(userId: string, query: AnalyticsQuery): Promise<EvidenceAnalyticsDto> {
    const range = resolveDateRange(query);

    const evidenceList = await prisma.evidence.findMany({
      where: {
        userId,
        date: { gte: range.from, lte: range.to },
      },
    });

    const typeCounts: Record<string, number> = {};
    evidenceList.forEach((e) => {
      typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    });

    return {
      evidenceCreated: evidenceList.length,
      evidenceVerified: evidenceList.filter((e) => e.verified).length,
      evidenceUnverified: evidenceList.filter((e) => !e.verified).length,
      byType: Object.entries(typeCounts).map(([type, count]) => ({ type, count })),
    };
  }

  /**
   * 14. Evidence Trend
   */
  async getEvidenceTrend(userId: string, query: AnalyticsQuery): Promise<EvidenceTrendPointDto[]> {
    const range = resolveDateRange(query);
    const dateSeries = generateDateSeries(range.fromDateStr, range.toDateStr);

    const evidenceList = await prisma.evidence.findMany({
      where: {
        userId,
        date: { gte: range.from, lte: range.to },
      },
    });

    return dateSeries.map((dateStr) => {
      const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
      const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);
      const created = evidenceList.filter((e) => e.date >= dayStart && e.date <= dayEnd).length;

      return {
        date: dateStr,
        evidenceCreated: created,
      };
    });
  }

  /**
   * 15. Review Analytics
   */
  async getReviewAnalytics(userId: string, _query: AnalyticsQuery): Promise<ReviewAnalyticsDto> {
    const reviews = await prisma.weeklyReview.findMany({
      where: { userId },
      select: { status: true },
    });

    return {
      reviewsCreated: reviews.length,
      reviewsCompleted: reviews.filter((r) => r.status === 'COMPLETED').length,
      reviewsDraft: reviews.filter((r) => r.status === 'DRAFT').length,
    };
  }

  /**
   * 16. Weekly Operating History
   */
  async getWeeklyHistory(userId: string, _query: AnalyticsQuery): Promise<WeeklyHistorySnapshotDto[]> {
    const [weeklyPlans, reviews, tasks, dailyPlans, learningActivities, evidenceList, projects] =
      await Promise.all([
        prisma.weeklyPlan.findMany({
          where: { userId },
          orderBy: { weekStart: 'desc' },
          take: 12,
        }),
        prisma.weeklyReview.findMany({ where: { userId } }),
        prisma.task.findMany({ where: { userId } }),
        prisma.dailyPlan.findMany({ where: { userId }, include: { timeBlocks: true } }),
        prisma.learningActivity.findMany({ where: { userId } }),
        prisma.evidence.findMany({ where: { userId } }),
        prisma.project.findMany({ where: { userId } }),
      ]);

    return weeklyPlans.map((plan) => {
      const weekStartStr = plan.weekStart.toISOString().split('T')[0];
      const weekEndStr = plan.weekEnd.toISOString().split('T')[0];

      const startDt = plan.weekStart;
      const endDt = plan.weekEnd;

      const tasksCompleted = tasks.filter(
        (t) => t.completedAt && t.completedAt >= startDt && t.completedAt <= endDt
      ).length;
      const tasksCreated = tasks.filter(
        (t) => t.createdAt >= startDt && t.createdAt <= endDt
      ).length;
      const tasksBlocked = tasks.filter(
        (t) => t.status === 'BLOCKED' && t.createdAt <= endDt
      ).length;
      const tasksOverdue = tasks.filter(
        (t) => t.status !== 'DONE' && t.status !== 'CANCELLED' && t.dueDate && t.dueDate <= endDt
      ).length;

      const weekDailyPlans = dailyPlans.filter(
        (p) => p.date >= startDt && p.date <= endDt
      );
      const plannedMinutes = weekDailyPlans
        .flatMap((p) => p.timeBlocks)
        .reduce((acc, tb) => acc + this.getTimeBlockMinutes(tb.startAt, tb.endAt), 0);
      const availableMinutes = weekDailyPlans.length * 480;

      const learningMinutes = learningActivities
        .filter((a) => a.date >= startDt && a.date <= endDt)
        .reduce((acc, a) => acc + a.minutes, 0);

      const evidenceCreated = evidenceList.filter(
        (e) => e.date >= startDt && e.date <= endDt
      ).length;

      const projectsActive = projects.filter((p) => p.status === 'ACTIVE').length;
      const projectsCompleted = projects.filter(
        (p) => p.status === 'COMPLETED' && p.updatedAt >= startDt && p.updatedAt <= endDt
      ).length;

      const review = reviews.find((r) => r.weeklyPlanId === plan.id);
      const reviewCompleted = review?.status === 'COMPLETED';

      return {
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        tasksCompleted,
        tasksCreated,
        tasksBlocked,
        tasksOverdue,
        plannedMinutes,
        availableMinutes,
        learningMinutes,
        learningItemsCompleted: 0,
        evidenceCreated,
        projectsActive,
        projectsCompleted,
        reviewCompleted,
      };
    });
  }
}
