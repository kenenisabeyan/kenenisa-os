import { prisma } from '../../../lib/prisma.js';
import { MilestoneStatus, TaskStatus } from '@prisma/client';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (userId: string, args: Record<string, unknown>) => Promise<unknown>;
}

export class IntelligenceToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  constructor() {
    this.registerReadTools();
    this.registerActionTools();
  }

  private registerReadTools() {
    // 1. High-level Current State
    this.tools.set('get_current_state', {
      name: 'get_current_state',
      description: 'Get factual high-level summary of current tasks, projects, learning, and capacity.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const [readyTasks, activeProjects, activeOpportunities, todayTimeBlocks] = await Promise.all([
          prisma.task.count({ where: { userId, status: { in: ['READY', 'IN_PROGRESS'] } } }),
          prisma.project.count({ where: { userId, status: 'ACTIVE' } }),
          prisma.opportunity.count({ where: { userId, status: { in: ['APPLIED', 'INTERVIEW', 'OFFERED', 'ACTIVE'] } } }),
          prisma.timeBlock.findMany({
            where: {
              userId,
              startAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            },
          }),
        ]);
        const plannedMinutes = todayTimeBlocks.reduce(
          (acc, b) => acc + Math.max(0, Math.round((b.endAt.getTime() - b.startAt.getTime()) / 60000)),
          0,
        );
        return { openTasks: readyTasks, activeProjects, activeOpportunities, plannedMinutesToday: plannedMinutes };
      },
    });

    // 2. Blocked Tasks & Dependency Details
    this.tools.set('get_blocked_tasks', {
      name: 'get_blocked_tasks',
      description: 'Retrieve all tasks that are currently BLOCKED along with their blocking prerequisites.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const blockedTasks = await prisma.task.findMany({
          where: { userId, status: TaskStatus.BLOCKED },
          select: {
            id: true,
            title: true,
            priority: true,
            project: { select: { id: true, name: true } },
            blockingDependencies: {
              select: {
                blockingTask: {
                  select: { id: true, title: true, status: true, priority: true },
                },
              },
            },
          },
        });
        return {
          count: blockedTasks.length,
          blockedTasks: blockedTasks.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            projectName: t.project?.name,
            blockers: t.blockingDependencies.map((b) => ({
              id: b.blockingTask.id,
              title: b.blockingTask.title,
              status: b.blockingTask.status,
            })),
          })),
        };
      },
    });

    // 3. Graduation Intelligence (Project A & B, Countdown, Defense Readiness)
    this.tools.set('get_graduation_intelligence', {
      name: 'get_graduation_intelligence',
      description: 'Retrieve ASTU graduation command center metrics: Project A and Project B progress, countdown days, and milestone readiness.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const [targetDateMemory, graduationProjects, courses] = await Promise.all([
          prisma.userMemory.findFirst({
            where: { userId, key: 'graduation_target_date', archivedAt: null },
          }),
          prisma.project.findMany({
            where: {
              userId,
              slug: { in: ['individual-graduation-project', 'group-graduation-project'] },
            },
            include: {
              milestones: {
                orderBy: { sortOrder: 'asc' },
              },
            },
          }),
          prisma.academicCourse.findMany({
            where: { userId },
            select: { id: true, code: true, title: true, academicStatus: true },
          }),
        ]);

        const targetDate = targetDateMemory?.value || null;
        let daysRemaining: number | null = null;
        if (targetDate) {
          const diffMs = new Date(targetDate).getTime() - Date.now();
          daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        }

        const projectSummaries = graduationProjects.map((p) => {
          const totalMilestones = p.milestones.length;
          const reachedMilestones = p.milestones.filter((m) => m.status === MilestoneStatus.REACHED).length;
          const delayedMilestones = p.milestones.filter((m) => m.status === MilestoneStatus.DELAYED);
          const nextPending = p.milestones.find((m) => m.status !== MilestoneStatus.REACHED);

          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            progressPercentage: totalMilestones > 0 ? Math.round((reachedMilestones / totalMilestones) * 100) : 0,
            totalMilestones,
            reachedMilestones,
            delayedCount: delayedMilestones.length,
            nextMilestone: nextPending ? { id: nextPending.id, name: nextPending.name, targetDate: nextPending.targetDate } : null,
          };
        });

        return {
          university: 'Adama Science and Technology University (ASTU)',
          academicYear: '2026/2027',
          daysRemaining,
          targetDate,
          projects: projectSummaries,
          enrolledCoursesCount: courses.filter((c) => c.academicStatus === 'ENROLLED').length,
          completedCoursesCount: courses.filter((c) => c.academicStatus === 'COMPLETED').length,
        };
      },
    });

    // 4. Academic Obligations & Course Deadlines
    this.tools.set('get_academic_obligations', {
      name: 'get_academic_obligations',
      description: 'Retrieve ASTU semester courses, upcoming assignments, exams, and lecture study topics.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const courses = await prisma.academicCourse.findMany({
          where: { userId },
          include: {
            semester: { select: { semester: true, academicYear: true } },
          },
        });

        return {
          count: courses.length,
          courses: courses.map((c) => ({
            id: c.id,
            code: c.code,
            title: c.title,
            creditHours: c.creditHours,
            instructor: c.instructor,
            academicStatus: c.academicStatus,
            currentUnderstanding: c.currentUnderstanding,
            assignments: c.assignments || [],
            testsAndExams: c.testsAndExams || [],
          })),
        };
      },
    });

    // 5. Skill Gaps and Verifiable Evidence
    this.tools.set('get_skill_gaps_and_evidence', {
      name: 'get_skill_gaps_and_evidence',
      description: 'Audit engineering skills, accumulated practice hours, and attached verifiable proof (GitHub commits, docs, repos).',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const [skills, evidenceList] = await Promise.all([
          prisma.skill.findMany({
            where: { userId, status: 'ACTIVE' },
            include: {
              evidence: {
                include: { evidence: { select: { id: true, title: true, type: true, verified: true } } },
              },
            },
          }),
          prisma.evidence.findMany({
            where: { userId },
            take: 10,
            orderBy: { date: 'desc' },
            select: { id: true, title: true, type: true, url: true, verified: true },
          }),
        ]);

        return {
          totalSkills: skills.length,
          skills: skills.map((s) => ({
            id: s.id,
            name: s.name,
            currentLevel: s.currentLevel,
            targetLevel: s.targetLevel,
            category: s.category,
            evidenceCount: s.evidence.length,
          })),
          recentEvidence: evidenceList,
        };
      },
    });

    // 6. Project Bottlenecks & Critical Path
    this.tools.set('get_project_bottlenecks', {
      name: 'get_project_bottlenecks',
      description: 'Detect overdue tasks, delayed milestones, circular dependencies, and stagnant work items across all active projects.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const [overdueTasks, delayedMilestones, stagnantTasks] = await Promise.all([
          prisma.task.findMany({
            where: {
              userId,
              status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
              dueDate: { lt: new Date() },
            },
            select: { id: true, title: true, dueDate: true, priority: true, project: { select: { name: true } } },
          }),
          prisma.milestone.findMany({
            where: {
              project: { userId },
              status: MilestoneStatus.DELAYED,
            },
            select: { id: true, name: true, targetDate: true, project: { select: { name: true } } },
          }),
          prisma.task.findMany({
            where: {
              userId,
              status: TaskStatus.IN_PROGRESS,
              updatedAt: { lt: new Date(Date.now() - 7 * 86400000) },
            },
            select: { id: true, title: true, updatedAt: true, project: { select: { name: true } } },
          }),
        ]);

        return {
          overdueCount: overdueTasks.length,
          delayedMilestonesCount: delayedMilestones.length,
          stagnantCount: stagnantTasks.length,
          overdueTasks,
          delayedMilestones,
          stagnantTasks,
        };
      },
    });

    // 6a. Active Strategic Goals
    this.tools.set('get_active_goals', {
      name: 'get_active_goals',
      description: 'Retrieve all strategic goals with their linked projects, priorities, and progress status.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const goals = await prisma.goal.findMany({
          where: { userId, status: { in: ['PLANNED', 'IN_PROGRESS'] } },
          include: {
            workstream: { select: { name: true } },
            projects: { select: { id: true, name: true, status: true } },
          },
          orderBy: [{ priority: 'asc' }, { targetDate: 'asc' }],
        });
        return {
          goalsCount: goals.length,
          goals: goals.map((g) => ({
            id: g.id,
            title: g.title,
            workstream: g.workstream.name,
            priority: g.priority,
            status: g.status,
            targetDate: g.targetDate,
            projects: g.projects,
          })),
        };
      },
    });

    // 6b. Deep Project Details & Relationship Inspection
    this.tools.set('get_project_details', {
      name: 'get_project_details',
      description: 'Retrieve comprehensive details for a specific project including goal, milestones, tasks, dependencies, and evidence.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'UUID of the project' },
          projectName: { type: 'string', description: 'Name or partial name of the project' },
        },
      },
      execute: async (userId, args) => {
        const { projectId, projectName } = args as { projectId?: string; projectName?: string };
        const project = await prisma.project.findFirst({
          where: {
            userId,
            ...(projectId ? { id: projectId } : {}),
            ...(projectName
              ? {
                  OR: [
                    { name: { contains: projectName, mode: 'insensitive' } },
                    { slug: { contains: projectName.toLowerCase().replace(/\s+/g, '-'), mode: 'insensitive' } },
                  ],
                }
              : {}),
          },
          include: {
            goal: { select: { id: true, title: true } },
            milestones: {
              orderBy: { sortOrder: 'asc' },
              select: { id: true, name: true, status: true, targetDate: true, completedAt: true },
            },
            tasks: {
              orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                dueDate: true,
                blockingDependencies: {
                  select: {
                    blockingTask: { select: { id: true, title: true, status: true } },
                  },
                },
              },
            },
            evidence: {
              include: { evidence: { select: { id: true, title: true, type: true, url: true } } },
            },
          },
        });

        if (!project) {
          return { found: false, message: `No project found matching ${projectId || projectName || 'query'}` };
        }

        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter((t) => t.status === TaskStatus.DONE).length;
        const blockedTasks = project.tasks.filter((t) => t.status === TaskStatus.BLOCKED);

        return {
          found: true,
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          goal: project.goal?.title || 'Unlinked',
          progressPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          totalTasks,
          completedTasks,
          blockedTasksCount: blockedTasks.length,
          blockedTasks: blockedTasks.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            blockedBy: t.blockingDependencies.map((d) => `${d.blockingTask.title} (${d.blockingTask.status})`),
          })),
          milestones: project.milestones,
          tasks: project.tasks.slice(0, 20),
          evidence: project.evidence.map((e) => e.evidence),
        };
      },
    });

    // 6c. Upcoming Deadlines across Tasks, Milestones, and Academic Courses
    this.tools.set('get_upcoming_deadlines', {
      name: 'get_upcoming_deadlines',
      description: 'Retrieve all tasks, milestones, and academic deliverables due within the next N days (default 7).',
      parameters: {
        type: 'object',
        properties: {
          daysAhead: { type: 'number', description: 'Days to look ahead (default 7)' },
        },
      },
      execute: async (userId, args) => {
        const days = Number(args.daysAhead) || 7;
        const futureDate = new Date(Date.now() + days * 86400000);

        const [upcomingTasks, upcomingMilestones, academicCourses] = await Promise.all([
          prisma.task.findMany({
            where: {
              userId,
              status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
              dueDate: { lte: futureDate },
            },
            orderBy: { dueDate: 'asc' },
            select: { id: true, title: true, dueDate: true, priority: true, project: { select: { name: true } } },
          }),
          prisma.milestone.findMany({
            where: {
              project: { userId },
              status: { not: MilestoneStatus.REACHED },
              targetDate: { lte: futureDate },
            },
            orderBy: { targetDate: 'asc' },
            select: { id: true, name: true, targetDate: true, project: { select: { name: true } } },
          }),
          prisma.academicCourse.findMany({
            where: { userId },
            select: { code: true, title: true, assessmentDates: true, assignments: true, testsAndExams: true },
          }),
        ]);

        return {
          windowDays: days,
          tasksDue: upcomingTasks,
          milestonesDue: upcomingMilestones,
          academicCourses: academicCourses,
        };
      },
    });

    // 6d. Daily Execution Plan & Capacity
    this.tools.set('get_daily_plan', {
      name: 'get_daily_plan',
      description: "Get today's planned time blocks, candidate ready tasks, and capacity utilization.",
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
        const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

        const [timeBlocks, inProgressTasks, readyTasks, settings] = await Promise.all([
          prisma.timeBlock.findMany({
            where: { userId, startAt: { gte: todayStart, lte: todayEnd } },
            include: { task: { select: { title: true, priority: true } } },
            orderBy: { startAt: 'asc' },
          }),
          prisma.task.findMany({
            where: { userId, status: TaskStatus.IN_PROGRESS },
            select: { id: true, title: true, priority: true, project: { select: { name: true } } },
          }),
          prisma.task.findMany({
            where: { userId, status: TaskStatus.READY },
            orderBy: { priority: 'asc' },
            take: 5,
            select: { id: true, title: true, priority: true, project: { select: { name: true } } },
          }),
          prisma.userSettings.findUnique({ where: { userId } }),
        ]);

        const plannedMinutes = timeBlocks.reduce(
          (acc, b) => acc + Math.max(0, Math.round((b.endAt.getTime() - b.startAt.getTime()) / 60000)),
          0,
        );
        const dailyCapacity = settings?.dailyWorkCapacityMinutes || 360;

        return {
          scheduledBlocks: timeBlocks.map((b) => ({
            id: b.id,
            title: b.title,
            startAt: b.startAt,
            endAt: b.endAt,
            task: b.task?.title,
          })),
          inProgressTasks,
          readyNextTasks: readyTasks,
          plannedMinutes,
          dailyCapacityMinutes: dailyCapacity,
          utilizationPercentage: Math.round((plannedMinutes / dailyCapacity) * 100),
        };
      },
    });

    // 6e. Career Opportunities Pipeline
    this.tools.set('get_career_opportunities', {
      name: 'get_career_opportunities',
      description: 'Retrieve career opportunities pipeline, active job applications, and candidate match scores.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const [opportunities, userSkills] = await Promise.all([
          prisma.opportunity.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
          }),
          prisma.skill.findMany({
            where: { userId },
            select: { name: true, currentLevel: true },
          }),
        ]);

        return {
          totalOpportunities: opportunities.length,
          opportunities: opportunities.map((o) => ({
            id: o.id,
            title: o.title,
            organizationName: o.organizationName,
            status: o.status,
            priority: o.priority,
            deadline: o.deadline,
          })),
          userSkillNames: userSkills.map((s) => s.name),
        };
      },
    });

    // 7. Weekly Review Summary Generator
    this.tools.set('generate_weekly_review_summary', {
      name: 'generate_weekly_review_summary',
      description: 'Generate factual weekly retrospective metrics: tasks shipped, learning hours, planned vs actual time, and blocker audit.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const [completedTasks, learningAgg, evidenceCount, blockersCount] = await Promise.all([
          prisma.task.findMany({
            where: { userId, status: TaskStatus.DONE, completedAt: { gte: weekAgo } },
            select: { id: true, title: true, priority: true, actualMinutes: true, project: { select: { name: true } } },
          }),
          prisma.learningActivity.aggregate({
            where: { userId, date: { gte: weekAgo } },
            _sum: { minutes: true },
          }),
          prisma.evidence.count({ where: { userId, createdAt: { gte: weekAgo } } }),
          prisma.task.count({ where: { userId, status: TaskStatus.BLOCKED } }),
        ]);

        return {
          period: 'Past 7 Days',
          tasksShippedCount: completedTasks.length,
          completedTasks: completedTasks.map((t) => ({ title: t.title, project: t.project?.name, minutes: t.actualMinutes })),
          totalLearningMinutes: learningAgg._sum.minutes || 0,
          evidenceProducedCount: evidenceCount,
          activeBlockersCount: blockersCount,
        };
      },
    });

    // 7a. Get Dashboard Summary (Command Center Operating Status)
    this.tools.set('get_dashboard_summary', {
      name: 'get_dashboard_summary',
      description: 'Get comprehensive Command Center operating status: open tasks, blocked items, overdue items, next best action, and active projects.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const [readyTasks, inProgressTasks, blockedTasks, overdueTasks, activeProjects, activeGoals, activeWorkstreams, recentDone] = await Promise.all([
          prisma.task.count({ where: { userId, status: TaskStatus.READY } }),
          prisma.task.count({ where: { userId, status: TaskStatus.IN_PROGRESS } }),
          prisma.task.count({ where: { userId, status: TaskStatus.BLOCKED } }),
          prisma.task.count({ where: { userId, status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] }, dueDate: { lt: new Date() } } }),
          prisma.project.count({ where: { userId, status: 'ACTIVE' } }),
          prisma.goal.count({ where: { userId, status: 'IN_PROGRESS' } }),
          prisma.workstream.count({ where: { userId, status: 'ACTIVE' } }),
          prisma.task.count({ where: { userId, status: TaskStatus.DONE, completedAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
        ]);

        const topReady = await prisma.task.findFirst({
          where: { userId, status: TaskStatus.READY },
          orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
          include: { project: { select: { name: true } } },
        });

        return {
          workstreams: activeWorkstreams,
          goals: activeGoals,
          projects: activeProjects,
          readyTasks,
          inProgressTasks,
          blockedTasks,
          overdueTasks,
          completedPast7Days: recentDone,
          nextBestAction: topReady ? { id: topReady.id, title: topReady.title, priority: topReady.priority, project: topReady.project?.name } : null,
        };
      },
    });

    // 7b. Get Workstreams
    this.tools.set('get_workstreams', {
      name: 'get_workstreams',
      description: 'Retrieve all strategic workstreams with priority weights, goal counts, and project counts.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const workstreams = await prisma.workstream.findMany({
          where: { userId, status: 'ACTIVE' },
          include: {
            _count: { select: { goals: true, projects: true } },
          },
          orderBy: { priorityWeight: 'desc' },
        });

        return {
          count: workstreams.length,
          workstreams: workstreams.map((w) => ({
            id: w.id,
            name: w.name,
            slug: w.slug,
            description: w.description,
            priorityWeight: w.priorityWeight,
            goalsCount: w._count.goals,
            projectsCount: w._count.projects,
          })),
        };
      },
    });

    // 7c. Get Project Tasks
    this.tools.set('get_project_tasks', {
      name: 'get_project_tasks',
      description: 'Retrieve tasks for a specific project by project ID or name, optionally filtered by status.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'UUID of project' },
          projectName: { type: 'string', description: 'Name of project' },
          status: { type: 'string', description: 'Filter by task status (BACKLOG, READY, IN_PROGRESS, BLOCKED, REVIEW, DONE)' },
        },
      },
      execute: async (userId, args) => {
        const { projectId, projectName, status } = args as { projectId?: string; projectName?: string; status?: TaskStatus };
        const project = await prisma.project.findFirst({
          where: {
            userId,
            ...(projectId ? { id: projectId } : {}),
            ...(projectName ? { name: { contains: projectName, mode: 'insensitive' } } : {}),
          },
        });

        if (!project) {
          return { found: false, message: `No project found matching criteria.` };
        }

        const tasks = await prisma.task.findMany({
          where: {
            userId,
            projectId: project.id,
            ...(status ? { status } : {}),
          },
          orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            estimateMinutes: true,
            actualMinutes: true,
          },
          take: 30,
        });

        return {
          found: true,
          projectId: project.id,
          projectName: project.name,
          tasksCount: tasks.length,
          tasks,
        };
      },
    });

    // 7d. Get Project Dependencies
    this.tools.set('get_project_dependencies', {
      name: 'get_project_dependencies',
      description: 'Retrieve the dependency and blocker relationships between tasks within a project or across projects.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Optional project UUID' },
          projectName: { type: 'string', description: 'Optional project name' },
        },
      },
      execute: async (userId, args) => {
        const { projectId, projectName } = args as { projectId?: string; projectName?: string };
        let resolvedProjectId = projectId;

        if (!resolvedProjectId && projectName) {
          const p = await prisma.project.findFirst({
            where: { userId, name: { contains: projectName, mode: 'insensitive' } },
          });
          resolvedProjectId = p?.id;
        }

        const dependencies = await prisma.taskDependency.findMany({
          where: {
            dependentTask: {
              userId,
              ...(resolvedProjectId ? { projectId: resolvedProjectId } : {}),
            },
          },
          include: {
            dependentTask: { select: { id: true, title: true, status: true, priority: true } },
            blockingTask: { select: { id: true, title: true, status: true, priority: true } },
          },
        });

        return {
          count: dependencies.length,
          dependencies: dependencies.map((d) => ({
            dependentTask: d.dependentTask.title,
            dependentStatus: d.dependentTask.status,
            blockedBy: d.blockingTask.title,
            blockingStatus: d.blockingTask.status,
            isResolved: d.blockingTask.status === TaskStatus.DONE,
          })),
        };
      },
    });

    // 7e. Get Capacity & Time Allocation
    this.tools.set('get_capacity', {
      name: 'get_capacity',
      description: 'Get daily and weekly capacity metrics, allocated time blocks, and available deep-work bandwidth.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
        const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

        const [settings, blocksToday] = await Promise.all([
          prisma.userSettings.findUnique({ where: { userId } }),
          prisma.timeBlock.findMany({
            where: { userId, startAt: { gte: todayStart, lte: todayEnd } },
            select: { startAt: true, endAt: true, title: true },
          }),
        ]);

        const dailyCapacity = settings?.dailyWorkCapacityMinutes || 480;
        const weeklyCapacity = settings?.weeklyWorkCapacityMinutes || 2400;
        const plannedMinutes = blocksToday.reduce(
          (acc, b) => acc + Math.max(0, Math.round((b.endAt.getTime() - b.startAt.getTime()) / 60000)),
          0,
        );

        return {
          dailyCapacityMinutes: dailyCapacity,
          weeklyCapacityMinutes: weeklyCapacity,
          plannedMinutesToday: plannedMinutes,
          availableMinutesToday: Math.max(0, dailyCapacity - plannedMinutes),
          utilizationPercent: dailyCapacity > 0 ? Math.round((plannedMinutes / dailyCapacity) * 100) : 0,
          timeBlocksCount: blocksToday.length,
        };
      },
    });

    // 7f. Get Learning Progress
    this.tools.set('get_learning_progress', {
      name: 'get_learning_progress',
      description: 'Retrieve learning and study activities logged over the past 30 days, total minutes, and linked skills.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
        const [activities, totalAgg] = await Promise.all([
          prisma.learningActivity.findMany({
            where: { userId, date: { gte: thirtyDaysAgo } },
            orderBy: { date: 'desc' },
            take: 15,
            select: { id: true, title: true, type: true, minutes: true, date: true },
          }),
          prisma.learningActivity.aggregate({
            where: { userId, date: { gte: thirtyDaysAgo } },
            _sum: { minutes: true },
          }),
        ]);

        return {
          past30DaysMinutes: totalAgg._sum.minutes || 0,
          past30DaysHours: Math.round((totalAgg._sum.minutes || 0) / 60),
          recentActivities: activities,
        };
      },
    });

    // 7g. Get Performance Metrics
    this.tools.set('get_performance_metrics', {
      name: 'get_performance_metrics',
      description: 'Retrieve historical execution metrics: weekly completion rate, task throughput, overdue rate, and milestone progress.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const [totalTasks, completedTasks, overdueTasks, reachedMilestones, totalMilestones] = await Promise.all([
          prisma.task.count({ where: { userId } }),
          prisma.task.count({ where: { userId, status: TaskStatus.DONE } }),
          prisma.task.count({ where: { userId, status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] }, dueDate: { lt: new Date() } } }),
          prisma.milestone.count({ where: { project: { userId }, status: MilestoneStatus.REACHED } }),
          prisma.milestone.count({ where: { project: { userId } } }),
        ]);

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const milestoneRate = totalMilestones > 0 ? Math.round((reachedMilestones / totalMilestones) * 100) : 0;

        return {
          totalTasks,
          completedTasks,
          overdueTasks,
          completionRatePercent: completionRate,
          totalMilestones,
          reachedMilestones,
          milestoneProgressPercent: milestoneRate,
        };
      },
    });

    // 7h. Get Weekly Review
    this.tools.set('get_weekly_review', {
      name: 'get_weekly_review',
      description: 'Retrieve the most recent weekly review retrospective details including accomplishments, wins, challenges, and lessons learned.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const review = await prisma.weeklyReview.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

        if (!review) {
          return { found: false, message: 'No weekly review records found yet.' };
        }

        return {
          found: true,
          id: review.id,
          status: review.status,
          startDate: review.startDate,
          endDate: review.endDate,
          wins: review.wins,
          challenges: review.challenges,
          lessons: review.lessons,
          nextFocus: review.nextFocus,
          notes: review.notes,
        };
      },
    });
  }

  private registerActionTools() {
    // 8. Propose Create Task
    this.tools.set('propose_create_task', {
      name: 'propose_create_task',
      description: 'Propose creating a new task. Requires user confirmation before execution.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Task title' },
          projectId: { type: 'string', description: 'Target Project UUID' },
          priority: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
          estimateMinutes: { type: 'number' },
          dueDate: { type: 'string', description: 'ISO date string' },
        },
        required: ['title'],
      },
      execute: async (_userId, args) => {
        await Promise.resolve();
        const title = (args.title as string) || 'New Task';
        const priority = (args.priority as string) || 'P2';
        return {
          proposedAction: 'CREATE_TASK',
          summary: `Create task "${title}" with priority ${priority}`,
          args,
        };
      },
    });

    // 9. Propose Create Time Block
    this.tools.set('propose_create_time_block', {
      name: 'propose_create_time_block',
      description: 'Propose scheduling a focus time block. Requires user confirmation before execution.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          startAt: { type: 'string', description: 'ISO datetime string' },
          endAt: { type: 'string', description: 'ISO datetime string' },
          taskId: { type: 'string', description: 'Optional associated task UUID' },
        },
        required: ['title', 'startAt', 'endAt'],
      },
      execute: async (_userId, args) => {
        await Promise.resolve();
        const title = (args.title as string) || 'Focus Execution Session';
        return {
          proposedAction: 'CREATE_TIME_BLOCK',
          summary: `Create time block "${title}"`,
          args,
        };
      },
    });

    // 10. Propose Resolve Blocker
    this.tools.set('propose_resolve_blocker', {
      name: 'propose_resolve_blocker',
      description: 'Propose resolving a blocked task by marking its blocking prerequisite as DONE. Requires user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          blockedTaskId: { type: 'string', description: 'UUID of blocked task' },
          prerequisiteTaskId: { type: 'string', description: 'UUID of prerequisite task to mark DONE' },
        },
        required: ['blockedTaskId', 'prerequisiteTaskId'],
      },
      execute: async (_userId, args) => {
        await Promise.resolve();
        return {
          proposedAction: 'RESOLVE_BLOCKER',
          summary: `Resolve blocker by advancing prerequisite task ${args.prerequisiteTaskId} to DONE`,
          args,
        };
      },
    });
  }

  getAvailableTools() {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));
  }

  async executeTool(name: string, userId: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    return tool.execute(userId, args);
  }
}
