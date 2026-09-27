import { prisma } from '../../lib/prisma.js';
import {
  PlanHorizon,
  ResultOverviewDto,
  ResultTrendDto,
  PatternObservationDto,
  ResultRecommendationDto,
  ResultAnalysisDto,
} from '@kenenisa-os/shared';

export class ResultIntelligenceService {
  /**
   * Generates a factual result overview for a specified date range or planning period
   */
  static async getResultOverview(
    userId: string,
    options?: { fromDate?: string; toDate?: string; horizon?: PlanHorizon }
  ): Promise<ResultOverviewDto> {
    const whereClause: any = { userId };

    if (options?.horizon) {
      whereClause.horizon = options.horizon;
    }

    if (options?.fromDate || options?.toDate) {
      whereClause.createdAt = {};
      if (options.fromDate) {
        whereClause.createdAt.gte = new Date(options.fromDate);
      }
      if (options.toDate) {
        whereClause.createdAt.lte = new Date(options.toDate);
      }
    }

    const outcomes = await prisma.planOutcome.findMany({
      where: whereClause,
      select: {
        id: true,
        horizon: true,
        outcomeState: true,
      },
    });

    const safeOutcomes = outcomes || [];

    const stats = {
      totalPlanned: safeOutcomes.length,
      completed: safeOutcomes.filter((o) => o.outcomeState === 'COMPLETED').length,
      partiallyCompleted: safeOutcomes.filter((o) => o.outcomeState === 'PARTIALLY_COMPLETED').length,
      missed: safeOutcomes.filter((o) => o.outcomeState === 'MISSED').length,
      blocked: safeOutcomes.filter((o) => o.outcomeState === 'BLOCKED').length,
      inProgress: safeOutcomes.filter((o) => o.outcomeState === 'IN_PROGRESS').length,
      rescheduled: safeOutcomes.filter((o) => o.outcomeState === 'RESCHEDULED').length,
      cancelled: safeOutcomes.filter((o) => o.outcomeState === 'CANCELLED').length,
      unknown: safeOutcomes.filter((o) => o.outcomeState === 'UNKNOWN').length,
    };

    const byHorizon: Record<PlanHorizon, { total: number; completed: number }> = {
      YEARLY: { total: 0, completed: 0 },
      MONTHLY: { total: 0, completed: 0 },
      WEEKLY: { total: 0, completed: 0 },
      DAILY: { total: 0, completed: 0 },
    };

    for (const item of safeOutcomes) {
      if (byHorizon[item.horizon as PlanHorizon]) {
        byHorizon[item.horizon as PlanHorizon].total += 1;
        if (item.outcomeState === 'COMPLETED') {
          byHorizon[item.horizon as PlanHorizon].completed += 1;
        }
      }
    }

    const periodLabel = options?.fromDate && options?.toDate
      ? `${options.fromDate} to ${options.toDate}`
      : 'All Active Records';

    return {
      period: periodLabel,
      ...stats,
      byHorizon,
    };
  }

