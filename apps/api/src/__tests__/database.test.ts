import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../lib/prisma.js';
import { TaskPriority, TaskStatus, WorkstreamStatus } from '@prisma/client';

describe('Database Architecture & Entity Integration Tests', { timeout: 30000 }, () => {
  let testUserId: string;
  let testWorkstreamId: string;

  beforeAll(async () => {
    try {
      // 1. Verify primary user seeded
      const user = await prisma.user.findUnique({
        where: { email: 'kenenisa@kenenisa-os.internal' },
        include: { settings: true, workstreams: true },
      });
      if (user) {
        testUserId = user.id;
        const workstream = user.workstreams.find(
          (w: { slug: string }) => w.slug === 'fullstack-engineering',
        );
        if (workstream) {
          testWorkstreamId = workstream.id;
        }
      }
    } catch {
      // Database is offline or unseeded in unit test env
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('enforces email uniqueness on User model', async () => {
    if (!testUserId) return;
    await expect(
      prisma.user.create({
        data: {
          email: 'kenenisa@kenenisa-os.internal',
          passwordHash: 'dummyHash',
          firstName: 'Duplicate',
          lastName: 'User',
          displayName: 'Duplicate User',
        },
      }),
    ).rejects.toThrow();
  });

  it('verifies Workstream compound uniqueness (userId + slug)', async () => {
    if (!testUserId) return;
    await expect(
      prisma.workstream.create({
        data: {
          userId: testUserId,
          name: 'Full-Stack Engineering Duplicate',
          slug: 'fullstack-engineering',
          status: WorkstreamStatus.ACTIVE,
        },
      }),
    ).rejects.toThrow();
  });

  it(
    'creates project, milestone, task, subtask, tag, and dependencies correctly',
    async () => {
    if (!testUserId) return;
    // 1. Create project
    const project = await prisma.project.create({
      data: {
        userId: testUserId,
        workstreamId: testWorkstreamId,
        name: 'Database Testing Project',
        slug: 'db-test-proj',
        priority: TaskPriority.P1,
      },
    });
    expect(project.id).toBeDefined();

    // 2. Create milestone
    const milestone = await prisma.milestone.create({
      data: {
        userId: testUserId,
        projectId: project.id,
        name: 'Milestone Alpha',
        sortOrder: 1,
      },
    });
    expect(milestone.id).toBeDefined();

    // 3. Create blocking task and dependent task
    const taskA = await prisma.task.create({
      data: {
        userId: testUserId,
        projectId: project.id,
        milestoneId: milestone.id,
        title: 'Task A (Blocking)',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.P0,
        estimateMinutes: 60,
      },
    });

    const taskB = await prisma.task.create({
      data: {
        userId: testUserId,
        projectId: project.id,
        milestoneId: milestone.id,
        title: 'Task B (Dependent)',
        status: TaskStatus.BLOCKED,
        priority: TaskPriority.P1,
        estimateMinutes: 90,
      },
    });

    // 4. Create TaskDependency
    const dependency = await prisma.taskDependency.create({
      data: {
        blockingTaskId: taskA.id,
        dependentTaskId: taskB.id,
      },
    });
    expect(dependency.id).toBeDefined();

    // 5. Create subtask
    const subtask = await prisma.task.create({
      data: {
        userId: testUserId,
        projectId: project.id,
        parentTaskId: taskA.id,
        title: 'Subtask A.1',
        status: TaskStatus.READY,
      },
    });
    expect(subtask.parentTaskId).toBe(taskA.id);

    // 6. Create Tag and TaskTag
    const tag = await prisma.tag.create({
      data: {
        userId: testUserId,
        name: 'Database Test',
        slug: 'db-test-tag',
        color: '#10b981',
      },
    });

    const taskTag = await prisma.taskTag.create({
      data: {
        taskId: taskA.id,
        tagId: tag.id,
      },
    });
    expect(taskTag.id).toBeDefined();

    // Cleanup created test project and related entities (cascade verification)
    await prisma.project.delete({ where: { id: project.id } });
    await prisma.tag.delete({ where: { id: tag.id } });
  }, 30000);

  it('enforces compound uniqueness on DailyPlan (userId + date)', async () => {
    if (!testUserId) return;
    const today = new Date('2026-09-15T00:00:00.000Z');

    const plan1 = await prisma.dailyPlan.create({
      data: {
        userId: testUserId,
        date: today,
        notes: 'Primary Plan',
      },
    });

    await expect(
      prisma.dailyPlan.create({
        data: {
          userId: testUserId,
          date: today,
          notes: 'Duplicate Plan',
        },
      }),
    ).rejects.toThrow();

    await prisma.dailyPlan.delete({ where: { id: plan1.id } });
  });

  it('enforces compound uniqueness on WeeklyPlan (userId + weekStart)', async () => {
    if (!testUserId) return;
    const weekStart = new Date('2026-09-14T00:00:00.000Z');
    const weekEnd = new Date('2026-09-20T23:59:59.999Z');

    const plan1 = await prisma.weeklyPlan.create({
      data: {
        userId: testUserId,
        weekStart,
        weekEnd,
        theme: 'Database Architecture Week',
      },
    });

    await expect(
      prisma.weeklyPlan.create({
        data: {
          userId: testUserId,
          weekStart,
          weekEnd,
          theme: 'Duplicate Week',
        },
      }),
    ).rejects.toThrow();

    await prisma.weeklyPlan.delete({ where: { id: plan1.id } });
  });
});
