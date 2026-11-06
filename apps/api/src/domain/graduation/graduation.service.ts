import { prisma } from '../../lib/prisma.js';
import { TaskPriority, TaskStatus, WorkstreamStatus, ProjectStatus, MilestoneStatus } from '@prisma/client';
import type { GraduationOverviewDto } from '@kenenisa-os/shared';
import { NextBestActionService } from '../dashboard/next-best-action.service.js';

export class GraduationService {
  /**
   * Idempotently initializes the ASTU Graduation 2026/2027 workstream,
   * strategic goals, two graduation project workspaces, academic semester, and 7 courses.
   */
  public static async ensureGraduationWorkspace(userId: string): Promise<void> {
    // Fast path: if workstream and both graduation projects exist, skip redundant re-initialization
    const existingWorkstream = await prisma.workstream.findUnique({
      where: {
        userId_slug: {
          userId,
          slug: 'astu-graduation-2026-2027',
        },
      },
      select: { id: true },
    });

    if (existingWorkstream) {
      const existingProjectsCount = await prisma.project.count({
        where: {
          userId,
          slug: { in: ['individual-graduation-project', 'group-graduation-project'] },
        },
      });

      if (existingProjectsCount === 2) {
        return;
      }
    }

    // 1. Ensure Workstream
    const workstream = await prisma.workstream.upsert({
      where: {
        userId_slug: {
          userId,
          slug: 'astu-graduation-2026-2027',
        },
      },
      update: {
        name: 'ASTU Graduation 2026/2027',
        priorityWeight: 10,
      },
      create: {
        userId,
        name: 'ASTU Graduation 2026/2027',
        slug: 'astu-graduation-2026-2027',
        description:
          'Complete all academic requirements and graduation projects successfully while developing strong engineering capabilities and verifiable professional evidence.',
        status: WorkstreamStatus.ACTIVE,
        priorityWeight: 10,
        sortOrder: 0,
      },
    });

    // 2. Ensure 6 Strategic Graduation Goals
    const graduationGoalTitles = [
      {
        title: 'Complete all academic requirements',
        description: 'Fulfill all semester coursework, assignments, and examinations with strong technical understanding.',
        priority: TaskPriority.P0,
      },
      {
        title: 'Complete the individual graduation project',
        description: 'Deliver problem discovery, benchmarking, architecture, MVP, experiments, and final documentation for the individual project.',
        priority: TaskPriority.P0,
      },
      {
        title: 'Complete the group graduation project',
        description: 'Coordinate collaborative engineering, system integration, API contracts, and integrated demonstration.',
        priority: TaskPriority.P0,
      },
      {
        title: 'Complete the final research documentation and defense',
        description: 'Prepare rigorous technical documentation, thesis report, and successfully defend before the academic committee.',
        priority: TaskPriority.P0,
      },
      {
        title: 'Develop professional engineering capabilities',
        description: 'Master full-stack architecture, backend systems, databases, testing, and AI engineering practices.',
        priority: TaskPriority.P1,
      },
      {
        title: 'Build a verified professional portfolio',
        description: 'Gather verifiable evidence, GitHub commits, deployments, and technical articles documenting tangible achievements.',
        priority: TaskPriority.P1,
      },
    ];

    const goalsMap = new Map<string, string>();
    for (const g of graduationGoalTitles) {
      let existingGoal = await prisma.goal.findFirst({
        where: {
          userId,
          workstreamId: workstream.id,
          title: g.title,
        },
      });

      if (!existingGoal) {
        existingGoal = await prisma.goal.create({
          data: {
            userId,
            workstreamId: workstream.id,
            title: g.title,
            description: g.description,
            priority: g.priority,
          },
        });
      }
      goalsMap.set(g.title, existingGoal.id);
    }

    // 3. Ensure Project A: Individual Graduation Project
    const projectA = await prisma.project.upsert({
      where: {
        userId_slug: {
          userId,
          slug: 'individual-graduation-project',
        },
      },
      update: {},
      create: {
        userId,
        workstreamId: workstream.id,
        goalId: goalsMap.get('Complete the individual graduation project') || null,
        name: 'Individual Graduation Project: Problem Discovery',
        slug: 'individual-graduation-project',
        description:
          'Investigate a real problem, benchmark relevant international solutions, validate the Ethiopian context, develop a technically strong solution, conduct experiments, and evaluate measurable results.',
        status: ProjectStatus.PLANNED,
        priority: TaskPriority.P0,
      },
    });

    const individualMilestones = [
      'Problem discovery',
      'Global benchmarking',
      'ASTU and local problem investigation',
      'User interviews and validation',
      'Problem statement and research question',
      'Literature review',
      'Project proposal',
      'Requirements engineering',
      'System architecture and design',
      'MVP implementation',
      'Testing and experimentation',
      'Pilot deployment',
      'Evaluation and results',
      'Final documentation',
      'Defense preparation',
    ];

    for (let i = 0; i < individualMilestones.length; i++) {
      const name = individualMilestones[i];
      const existing = await prisma.milestone.findFirst({
        where: { projectId: projectA.id, name },
      });
      if (!existing) {
        await prisma.milestone.create({
          data: {
            userId,
            projectId: projectA.id,
            name,
            sortOrder: i + 1,
            status: MilestoneStatus.UPCOMING,
          },
        });
      }
    }

    // 4. Ensure Project B: Group Graduation Project
    const projectB = await prisma.project.upsert({
      where: {
        userId_slug: {
          userId,
          slug: 'group-graduation-project',
        },
      },
      update: {},
      create: {
        userId,
        workstreamId: workstream.id,
        goalId: goalsMap.get('Complete the group graduation project') || null,
        name: 'Group Graduation Project: Problem Discovery',
        slug: 'group-graduation-project',
        description:
          'Identify a real-world problem suitable for collaborative engineering, develop an integrated solution, divide responsibilities, and demonstrate measurable results.',
        status: ProjectStatus.PLANNED,
        priority: TaskPriority.P0,
      },
    });

    const groupMilestones = [
      'Problem discovery',
      'Global benchmarking',
      'ASTU and local problem investigation',
      'User interviews and validation',
      'Problem statement and research question',
      'Team roles and responsibilities',
      'Team architecture agreement',
      'API and integration contracts',
      'Shared repository and development workflow',
      'MVP implementation & component development',
      'Component integration',
      'System-level testing & experimentation',
      'Pilot deployment & user validation',
      'Group documentation',
      'Final integrated demonstration & defense preparation',
    ];

    for (let i = 0; i < groupMilestones.length; i++) {
      const name = groupMilestones[i];
      const existing = await prisma.milestone.findFirst({
        where: { projectId: projectB.id, name },
      });
      if (!existing) {
        await prisma.milestone.create({
          data: {
            userId,
            projectId: projectB.id,
            name,
            sortOrder: i + 1,
            status: MilestoneStatus.UPCOMING,
          },
        });
      }
    }

    // 5. Ensure Academic Semester & Courses
    const semester = await prisma.academicSemester.upsert({
      where: {
        userId_academicYear_semester: {
          userId,
          academicYear: '2026/2027',
          semester: 'First Semester',
        },
      },
      update: {
        level: 'Fifth Year',
      },
      create: {
        userId,
        academicYear: '2026/2027',
        semester: 'First Semester',
        level: 'Fifth Year',
        status: 'ACTIVE',
        notes: 'ASTU Fifth Year First Semester academic coursework & graduation projects.',
      },
    });

    const standardCourses = [
      {
        title: 'Entrepreneurship and Business Development',
        projectId: null,
      },
      {
        title: 'Senior Project I',
        projectId: projectA.id,
      },
      {
        title: 'Numerical Analysis I',
        projectId: null,
      },
      {
        title: 'Distributed Systems',
        projectId: null,
      },
      {
        title: 'Capstone Project',
        projectId: projectB.id,
      },
      {
        title: 'Introduction to Parallel and Distributed Processing',
        projectId: null,
      },
      {
        title: 'Advanced Network',
        projectId: null,
      },
    ];

    for (const c of standardCourses) {
      const existing = await prisma.academicCourse.findUnique({
        where: {
          semesterId_title: {
            semesterId: semester.id,
            title: c.title,
          },
        },
      });

      if (!existing) {
        await prisma.academicCourse.create({
          data: {
            userId,
            semesterId: semester.id,
            title: c.title,
            projectId: c.projectId,
            academicStatus: 'ENROLLED',
            currentUnderstanding: 'DEVELOPING',
          },
        });
      } else if (c.projectId && !existing.projectId) {
        await prisma.academicCourse.update({
          where: { id: existing.id },
          data: { projectId: c.projectId },
        });
      }
    }
  }