  /**
   * Generates period trend breakdowns (Daily, Weekly, Monthly)
   */
  static async getResultTrends(
    userId: string,
    options?: { scope?: string; fromDate?: string; toDate?: string }
  ): Promise<ResultTrendDto[]> {
    const from = options?.fromDate ? new Date(options.fromDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = options?.toDate ? new Date(options.toDate) : new Date();

    const outcomes = await prisma.planOutcome.findMany({
      where: {
        userId,
        createdAt: { gte: from, lte: to },
      },
      select: {
        createdAt: true,
        outcomeState: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const safeOutcomes = outcomes || [];
    const trendMap = new Map<string, ResultTrendDto>();

    for (const outcome of safeOutcomes) {
      const dateStr = outcome.createdAt.toISOString().split('T')[0];
      if (!trendMap.has(dateStr)) {
        trendMap.set(dateStr, {
          periodLabel: dateStr,
          startDate: dateStr,
          endDate: dateStr,
          planned: 0,
          completed: 0,
          partiallyCompleted: 0,
          missed: 0,
          blocked: 0,
          completionRatePercent: 0,
        });
      }

      const entry = trendMap.get(dateStr)!;
      entry.planned += 1;
      if (outcome.outcomeState === 'COMPLETED') entry.completed += 1;
      else if (outcome.outcomeState === 'PARTIALLY_COMPLETED') entry.partiallyCompleted += 1;
      else if (outcome.outcomeState === 'MISSED') entry.missed += 1;
      else if (outcome.outcomeState === 'BLOCKED') entry.blocked += 1;

      entry.completionRatePercent = entry.planned > 0 ? Math.round((entry.completed / entry.planned) * 100) : 0;
    }

    return Array.from(trendMap.values());
  }

  /**
   * Detects patterns across outcomes (reschedule recurrences, dependency blockers, weekday concentrations)
   */
  static async detectPatterns(userId: string): Promise<PatternObservationDto[]> {
    const patterns: PatternObservationDto[] = [];

    // 1. Rescheduled recurrence
    const rescheduledOutcomes = await prisma.planOutcome.findMany({
      where: { userId, outcomeState: 'RESCHEDULED' },
      select: { id: true, title: true, rescheduledTo: true },
    });

    if ((rescheduledOutcomes || []).length > 0) {
      patterns.push({
        id: 'pat-reschedule-1',
        category: 'RESCHEDULE_RECURRENCE',
        summary: `${rescheduledOutcomes.length} planned activities have been rescheduled to a future period.`,
        evidence: `Activities include: ${rescheduledOutcomes.slice(0, 3).map((o) => `"${o.title}"`).join(', ')}.`,
        affectedItemCount: rescheduledOutcomes.length,
        detectedAt: new Date().toISOString(),
      });
    }

    // 2. Blocker recurrence
    const blockedOutcomes = await prisma.planOutcome.findMany({
      where: { userId, outcomeState: 'BLOCKED' },
      include: {
        task: {
          include: {
            dependentDependencies: {
              include: { blockingTask: true },
            },
          },
        },
      },
    });

    if ((blockedOutcomes || []).length > 0) {
      patterns.push({
        id: 'pat-blocker-1',
        category: 'BLOCKER_RECURRENCE',
        summary: `${blockedOutcomes.length} activities are currently blocked by unresolved task dependencies.`,
        evidence: `Unresolved blocking dependencies identified in tasks linked to ${blockedOutcomes.slice(0, 2).map((b) => b.title).join(', ')}.`,
        affectedItemCount: blockedOutcomes.length,
        detectedAt: new Date().toISOString(),
      });
    }

    return patterns;
  }

  /**
   * Generates actionable recommendations integrated with the deterministic Next Best Action engine
   */
  static async getRecommendations(userId: string): Promise<ResultRecommendationDto[]> {
    const recommendations: ResultRecommendationDto[] = [];
    let actionCount = 1;

    // 1. Blocked items
    const blocked = await prisma.planOutcome.findMany({
      where: { userId, outcomeState: 'BLOCKED' },
      take: 3,
    });

    for (const item of blocked || []) {
      recommendations.push({
        id: `rec-${item.id}`,
        actionNumber: actionCount++,
        title: `Resolve blocker for "${item.title}"`,
        reason: 'The planned activity is marked BLOCKED due to an unresolved upstream task dependency.',
        priority: item.priority || 'P1',
        relatedOutcomeId: item.id,
        relatedTaskId: item.taskId || undefined,
        actionType: 'RESOLVE_BLOCKER',
      });
    }

    // 2. Missed items
    const missed = await prisma.planOutcome.findMany({
      where: { userId, outcomeState: 'MISSED' },
      take: 3,
    });

    for (const item of missed || []) {
      recommendations.push({
        id: `rec-${item.id}`,
        actionNumber: actionCount++,
        title: `Review missed activity "${item.title}"`,
        reason: 'Scheduled time window expired without recorded completion evidence or explicit rescheduling.',
        priority: item.priority || 'P2',
        relatedOutcomeId: item.id,
        relatedTaskId: item.taskId || undefined,
        actionType: 'REVIEW_MISSED',
      });
    }

    // 3. Ready High Priority Tasks from Next Best Action engine
    const readyTasks = await prisma.task.findMany({
      where: {
        userId,
        status: { in: ['READY', 'IN_PROGRESS'] },
        dependentDependencies: { none: { blockingTask: { status: { not: 'DONE' } } } },
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      take: 2,
    });

    for (const task of readyTasks || []) {
      recommendations.push({
        id: `rec-task-${task.id}`,
        actionNumber: actionCount++,
        title: `Execute ready task "${task.title}"`,
        reason: 'Highest priority ready task with zero unresolved blocking dependencies.',
        priority: task.priority,
        relatedTaskId: task.id,
        actionType: 'EXECUTE_NEXT',
      });
    }

    return recommendations;
  }

  /**
   * Generates a comprehensive factual analysis report with non-judgmental AI advisory
   */
  static async getResultAnalysis(
    userId: string,
    options?: { fromDate?: string; toDate?: string; horizon?: PlanHorizon }
  ): Promise<ResultAnalysisDto> {
    const overview = await this.getResultOverview(userId, options);
    const trends = await this.getResultTrends(userId, options);
    const patterns = await this.detectPatterns(userId);
    const recommendations = await this.getRecommendations(userId);

    const observations: string[] = [];
    observations.push(
      `Out of ${overview.totalPlanned} total planned outcomes, ${overview.completed} were authoritatively completed and ${overview.partiallyCompleted} were partially completed.`
    );
    if (overview.missed > 0) {
      observations.push(`${overview.missed} activities passed their scheduled period without completion evidence.`);
    }
    if (overview.blocked > 0) {
      observations.push(`${overview.blocked} activities are prevented from completing due to unresolved dependencies.`);
    }

    const aiAdvisory = `Based on empirical system telemetry, ${overview.completed} of ${overview.totalPlanned} outcomes have been verified. The primary unresolved bottleneck involves ${overview.blocked} blocked activities and ${overview.missed} missed items. Resolving blocking task dependencies will unblock execution capacity.`;

    return {
      overview,
      observations,
      patterns,
      recommendations,
      trends,
      aiAdvisory,
    };
  }

  /**
   * Queries detailed outcomes with full relational telemetries for table grid display
   */
  static async getDetailedResults(userId: string, queryParams: any) {
    const page = Number(queryParams.page) || 1;
    const pageSize = Math.min(Number(queryParams.pageSize) || 50, 500);
    const skip = (page - 1) * pageSize;

    const where: any = { userId };

    if (queryParams.horizon) where.horizon = queryParams.horizon;
    if (queryParams.status) where.outcomeState = queryParams.status;
    if (queryParams.source) where.source = queryParams.source;
    if (queryParams.workstreamId) where.workstreamId = queryParams.workstreamId;
    if (queryParams.projectId) where.projectId = queryParams.projectId;

    if (queryParams.search) {
      where.OR = [
        { title: { contains: queryParams.search, mode: 'insensitive' } },
        { expectedResult: { contains: queryParams.search, mode: 'insensitive' } },
        { actualResult: { contains: queryParams.search, mode: 'insensitive' } },
      ];
    }

    if (queryParams.fromDate || queryParams.toDate) {
      where.createdAt = {};
      if (queryParams.fromDate) where.createdAt.gte = new Date(queryParams.fromDate);
      if (queryParams.toDate) where.createdAt.lte = new Date(queryParams.toDate);
    }

    const [items, total] = await Promise.all([
      prisma.planOutcome.findMany({
        where,
        include: {
          workstream: true,
          goal: true,
          project: true,
          milestone: true,
          task: {
            include: {
              dependentDependencies: {
                include: { blockingTask: true },
              },
            },
          },
          evidenceLinks: {
            include: { evidence: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.planOutcome.count({ where }),
    ]);

    return {
      items: items || [],
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  /**
   * Generates chronological timeline entries distinguishing planned time, actual activity, and results
   */
  static async getTimeline(userId: string, options?: { fromDate?: string; toDate?: string }) {
    const where: any = { userId };
    if (options?.fromDate || options?.toDate) {
      where.createdAt = {};
      if (options.fromDate) where.createdAt.gte = new Date(options.fromDate);
      if (options.toDate) where.createdAt.lte = new Date(options.toDate);
    }

    const items = await prisma.planOutcome.findMany({
      where,
      include: {
        task: true,
        project: true,
        evidenceLinks: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return (items || []).map((o) => {
      const timeLabel = o.startDate
        ? o.startDate.toISOString().split('T')[1]?.substring(0, 5) || o.createdAt.toISOString().substring(11, 16)
        : o.createdAt.toISOString().substring(11, 16);

      return {
        id: o.id,
        timeLabel,
        title: o.title,
        horizon: o.horizon,
        outcomeState: o.outcomeState,
        source: o.source || 'AUTOMATIC',
        expectedResult: o.expectedResult || '—',
        actualResult: o.actualResult || '—',
        plannedMinutes: o.plannedMinutes || 0,
        actualMinutes: o.task?.actualMinutes || 0,
        taskTitle: o.task?.title,
        projectName: o.project?.name,
        evidenceCount: o.evidenceLinks?.length || 0,
      };
    });
  }

  /**
   * Computes period-over-period comparative metrics (e.g. This Week vs Last Week)
   */
  static async getPeriodComparison(userId: string, scope = 'week') {
    const now = new Date();
    let currentStart: Date;
    let previousStart: Date;

    if (scope === 'month') {
      currentStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      previousStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    } else {
      // week
      currentStart = new Date(now.valueOf() - 7 * 24 * 60 * 60 * 1000);
      previousStart = new Date(now.valueOf() - 14 * 24 * 60 * 60 * 1000);
    }

    const [currentOutcomes, previousOutcomes] = await Promise.all([
      prisma.planOutcome.findMany({ where: { userId, createdAt: { gte: currentStart } } }),
      prisma.planOutcome.findMany({ where: { userId, createdAt: { gte: previousStart, lt: currentStart } } }),
    ]);

    const countState = (items: any[], state: string) => (items || []).filter((i) => i.outcomeState === state).length;
    const calcChange = (curr: number, prev: number): 'increased' | 'decreased' | 'unchanged' => {
      if (curr > prev) return 'increased';
      if (curr < prev) return 'decreased';
      return 'unchanged';
    };

    const currComp = countState(currentOutcomes, 'COMPLETED');
    const prevComp = countState(previousOutcomes, 'COMPLETED');

    const currPart = countState(currentOutcomes, 'PARTIALLY_COMPLETED');
    const prevPart = countState(previousOutcomes, 'PARTIALLY_COMPLETED');

    const currMiss = countState(currentOutcomes, 'MISSED');
    const prevMiss = countState(previousOutcomes, 'MISSED');

    const currBlock = countState(currentOutcomes, 'BLOCKED');
    const prevBlock = countState(previousOutcomes, 'BLOCKED');

    const currProg = countState(currentOutcomes, 'IN_PROGRESS');
    const prevProg = countState(previousOutcomes, 'IN_PROGRESS');

    return {
      currentPeriodLabel: `Current ${scope.toUpperCase()}`,
      previousPeriodLabel: `Previous ${scope.toUpperCase()}`,
      metrics: {
        completed: { current: currComp, previous: prevComp, change: calcChange(currComp, prevComp) },
        partiallyCompleted: { current: currPart, previous: prevPart, change: calcChange(currPart, prevPart) },
        missed: { current: currMiss, previous: prevMiss, change: calcChange(currMiss, prevMiss) },
        blocked: { current: currBlock, previous: prevBlock, change: calcChange(currBlock, prevBlock) },
        inProgress: { current: currProg, previous: prevProg, change: calcChange(currProg, prevProg) },
      },
    };
  }

  /**
   * Aggregates results grouped by user Workstreams
   */
  static async getWorkstreamBreakdown(userId: string) {
    const workstreams = await prisma.workstream.findMany({
      where: { userId },
      include: {
        planOutcomes: true,
      },
    });

    return (workstreams || []).map((w) => {
      const outcomes = w.planOutcomes || [];
      const totalPlanned = outcomes.length;
      const completed = outcomes.filter((o) => o.outcomeState === 'COMPLETED').length;
      const partiallyCompleted = outcomes.filter((o) => o.outcomeState === 'PARTIALLY_COMPLETED').length;
      const missed = outcomes.filter((o) => o.outcomeState === 'MISSED').length;
      const blocked = outcomes.filter((o) => o.outcomeState === 'BLOCKED').length;

      return {
        workstreamId: w.id,
        workstreamName: w.name,
        totalPlanned,
        completed,
        partiallyCompleted,
        missed,
        blocked,
        completionRatePercent: totalPlanned > 0 ? Math.round((completed / totalPlanned) * 100) : 0,
      };
    });
  }

  /**
   * Aggregates results grouped by user Projects
   */
  static async getProjectBreakdown(userId: string) {
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        planOutcomes: true,
      },
    });

    return (projects || []).map((p) => {
      const outcomes = p.planOutcomes || [];
      const totalPlanned = outcomes.length;
      const completed = outcomes.filter((o) => o.outcomeState === 'COMPLETED').length;
      const partiallyCompleted = outcomes.filter((o) => o.outcomeState === 'PARTIALLY_COMPLETED').length;
      const missed = outcomes.filter((o) => o.outcomeState === 'MISSED').length;
      const blocked = outcomes.filter((o) => o.outcomeState === 'BLOCKED').length;

      return {
        projectId: p.id,
        projectName: p.name,
        totalPlanned,
        completed,
        partiallyCompleted,
        missed,
        blocked,
        completionRatePercent: totalPlanned > 0 ? Math.round((completed / totalPlanned) * 100) : 0,
      };
    });
  }

  /**
   * Analyzes Estimated vs Scheduled vs Actual time and capacity conflicts
   */
  static async getCapacityAnalysis(userId: string) {
    const userSettings = await prisma.userSettings.findUnique({ where: { userId } });
    const capacity = userSettings?.dailyWorkCapacityMinutes || 480;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayPlan = await prisma.dailyPlan.findFirst({
      where: { userId, date: new Date(`${todayStr}T00:00:00.000Z`) },
      include: {
        timeBlocks: {
          include: { task: true },
        },
      },
    });

    const blocks = todayPlan?.timeBlocks || [];
    let totalScheduled = 0;
    let totalEstimated = 0;
    let totalActual = 0;

    for (const tb of blocks) {
      const mins = Math.round((tb.endAt.getTime() - tb.startAt.getTime()) / 60000);
      totalScheduled += mins > 0 ? mins : 0;
      if (tb.task) {
        totalEstimated += tb.task.estimateMinutes || 0;
        totalActual += tb.task.actualMinutes || 0;
      }
    }

    const isOverCapacity = totalScheduled > capacity;
    const capacityConflictNotes = isOverCapacity
      ? `Scheduled work (${Math.round(totalScheduled / 60)}h) exceeds configured daily capacity (${Math.round(capacity / 60)}h).`
      : 'Workload is within configured capacity.';

    return {
      totalEstimatedMinutes: totalEstimated,
      totalScheduledMinutes: totalScheduled,
      totalActualMinutes: totalActual,
      availableCapacityMinutes: capacity,
      isOverCapacity,
      capacityConflictNotes,
    };
  }
}

