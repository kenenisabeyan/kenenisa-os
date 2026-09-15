import { prisma } from '../../../lib/prisma.js';

export interface BoundedOperatingContext {
  currentDate: string;
  userTimezone: string;
  nextBestActionTitle?: string;
  nextBestActionScore?: number;
  todayTasksCount: number;
  overdueTasksCount: number;
  blockedTasksCount: number;
  activeProjectsCount: number;
  activeGoalsCount: number;
  activeWorkstreamsCount: number;
  capacity: {
    dailyCapacityMinutes: number;
    plannedTimeBlockMinutes: number;
    utilizationPercentage: number | null;
  };
  recentLearningMinutes: number;
  activeSkillsCount: number;
  recentEvidenceCount: number;
  activeOpportunitiesCount: number;
  upcomingFollowUpsCount: number;
  recentReviewStatus?: string;
  summaryText: string;
}

export class ContextService {
  async buildContext(userId: string): Promise<BoundedOperatingContext> {
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      userSettings,
      workstreamsCount,
      goalsCount,
      projectsCount,
      todayTasks,
      overdueTasksCount,
      blockedTasksCount,
      todayTimeBlocks,
      learningActivities,
      skillsCount,
      evidenceCount,
      opportunitiesCount,
      followUpsCount,
      latestReview,
    ] = await Promise.all([
      prisma.userSettings.findUnique({ where: { userId } }),
      prisma.workstream.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.goal.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.project.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.task.findMany({
        where: {
          userId,
          status: { in: ['READY', 'IN_PROGRESS'] },
        },
        orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
        take: 5,
      }),
      prisma.task.count({
        where: {
          userId,
          status: { in: ['BACKLOG', 'READY', 'IN_PROGRESS', 'REVIEW'] },
          dueDate: { lt: new Date() },
        },
      }),
      prisma.task.count({
        where: { userId, status: 'BLOCKED' },
      }),
      prisma.timeBlock.findMany({
        where: {
          userId,
          startAt: {
            gte: new Date(`${todayStr}T00:00:00.000Z`),
            lte: new Date(`${todayStr}T23:59:59.999Z`),
          },
        },
      }),
      prisma.learningActivity.aggregate({
        where: {
          userId,
          date: { gte: new Date(Date.now() - 7 * 86400000) },
        },
        _sum: { minutes: true },
      }),
      prisma.skill.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.evidence.count({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
        },
      }),
      prisma.opportunity.count({
        where: {
          userId,
          status: { in: ['DISCOVERED', 'EVALUATING', 'PREPARING', 'APPLIED', 'IN_DISCUSSION', 'INTERVIEW', 'OFFERED', 'ACTIVE'] },
        },
      }),
      prisma.opportunity.count({
        where: {
          userId,
          followUpDate: { lte: new Date(Date.now() + 7 * 86400000) },
          status: { notIn: ['COMPLETED', 'REJECTED', 'WITHDRAWN', 'ARCHIVED'] },
        },
      }),
      prisma.weeklyReview.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const dailyCap = userSettings?.dailyWorkCapacityMinutes || 480;
    const plannedMinutes = todayTimeBlocks.reduce((acc, tb) => {
      const duration = (tb.endAt.getTime() - tb.startAt.getTime()) / 60000;
      return acc + (duration > 0 ? duration : 0);
    }, 0);

    const utilizationPercentage = dailyCap > 0 ? Math.round((plannedMinutes / dailyCap) * 100) : null;
    const nextBest = todayTasks[0];

    const summaryText = `Date: ${todayStr} | Active Projects: ${projectsCount} | Top Priority Task: ${nextBest ? nextBest.title : 'None'} | Overdue Tasks: ${overdueTasksCount} | Planned Time: ${plannedMinutes}/${dailyCap}m (${utilizationPercentage || 0}%)`;

    return {
      currentDate: todayStr,
      userTimezone: userSettings?.timezone || 'UTC',
      nextBestActionTitle: nextBest ? nextBest.title : undefined,
      todayTasksCount: todayTasks.length,
      overdueTasksCount,
      blockedTasksCount,
      activeProjectsCount: projectsCount,
      activeGoalsCount: goalsCount,
      activeWorkstreamsCount: workstreamsCount,
      capacity: {
        dailyCapacityMinutes: dailyCap,
        plannedTimeBlockMinutes: plannedMinutes,
        utilizationPercentage,
      },
      recentLearningMinutes: learningActivities._sum.minutes || 0,
      activeSkillsCount: skillsCount,
      recentEvidenceCount: evidenceCount,
      activeOpportunitiesCount: opportunitiesCount,
      upcomingFollowUpsCount: followUpsCount,
      recentReviewStatus: latestReview?.status,
      summaryText,
    };
  }
}