  /**
   * Retrieves complete, truth-grounded Graduation Command Center overview metrics.
   */
  public static async getGraduationOverview(userId: string): Promise<GraduationOverviewDto> {
    await this.ensureGraduationWorkspace(userId);

    // Fetch Core Graduation Entities in Parallel via Promise.allSettled
    const [semesterRes, targetDateRes, projectsRes, userSettingsRes] = await Promise.allSettled([
      prisma.academicSemester.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: {
          courses: {
            include: {
              project: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
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
          tasks: {
            where: { status: { not: TaskStatus.CANCELLED } },
          },
        },
      }),
      prisma.userSettings.findUnique({
        where: { userId },
      }),
    ]);

    const semester = semesterRes.status === 'fulfilled' ? semesterRes.value : null;
    const targetDateMemory = targetDateRes.status === 'fulfilled' ? targetDateRes.value : null;
    const graduationTargetDate = targetDateMemory?.value || null;
    const projects = projectsRes.status === 'fulfilled' ? projectsRes.value : [];
    const userSettings = userSettingsRes.status === 'fulfilled' ? userSettingsRes.value : null;

    const projectA = projects.find((p) => p.slug === 'individual-graduation-project');
    const projectB = projects.find((p) => p.slug === 'group-graduation-project');

    // Calculate Project A Milestones
    const projATotalMilestones = projectA?.milestones.length || 0;
    const projACompletedMilestones =
      projectA?.milestones.filter((m) => m.status === MilestoneStatus.REACHED).length || 0;
    const projAPercent =
      projATotalMilestones > 0 ? Math.round((projACompletedMilestones / projATotalMilestones) * 100) : 0;

    // Calculate Project B Milestones
    const projBTotalMilestones = projectB?.milestones.length || 0;
    const projBCompletedMilestones =
      projectB?.milestones.filter((m) => m.status === MilestoneStatus.REACHED).length || 0;
    const projBPercent =
      projBTotalMilestones > 0 ? Math.round((projBCompletedMilestones / projBTotalMilestones) * 100) : 0;

    // Academic Course Completion
    const totalCourses = semester?.courses.length || 0;
    const completedCourses =
      semester?.courses.filter((c) => c.academicStatus === 'COMPLETED').length || 0;
    const academicPercent =
      totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

    // Final Documentation Progress
    const docMilestonesA = projectA?.milestones.filter((m) =>
      m.name.toLowerCase().includes('documentation')
    ) || [];
    const docMilestonesB = projectB?.milestones.filter((m) =>
      m.name.toLowerCase().includes('documentation')
    ) || [];
    const totalDocMilestones = docMilestonesA.length + docMilestonesB.length;
    const completedDocMilestones =
      docMilestonesA.filter((m) => m.status === MilestoneStatus.REACHED).length +
      docMilestonesB.filter((m) => m.status === MilestoneStatus.REACHED).length;
    const docPercent =
      totalDocMilestones > 0 ? Math.round((completedDocMilestones / totalDocMilestones) * 100) : 0;

    // Defense Preparation Progress
    const defenseMilestonesA = projectA?.milestones.filter((m) =>
      m.name.toLowerCase().includes('defense')
    ) || [];
    const defenseMilestonesB = projectB?.milestones.filter((m) =>
      m.name.toLowerCase().includes('defense')
    ) || [];
    const totalDefenseMilestones = defenseMilestonesA.length + defenseMilestonesB.length;
    const completedDefenseMilestones =
      defenseMilestonesA.filter((m) => m.status === MilestoneStatus.REACHED).length +
      defenseMilestonesB.filter((m) => m.status === MilestoneStatus.REACHED).length;
    const defensePercent =
      totalDefenseMilestones > 0
        ? Math.round((completedDefenseMilestones / totalDefenseMilestones) * 100)
        : 0;

    // Fetch Upcoming Milestones across Graduation Projects
    const upcomingMilestones: GraduationOverviewDto['upcomingMilestones'] = [];
    projects.forEach((proj) => {
      proj.milestones
        .filter((m) => m.status === MilestoneStatus.UPCOMING || m.status === MilestoneStatus.IN_PROGRESS)
        .slice(0, 3)
        .forEach((m) => {
          upcomingMilestones.push({
            id: m.id,
            projectId: proj.id,
            projectName: proj.name,
            name: m.name,
            targetDate: m.targetDate ? m.targetDate.toISOString() : null,
            status: m.status as unknown as MilestoneStatus,
          });
        });
    });

    // Fetch Critical Attention Items (Overdue, Due Soon, Blocked Tasks)
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    const projectIds = projects.map((p) => p.id);
    const criticalTasks = await prisma.task.findMany({
      where: {
        userId,
        projectId: { in: projectIds },
        status: { in: [TaskStatus.READY, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED] },
      },
      include: {
        blockingDependencies: {
          include: {
            blockingTask: { select: { title: true } },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const overdueTasks: GraduationOverviewDto['criticalAttention']['overdueTasks'] = [];
    const tasksDueSoon: GraduationOverviewDto['criticalAttention']['tasksDueSoon'] = [];
    const blockedTasks: GraduationOverviewDto['criticalAttention']['blockedTasks'] = [];

    criticalTasks.forEach((t) => {
      if (t.status === TaskStatus.BLOCKED) {
        const blockerTitle = t.blockingDependencies?.[0]?.blockingTask?.title;
        blockedTasks.push({
          id: t.id,
          title: t.title,
          priority: t.priority as unknown as TaskPriority,
          blockedBy: blockerTitle || undefined,
        });
      }

      if (t.dueDate) {
        const d = new Date(t.dueDate);
        if (d < now) {
          overdueTasks.push({
            id: t.id,
            title: t.title,
            dueDate: t.dueDate.toISOString(),
            priority: t.priority as unknown as TaskPriority,
          });
        } else if (d <= threeDaysFromNow) {
          tasksDueSoon.push({
            id: t.id,
            title: t.title,
            dueDate: t.dueDate.toISOString(),
            priority: t.priority as unknown as TaskPriority,
          });
        }
      }
    });

    // Delayed Milestones
    const delayedMilestones: GraduationOverviewDto['criticalAttention']['delayedMilestones'] = [];
    projects.forEach((proj) => {
      proj.milestones
        .filter((m) => m.status === MilestoneStatus.DELAYED)
        .forEach((m) => {
          delayedMilestones.push({
            id: m.id,
            name: m.name,
            projectName: proj.name,
            targetDate: m.targetDate ? m.targetDate.toISOString() : null,
          });
        });
    });

    // Overdue Academic Course Obligations
    const overdueObligations: GraduationOverviewDto['overdueObligations'] = [];
    overdueTasks.forEach((ot) => {
      overdueObligations.push({
        id: ot.id,
        title: ot.title,
        source: 'TASK',
        dueDate: ot.dueDate,
      });
    });

    // Today's Execution Panel & Available Capacity
    const configuredCapacity = userSettings?.dailyWorkCapacityMinutes || 210;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayTasks = await prisma.task.findMany({
      where: {
        userId,
        OR: [
          { status: TaskStatus.IN_PROGRESS },
          { dueDate: { gte: startOfToday, lte: endOfToday } },
        ],
      },
    });

    const inProgressTask = todayTasks.find((t) => t.status === TaskStatus.IN_PROGRESS);
    const completedTodayCount = await prisma.task.count({
      where: {
        userId,
        status: TaskStatus.DONE,
        completedAt: { gte: startOfToday, lte: endOfToday },
      },
    });

    // NBA Task Calculation using NextBestActionService directly (no redundant dashboard re-computation)
    let nextBestActionData: GraduationOverviewDto['todayExecution']['nextBestAction'] = null;
    try {
      const nbaService = new NextBestActionService();
      const nbaResult = await nbaService.evaluateNextBestAction(userId, new Date());
      if (nbaResult?.recommendedTask) {
        nextBestActionData = {
          id: nbaResult.recommendedTask.id,
          title: nbaResult.recommendedTask.title,
          score: nbaResult.score,
          priority: nbaResult.recommendedTask.priority as unknown as TaskPriority,
        };
      }
    } catch {
      // Graceful fallback if NBA encounters cold cache
    }

    // Weekly completion stats
    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyCompleted = await prisma.task.count({
      where: {
        userId,
        status: TaskStatus.DONE,
        completedAt: { gte: startOfWeek },
      },
    });
    const weeklyTotal = await prisma.task.count({
      where: {
        userId,
        createdAt: { gte: startOfWeek },
      },
    });
    const weeklyRate = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

    return {
      university: 'Adama Science and Technology University (ASTU)',
      academicYear: semester?.academicYear || '2026/2027',
      level: semester?.level || 'Fifth Year',
      currentSemester: semester?.semester || 'First Semester',
      graduationTargetDate,
      overallAcademicStatus:
        academicPercent === 100 && projAPercent === 100 && projBPercent === 100
          ? 'Graduation Ready'
          : 'In Flight — Active Execution',
      activeProjects: [
        {
          id: projectA?.id || 'proj-a',
          name: projectA?.name || 'Individual Graduation Project',
          slug: projectA?.slug || 'individual-graduation-project',
          status: (projectA?.status || 'PLANNED') as unknown as ProjectStatus,
          totalMilestones: projATotalMilestones,
          completedMilestones: projACompletedMilestones,
          progressPercent: projAPercent,
        },
        {
          id: projectB?.id || 'proj-b',
          name: projectB?.name || 'Group Graduation Project',
          slug: projectB?.slug || 'group-graduation-project',
          status: (projectB?.status || 'PLANNED') as unknown as ProjectStatus,
          totalMilestones: projBTotalMilestones,
          completedMilestones: projBCompletedMilestones,
          progressPercent: projBPercent,
        },
      ],
      upcomingMilestones,
      overdueObligations,
      availableCapacityMinutes: configuredCapacity,
      weeklyCompletionStats: {
        completedTasks: weeklyCompleted,
        plannedTasks: weeklyTotal,
        completionRate: weeklyRate,
      },
      progressBreakdown: {
        academicRequirements: {
          completed: completedCourses,
          total: totalCourses,
          percent: academicPercent,
          basis: `${completedCourses} of ${totalCourses} enrolled courses marked completed in ${semester?.semester || 'First Semester'}`,
        },
        individualProject: {
          completedMilestones: projACompletedMilestones,
          totalMilestones: projATotalMilestones,
          percent: projAPercent,
          basis: `${projACompletedMilestones} of ${projATotalMilestones} structured milestones completed in Individual Project`,
        },
        groupProject: {
          completedMilestones: projBCompletedMilestones,
          totalMilestones: projBTotalMilestones,
          percent: projBPercent,
          basis: `${projBCompletedMilestones} of ${projBTotalMilestones} collaborative milestones completed in Group Project`,
        },
        finalDocumentation: {
          completed: completedDocMilestones,
          total: totalDocMilestones,
          percent: docPercent,
          basis: `${completedDocMilestones} of ${totalDocMilestones} documentation milestones verified across both projects`,
        },
        defensePreparation: {
          completed: completedDefenseMilestones,
          total: totalDefenseMilestones,
          percent: defensePercent,
          basis: `${completedDefenseMilestones} of ${totalDefenseMilestones} defense preparation checkpoints satisfied`,
        },
      },
      criticalAttention: {
        overdueTasks,
        tasksDueSoon,
        blockedTasks,
        delayedMilestones,
      },
      todayExecution: {
        scheduledTasks: todayTasks.map((t) => ({
          id: t.id,
          title: t.title,
          priority: t.priority as unknown as TaskPriority,
          status: t.status as unknown as TaskStatus,
          estimateMinutes: t.estimateMinutes,
        })),
        currentInProgressTask: inProgressTask
          ? {
              id: inProgressTask.id,
              title: inProgressTask.title,
              priority: inProgressTask.priority as unknown as TaskPriority,
              estimateMinutes: inProgressTask.estimateMinutes,
            }
          : null,
        availableCapacityMinutes: configuredCapacity,
        nextBestAction: nextBestActionData,
        completedWorkCount: completedTodayCount,
        remainingWorkCount: todayTasks.filter((t) => t.status !== TaskStatus.DONE).length,
      },
    };
  }

  /**
   * Updates graduation target date or settings.
   */
  public static async updateGraduationTargetDate(userId: string, targetDate: string | null): Promise<void> {
    if (!targetDate) {
      await prisma.userMemory.updateMany({
        where: { userId, key: 'graduation_target_date' },
        data: { archivedAt: new Date() },
      });
      return;
    }

    const existing = await prisma.userMemory.findFirst({
      where: { userId, key: 'graduation_target_date' },
    });

    if (existing) {
      await prisma.userMemory.update({
        where: { id: existing.id },
        data: { value: targetDate, archivedAt: null },
      });
    } else {
      await prisma.userMemory.create({
        data: {
          userId,
          key: 'graduation_target_date',
          value: targetDate,
          category: 'PREFERENCE',
          source: 'USER_CONFIRMED',
        },
      });
    }
  }
}
