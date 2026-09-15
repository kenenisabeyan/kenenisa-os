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

    // 2. Execute parallel queries for dashboard sections
    const [
      activeWorkstreamsCount,
      activeGoalsCount,
      activeProjectsCount,
      readyTasksCount,
      inProgressTasksCount,
      blockedTasksCount,
      overdueTasksCount,
      completedTasksRecentCount,
      nextBestAction,
      dueTodayRaw,
      inProgressRaw,
      readyRaw,
      workstreamsRaw,
      activeProjectsRaw,
      blockedRaw,
      overdueRaw,
      upcomingRaw,
      auditLogsRaw,
    ] = await Promise.all([
      prisma.workstream.count({ where: { userId, status: WorkstreamStatus.ACTIVE } }),
      prisma.goal.count({ where: { userId, status: GoalStatus.IN_PROGRESS } }),
      prisma.project.count({ where: { userId, status: ProjectStatus.ACTIVE } }),
      prisma.task.count({ where: { userId, status: TaskStatus.READY } }),
      prisma.task.count({ where: { userId, status: TaskStatus.IN_PROGRESS } }),
      prisma.task.count({ where: { userId, status: TaskStatus.BLOCKED } }),
      prisma.task.count({
        where: {
          userId,
          dueDate: { lt: startOfToday },
          status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
        },
      }),
      prisma.task.count({
        where: {
          userId,
          status: TaskStatus.DONE,
          completedAt: { gte: startOf7DaysAgo },
        },
      }),
      this.nbaService.evaluateNextBestAction(userId, targetDate),

      // Tasks due today
      prisma.task.findMany({
        where: {
          userId,
          dueDate: { gte: startOfToday, lte: endOfToday },
          status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
        },
        include: {
          project: { select: { id: true, name: true, slug: true } },
          milestone: { select: { id: true, name: true } },
          parentTask: { select: { id: true, title: true } },
          _count: { select: { subtasks: true, blockingDependencies: true, dependentDependencies: true } },
        },
        orderBy: { priority: 'asc' },
        take: 10,
      }),

      // Tasks in progress
      prisma.task.findMany({
        where: { userId, status: TaskStatus.IN_PROGRESS },
        include: {
          project: { select: { id: true, name: true, slug: true } },
          milestone: { select: { id: true, name: true } },
          parentTask: { select: { id: true, title: true } },
          _count: { select: { subtasks: true, blockingDependencies: true, dependentDependencies: true } },
        },
        orderBy: { priority: 'asc' },
        take: 10,
      }),

      // Ready tasks
      prisma.task.findMany({
        where: { userId, status: TaskStatus.READY },
        include: {
          project: { select: { id: true, name: true, slug: true } },
          milestone: { select: { id: true, name: true } },
          parentTask: { select: { id: true, title: true } },
          _count: { select: { subtasks: true, blockingDependencies: true, dependentDependencies: true } },
        },
        orderBy: { priority: 'asc' },
        take: 10,
      }),

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

      // Blocked Tasks with details
      prisma.task.findMany({
        where: { userId, status: TaskStatus.BLOCKED },
        include: {
          project: { select: { id: true, name: true, slug: true } },
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
        orderBy: { priority: 'asc' },
        take: 10,
      }),

      // Overdue Tasks
      prisma.task.findMany({
        where: {
          userId,
          dueDate: { lt: startOfToday },
          status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
        },
        include: {
          project: { select: { id: true, name: true, slug: true } },
          milestone: { select: { id: true, name: true } },
          parentTask: { select: { id: true, title: true } },
          _count: { select: { subtasks: true, blockingDependencies: true, dependentDependencies: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),

      // Upcoming Tasks (next 7 days)
      prisma.task.findMany({
        where: {
          userId,
          dueDate: { gt: endOfToday, lte: endOfNext7Days },
          status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
        },
        include: {
          project: { select: { id: true, name: true, slug: true } },
          milestone: { select: { id: true, name: true } },
          parentTask: { select: { id: true, title: true } },
          _count: { select: { subtasks: true, blockingDependencies: true, dependentDependencies: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),

      // Recent Activity audit logs
      prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

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
        activeWorkstreams: activeWorkstreamsCount,
        activeGoals: activeGoalsCount,
        activeProjects: activeProjectsCount,
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
