import { prisma } from '../../../lib/prisma.js';
import { MilestoneStatus } from '@prisma/client';
import type { PageContextInput } from '@kenenisa-os/shared';
import { logger } from '../../../lib/logger.js';

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return await fn();
    } catch {
      logger.warn({ err: err instanceof Error ? err.message : String(err) }, '[ContextService] safeQuery fallback used');
      return fallback;
    }
  }
}

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
  graduation?: {
    daysRemaining: number | null;
    targetDate: string | null;
    individualProjectProgress: number;
    groupProjectProgress: number;
    academicCoursesCount: number;
  };
  integrations?: {
    connectedCount: number;
    connectedProviders: string[];
    lastSyncAt: string | null;
  };
  pageContext?: {
    pageType: string;
    entityId?: string;
    entityTitle?: string;
    details?: Record<string, unknown>;
  };
  summaryText: string;
}

export class ContextService {
  async buildContext(userId: string, pageContextInput?: PageContextInput): Promise<BoundedOperatingContext> {
    const todayStr = new Date().toISOString().split('T')[0];

    const userSettings = await safeQuery(
      () => prisma.userSettings.findUnique({ where: { userId } }),
      null,
    );

    // Group 1: Strategic hierarchy metrics
    const [workstreamsCount, goalsCount, projectsCount] = await Promise.all([
      safeQuery(() => prisma.workstream.count({ where: { userId, status: 'ACTIVE' } }), 0),
      safeQuery(() => prisma.goal.count({ where: { userId, status: 'IN_PROGRESS' } }), 0),
      safeQuery(() => prisma.project.count({ where: { userId, status: 'ACTIVE' } }), 0),
    ]);

    // Group 2: Execution & scheduling metrics
    const [todayTasks, overdueTasksCount, blockedTasksCount, todayTimeBlocks] = await Promise.all([
      safeQuery(
        () =>
          prisma.task.findMany({
            where: {
              userId,
              status: { in: ['READY', 'IN_PROGRESS'] },
            },
            orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
            take: 5,
          }),
        [],
      ),
      safeQuery(
        () =>
          prisma.task.count({
            where: {
              userId,
              status: { in: ['BACKLOG', 'READY', 'IN_PROGRESS', 'REVIEW'] },
              dueDate: { lt: new Date() },
            },
          }),
        0,
      ),
      safeQuery(() => prisma.task.count({ where: { userId, status: 'BLOCKED' } }), 0),
      safeQuery(
        () =>
          prisma.timeBlock.findMany({
            where: {
              userId,
              startAt: {
                gte: new Date(`${todayStr}T00:00:00.000Z`),
                lte: new Date(`${todayStr}T23:59:59.999Z`),
              },
            },
          }),
        [],
      ),
    ]);

    // Group 3: Development, skills & evidence
    const [learningActivities, skillsCount, evidenceCount] = await Promise.all([
      safeQuery(
        () =>
          prisma.learningActivity.aggregate({
            where: {
              userId,
              date: { gte: new Date(Date.now() - 7 * 86400000) },
            },
            _sum: { minutes: true },
          }),
        { _sum: { minutes: 0 } },
      ),
      safeQuery(() => prisma.skill.count({ where: { userId, status: 'ACTIVE' } }), 0),
      safeQuery(
        () =>
          prisma.evidence.count({
            where: {
              userId,
              createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
            },
          }),
        0,
      ),
    ]);

    // Group 4: Opportunities & Reviews
    const [opportunitiesCount, followUpsCount, latestReview] = await Promise.all([
      safeQuery(
        () =>
          prisma.opportunity.count({
            where: {
              userId,
              status: { in: ['DISCOVERED', 'EVALUATING', 'PREPARING', 'APPLIED', 'IN_DISCUSSION', 'INTERVIEW', 'OFFERED', 'ACTIVE'] },
            },
          }),
        0,
      ),
      safeQuery(
        () =>
          prisma.opportunity.count({
            where: {
              userId,
              followUpDate: { lte: new Date(Date.now() + 7 * 86400000) },
              status: { notIn: ['COMPLETED', 'REJECTED', 'WITHDRAWN', 'ARCHIVED'] },
            },
          }),
        0,
      ),
      safeQuery(
        () =>
          prisma.weeklyReview.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
          }),
        null,
      ),
    ]);

    // Group 5: Graduation & Integrations
    const [graduationProjects, academicCoursesCount, connectedIntegrations, targetDateMemory] = await Promise.all([
      safeQuery(
        () =>
          prisma.project.findMany({
            where: {
              userId,
              slug: { in: ['individual-graduation-project', 'group-graduation-project'] },
            },
            select: {
              slug: true,
              name: true,
              milestones: {
                select: { status: true },
              },
            },
          }),
        [],
      ),
      safeQuery(
        () =>
          prisma.academicCourse.count({
            where: { userId, academicStatus: 'ENROLLED' },
          }),
        0,
      ),
      safeQuery(
        () =>
          prisma.integrationAccount.findMany({
            where: { userId, status: 'CONNECTED' },
            select: { provider: true, lastSyncAt: true },
          }),
        [],
      ),
      safeQuery(
        () =>
          prisma.userMemory.findFirst({
            where: { userId, key: 'graduation_target_date', archivedAt: null },
          }),
        null,
      ),
    ]);

    const dailyCap = userSettings?.dailyWorkCapacityMinutes || 480;
    const plannedMinutes = todayTimeBlocks.reduce((acc, tb) => {
      const duration = (tb.endAt.getTime() - tb.startAt.getTime()) / 60000;
      return acc + (duration > 0 ? duration : 0);
    }, 0);

    const utilizationPercentage = dailyCap > 0 ? Math.round((plannedMinutes / dailyCap) * 100) : null;
    const nextBest = todayTasks[0];

    const indProj = graduationProjects.find((p) => p.slug === 'individual-graduation-project');
    const grpProj = graduationProjects.find((p) => p.slug === 'group-graduation-project');

    const indTotal = indProj?.milestones.length || 0;
    const indReached = indProj?.milestones.filter((m) => m.status === MilestoneStatus.REACHED).length || 0;
    const indProgress = indTotal > 0 ? Math.round((indReached / indTotal) * 100) : 0;

    const grpTotal = grpProj?.milestones.length || 0;
    const grpReached = grpProj?.milestones.filter((m) => m.status === MilestoneStatus.REACHED).length || 0;
    const grpProgress = grpTotal > 0 ? Math.round((grpReached / grpTotal) * 100) : 0;

    const targetDate = targetDateMemory?.value || null;
    let daysRemaining: number | null = null;
    if (targetDate) {
      const parsedTarget = new Date(targetDate);
      if (!isNaN(parsedTarget.getTime())) {
        const diffMs = parsedTarget.getTime() - new Date().getTime();
        daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }
    }

    const latestSyncAt =
      connectedIntegrations
        .map((i) => i.lastSyncAt)
        .filter((d): d is Date => d !== null)
        .sort((a, b) => b.getTime() - a.getTime())[0]
        ?.toISOString() || null;

    // Resolve intelligent page context if passed
    let pageContextData: BoundedOperatingContext['pageContext'] = undefined;
    if (pageContextInput?.pageType) {
      let details: Record<string, unknown> = {};

      if (pageContextInput.pageType === 'projects' && (pageContextInput.entityId || pageContextInput.entityTitle)) {
        const proj = await prisma.project.findFirst({
          where: {
            userId,
            ...(pageContextInput.entityId
              ? { id: pageContextInput.entityId }
              : { name: { contains: pageContextInput.entityTitle, mode: 'insensitive' } }),
          },
          include: {
            milestones: { select: { id: true, name: true, status: true } },
            tasks: { where: { status: { not: 'DONE' } }, select: { id: true, title: true, priority: true } },
            evidence: { include: { evidence: { select: { id: true, title: true } } } },
          },
        });
        if (proj) {
          details = {
            id: proj.id,
            name: proj.name,
            status: proj.status,
            milestones: proj.milestones,
            pendingTasks: proj.tasks,
            evidenceCount: proj.evidence.length,
          };
        }
      } else if (pageContextInput.pageType === 'tasks' && (pageContextInput.entityId || pageContextInput.entityTitle)) {
        const t = await prisma.task.findFirst({
          where: {
            userId,
            ...(pageContextInput.entityId
              ? { id: pageContextInput.entityId }
              : { title: { contains: pageContextInput.entityTitle, mode: 'insensitive' } }),
          },
          include: {
            project: { select: { name: true } },
            blockingDependencies: { include: { blockingTask: { select: { title: true, status: true } } } },
          },
        });
        if (t) {
          details = {
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            project: t.project?.name,
            blockers: t.blockingDependencies.map((b) => b.blockingTask),
          };
        }
      } else if (pageContextInput.pageType === 'academics') {
        const courses = await prisma.academicCourse.findMany({
          where: { userId },
          select: { code: true, title: true, creditHours: true },
        });
        details = { enrolledCourses: courses };
      } else if (pageContextInput.pageType === 'learning') {
        const skills = await prisma.skill.findMany({
          where: { userId },
          select: { name: true, currentLevel: true, targetLevel: true },
        });
        details = { trackedSkills: skills };
      }

      pageContextData = {
        pageType: pageContextInput.pageType,
        entityId: pageContextInput.entityId,
        entityTitle: pageContextInput.entityTitle,
        details: Object.keys(details).length > 0 ? details : undefined,
      };
    }

    let summaryText = `Date: ${todayStr} | ASTU Graduation: ${daysRemaining ? `${daysRemaining} days` : 'Not set'} | Ind. Project: ${indProgress}% | Group Project: ${grpProgress}% | Enrolled Courses: ${academicCoursesCount} | Integrations: ${connectedIntegrations.length} active | Top Priority: ${nextBest ? nextBest.title : 'None'} | Overdue Tasks: ${overdueTasksCount} | Capacity: ${plannedMinutes}/${dailyCap}m (${utilizationPercentage || 0}%)`;

    if (pageContextData) {
      summaryText += ` | Active Page: ${pageContextData.pageType}${pageContextData.entityTitle ? ` (${pageContextData.entityTitle})` : ''}`;
    }

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
      graduation: {
        daysRemaining,
        targetDate,
        individualProjectProgress: indProgress,
        groupProjectProgress: grpProgress,
        academicCoursesCount,
      },
      integrations: {
        connectedCount: connectedIntegrations.length,
        connectedProviders: connectedIntegrations.map((i) => i.provider),
        lastSyncAt: latestSyncAt,
      },
      pageContext: pageContextData,
      summaryText,
    };
  }
}
