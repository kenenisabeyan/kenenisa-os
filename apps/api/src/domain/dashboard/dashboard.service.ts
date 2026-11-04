import { prisma } from '../../lib/prisma.js';
import { NextBestActionService } from './next-best-action.service.js';
import {
  WorkstreamStatus,
  GoalStatus,
  ProjectStatus,
  TaskStatus,
} from '@prisma/client';
import {
  DashboardDto,
  DashboardQuery,
  TaskDto,
  WorkstreamDto,
  ProjectDto,
  RecentActivityDto,
} from '@kenenisa-os/shared';

export class DashboardService {
  private nbaService = new NextBestActionService();

  async getDashboardData(userId: string, query: DashboardQuery): Promise<DashboardDto> {
    const targetDate = query.date ? new Date(`${query.date}T00:00:00.000Z`) : new Date();

    const startOfToday = new Date(
      Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0),
    );
    const endOfToday = new Date(
      Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999),
    );

    const startOf7DaysAgo = new Date(startOfToday);
    startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 7);

    const endOfNext7Days = new Date(endOfToday);
    endOfNext7Days.setDate(endOfNext7Days.getDate() + 7);

    // 2. Execute streamlined parallel queries using Promise.allSettled for high resilience
    const [wsResult, projResult, goalsResult, tasksResult, auditResult] = await Promise.allSettled([
      // Active Workstreams
      prisma.workstream.findMany({
        where: { userId, status: WorkstreamStatus.ACTIVE },
        include: {
          _count: { select: { goals: true, projects: true } },
        },
        orderBy: { sortOrder: 'asc' },
      }),

      // Active Projects
      prisma.project.findMany({
        where: { userId, status: ProjectStatus.ACTIVE },
        include: {
          workstream: { select: { id: true, name: true, slug: true } },
          goal: { select: { id: true, title: true } },
          _count: { select: { milestones: true, tasks: true } },
        },
        orderBy: { priority: 'asc' },
        take: 8,
      }),

      // Active Goals Count
      prisma.goal.count({ where: { userId, status: GoalStatus.IN_PROGRESS } }),

      // Consolidated Tasks Query: retrieves all active tasks in one unified roundtrip
      prisma.task.findMany({
        where: {
          userId,
          status: { notIn: [TaskStatus.CANCELLED] },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
              priority: true,
              workstream: { select: { id: true, name: true, priorityWeight: true } },
            },
          },
          milestone: { select: { id: true, name: true } },
          parentTask: { select: { id: true, title: true } },
          blockingDependencies: {
            include: {
              blockingTask: {
                select: { id: true, title: true, status: true, priority: true },
              },
            },
          },
          _count: { select: { subtasks: true, blockingDependencies: true, dependentDependencies: true } },
        },
        orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
      }),

      // Recent Activity audit logs
      prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    const workstreamsRaw = wsResult.status === 'fulfilled' ? wsResult.value : [];
    const activeProjectsRaw = projResult.status === 'fulfilled' ? projResult.value : [];
    const activeGoalsCount = goalsResult.status === 'fulfilled' ? goalsResult.value : 0;
    const allTasksRaw = tasksResult.status === 'fulfilled' ? tasksResult.value : [];
    const auditLogsRaw = auditResult.status === 'fulfilled' ? auditResult.value : [];

    // Filter tasks in-memory (0ms overhead) instead of firing multiple duplicate database roundtrips
    const dueTodayRaw = allTasksRaw.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) >= startOfToday &&
        new Date(t.dueDate) <= endOfToday &&
        t.status !== TaskStatus.DONE,
    ).slice(0, 10);

    const inProgressRaw = allTasksRaw.filter((t) => t.status === TaskStatus.IN_PROGRESS).slice(0, 10);
    const readyRaw = allTasksRaw.filter((t) => t.status === TaskStatus.READY).slice(0, 10);
    const blockedRaw = allTasksRaw.filter((t) => t.status === TaskStatus.BLOCKED).slice(0, 10);

    const overdueRaw = allTasksRaw.filter(
      (t) => t.dueDate && new Date(t.dueDate) < startOfToday && t.status !== TaskStatus.DONE,
    ).slice(0, 10);

    const upcomingRaw = allTasksRaw.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) > endOfToday &&
        new Date(t.dueDate) <= endOfNext7Days &&
        t.status !== TaskStatus.DONE,
    ).slice(0, 10);

    const readyTasksCount = allTasksRaw.filter((t) => t.status === TaskStatus.READY).length;
    const inProgressTasksCount = allTasksRaw.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
    const blockedTasksCount = allTasksRaw.filter((t) => t.status === TaskStatus.BLOCKED).length;
    const overdueTasksCount = allTasksRaw.filter(
      (t) => t.dueDate && new Date(t.dueDate) < startOfToday && t.status !== TaskStatus.DONE,
    ).length;
    const completedTasksRecentCount = allTasksRaw.filter(
      (t) => t.status === TaskStatus.DONE && t.completedAt && new Date(t.completedAt) >= startOf7DaysAgo,
    ).length;

    // Evaluate Next Best Action from ready/in-progress candidate tasks directly in memory
    const candidateTasks = allTasksRaw.filter(
      (t) => t.status === TaskStatus.READY || t.status === TaskStatus.IN_PROGRESS,
    );
    const nextBestAction = this.nbaService.evaluateFromCandidates(candidateTasks, targetDate);

    const formatTask = (t: typeof dueTodayRaw[number]): TaskDto => ({
      id: t.id,
      userId: t.userId,
      projectId: t.projectId,
      milestoneId: t.milestoneId,
      parentTaskId: t.parentTaskId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      estimateMinutes: t.estimateMinutes,
      actualMinutes: t.actualMinutes,
      startDate: t.startDate ? t.startDate.toISOString() : null,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      completedAt: t.completedAt ? t.completedAt.toISOString() : null,
      sortOrder: t.sortOrder,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      project: t.project
        ? { id: t.project.id, name: t.project.name, slug: t.project.slug }
        : undefined,
      milestone: t.milestone ? { id: t.milestone.id, name: t.milestone.name } : null,
      parentTask: t.parentTask ? { id: t.parentTask.id, title: t.parentTask.title } : null,
      _count: t._count,
    });

    const formatWorkstream = (w: typeof workstreamsRaw[number]): WorkstreamDto => ({
      id: w.id,
      userId: w.userId,
      name: w.name,
      slug: w.slug,
      description: w.description,
      status: w.status,
      priorityWeight: w.priorityWeight,
      sortOrder: w.sortOrder,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
      _count: w._count,
    });

    const formatProject = (p: typeof activeProjectsRaw[number]): ProjectDto => ({
      id: p.id,
      userId: p.userId,
      workstreamId: p.workstreamId,
      goalId: p.goalId,
      name: p.name,
      slug: p.slug,
      description: p.description,
      status: p.status,
      priority: p.priority,
      startDate: p.startDate ? p.startDate.toISOString() : null,
      targetDate: p.targetDate ? p.targetDate.toISOString() : null,
      completedAt: p.completedAt ? p.completedAt.toISOString() : null,
      archivedAt: p.archivedAt ? p.archivedAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      workstream: p.workstream ? { id: p.workstream.id, name: p.workstream.name, slug: p.workstream.slug } : undefined,
      goal: p.goal ? { id: p.goal.id, title: p.goal.title } : null,
      _count: p._count,
    });

    const formatActivity = (log: typeof auditLogsRaw[number]): RecentActivityDto => {
      let description = `${log.action} on ${log.entityType}`;
      if (log.metadata && typeof log.metadata === 'object' && 'title' in log.metadata) {
        description = `${log.action}: ${(log.metadata as { title: string }).title}`;
      } else if (log.metadata && typeof log.metadata === 'object' && 'name' in log.metadata) {
        description = `${log.action}: ${(log.metadata as { name: string }).name}`;
      }

      return {
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        description,
        createdAt: log.createdAt.toISOString(),
      };
    };

    return {
      summary: {
        activeWorkstreams: workstreamsRaw.length,
        activeGoals: activeGoalsCount,
        activeProjects: activeProjectsRaw.length,
        readyTasks: readyTasksCount,
        inProgressTasks: inProgressTasksCount,
        blockedTasks: blockedTasksCount,
        overdueTasks: overdueTasksCount,
        completedTasksRecent: completedTasksRecentCount,
      },
      nextBestAction,
      today: {
        date: startOfToday.toISOString().split('T')[0],
        dueToday: dueTodayRaw.map(formatTask),
        inProgress: inProgressRaw.map(formatTask),
        ready: readyRaw.map(formatTask),
      },
      workstreams: workstreamsRaw.map(formatWorkstream),
      activeProjects: activeProjectsRaw.map(formatProject),
      blockedTasks: blockedRaw.map((b) => ({
        ...formatTask(b),
        blockingDependencies: b.blockingDependencies.map((dep) => ({
          id: dep.id,
          blockingTaskId: dep.blockingTaskId,
          dependentTaskId: dep.dependentTaskId,
          dependencyType: dep.dependencyType,
          createdAt: dep.createdAt.toISOString(),
          blockingTask: dep.blockingTask
            ? {
                id: dep.blockingTask.id,
                title: dep.blockingTask.title,
                status: dep.blockingTask.status,
                priority: dep.blockingTask.priority,
              }
            : undefined,
        })),
      })),
      overdueTasks: overdueRaw.map(formatTask),
      upcomingTasks: upcomingRaw.map(formatTask),
      recentActivity: auditLogsRaw.map(formatActivity),
    };
  }
}
