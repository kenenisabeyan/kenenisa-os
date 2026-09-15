import { prisma } from '../../lib/prisma.js';
import { TaskStatus, TaskPriority } from '@prisma/client';
import {
  DailyPlanDto,
  CreateDailyPlanInput,
  UpdateDailyPlanInput,
  DailyPlanningResponseDto,
  TaskDto,
} from '@kenenisa-os/shared';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import { PlanningDateService } from './planning-date.service.js';
import { CapacityService } from './capacity.service.js';
import { TimeBlockService } from './time-block.service.js';

export interface DailyPlanPrismaPayload {
  id: string;
  userId: string;
  date: Date;
  mustWinTaskId: string | null;
  notes: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  mustWinTask?: {
    id: string;
    userId: string;
    projectId: string;
    milestoneId: string | null;
    parentTaskId: string | null;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    estimateMinutes: number;
    actualMinutes: number;
    startDate: Date | null;
    dueDate: Date | null;
    completedAt: Date | null;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    project?: { id: string; name: string; slug: string } | null;
  } | null;
}

export class DailyPlanService {
  private dateService = new PlanningDateService();
  private capacityService = new CapacityService();
  private timeBlockService = new TimeBlockService();

  private formatDailyPlan(plan: DailyPlanPrismaPayload): DailyPlanDto {
    let mustWinTask: TaskDto | null = null;
    if (plan.mustWinTask) {
      mustWinTask = {
        id: plan.mustWinTask.id,
        userId: plan.mustWinTask.userId,
        projectId: plan.mustWinTask.projectId,
        milestoneId: plan.mustWinTask.milestoneId,
        parentTaskId: plan.mustWinTask.parentTaskId,
        title: plan.mustWinTask.title,
        description: plan.mustWinTask.description,
        status: plan.mustWinTask.status,
        priority: plan.mustWinTask.priority,
        estimateMinutes: plan.mustWinTask.estimateMinutes,
        actualMinutes: plan.mustWinTask.actualMinutes,
        startDate: plan.mustWinTask.startDate ? plan.mustWinTask.startDate.toISOString() : null,
        dueDate: plan.mustWinTask.dueDate ? plan.mustWinTask.dueDate.toISOString() : null,
        completedAt: plan.mustWinTask.completedAt ? plan.mustWinTask.completedAt.toISOString() : null,
        sortOrder: plan.mustWinTask.sortOrder,
        createdAt: plan.mustWinTask.createdAt.toISOString(),
        updatedAt: plan.mustWinTask.updatedAt.toISOString(),
        project: plan.mustWinTask.project
          ? { id: plan.mustWinTask.project.id, name: plan.mustWinTask.project.name, slug: plan.mustWinTask.project.slug }
          : undefined,
      };
    }

    return {
      id: plan.id,
      userId: plan.userId,
      date: plan.date.toISOString().split('T')[0],
      mustWinTaskId: plan.mustWinTaskId ?? null,
      notes: plan.notes ?? null,
      status: plan.status,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
      mustWinTask,
    };
  }

  async getDailyPlanningOverview(userId: string, dateStr?: string): Promise<DailyPlanningResponseDto> {
    const { dateStr: formattedDate, startUtc, endUtc } = this.dateService.getDailyBounds(dateStr);

    const [dailyPlanRaw, timeBlocks, capacity, unscheduledTasksRaw] = await Promise.all([
      prisma.dailyPlan.findFirst({
        where: { userId, date: startUtc },
        include: {
          mustWinTask: {
            include: {
              project: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      }),
      this.timeBlockService.getTimeBlocks(userId, { startUtc, endUtc }),
      this.capacityService.getDailyCapacity(userId, formattedDate),
      prisma.task.findMany({
        where: {
          userId,
          status: { in: [TaskStatus.READY, TaskStatus.IN_PROGRESS] },
          timeBlocks: {
            none: {
              startAt: { gte: startUtc, lte: endUtc },
            },
          },
        },
        include: {
          project: { select: { id: true, name: true, slug: true } },
          blockingDependencies: {
            include: {
              blockingTask: { select: { id: true, status: true } },
            },
          },
          _count: { select: { subtasks: true, blockingDependencies: true, dependentDependencies: true } },
        },
        orderBy: { priority: 'asc' },
        take: 15,
      }),
    ]);

    // Filter executable unscheduled tasks (no active blockers)
    const executableUnscheduled = unscheduledTasksRaw.filter((t) => {
      const activeBlockers = t.blockingDependencies.filter((dep) =>
        dep.blockingTask && dep.blockingTask.status !== TaskStatus.DONE && dep.blockingTask.status !== TaskStatus.CANCELLED,
      );
      return activeBlockers.length === 0;
    });

    const formatTask = (t: typeof unscheduledTasksRaw[number]): TaskDto => ({
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
      project: t.project ? { id: t.project.id, name: t.project.name, slug: t.project.slug } : undefined,
      _count: t._count,
    });

    const plan = dailyPlanRaw ? this.formatDailyPlan(dailyPlanRaw) : null;

    return {
      date: formattedDate,
      plan,
      mustWinTask: plan?.mustWinTask || null,
      timeBlocks,
      capacity,
      conflicts: [],
      unscheduledReadyTasks: executableUnscheduled.map(formatTask),
    };
  }

  async createDailyPlan(userId: string, input: CreateDailyPlanInput): Promise<DailyPlanDto> {
    const { startUtc } = this.dateService.getDailyBounds(input.date);

    const existing = await prisma.dailyPlan.findFirst({
      where: { userId, date: startUtc },
    });

    if (existing) {
      throw new BadRequestError(`A Daily Plan already exists for date ${input.date}`);
    }

    if (input.mustWinTaskId) {
      const task = await prisma.task.findFirst({
        where: { id: input.mustWinTaskId, userId },
      });

      if (!task) {
        throw new NotFoundError('Selected must-win task not found or does not belong to owner');
      }

      if (task.status === TaskStatus.CANCELLED) {
        throw new BadRequestError('Cannot select a CANCELLED task as must-win task');
      }
    }

    const created = await prisma.dailyPlan.create({
      data: {
        userId,
        date: startUtc,
        mustWinTaskId: input.mustWinTaskId || null,
        notes: input.notes || null,
        status: input.status || 'active',
      },
      include: {
        mustWinTask: {
          include: {
            project: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DAILY_PLAN_CREATED',
        entityType: 'DAILY_PLAN',
        entityId: created.id,
        metadata: { date: input.date, mustWinTaskId: input.mustWinTaskId },
      },
    });

    return this.formatDailyPlan(created);
  }

  async updateDailyPlan(userId: string, dateStr: string, input: UpdateDailyPlanInput): Promise<DailyPlanDto> {
    const { startUtc } = this.dateService.getDailyBounds(dateStr);

    const existing = await prisma.dailyPlan.findFirst({
      where: { userId, date: startUtc },
    });

    if (!existing) {
      throw new NotFoundError(`Daily plan for date ${dateStr} not found`);
    }

    if (input.mustWinTaskId) {
      const task = await prisma.task.findFirst({
        where: { id: input.mustWinTaskId, userId },
      });

      if (!task) {
        throw new NotFoundError('Selected must-win task not found or does not belong to owner');
      }

      if (task.status === TaskStatus.CANCELLED) {
        throw new BadRequestError('Cannot select a CANCELLED task as must-win task');
      }
    }

    const updated = await prisma.dailyPlan.update({
      where: { id: existing.id },
      data: {
        mustWinTaskId: input.mustWinTaskId !== undefined ? input.mustWinTaskId : existing.mustWinTaskId,
        notes: input.notes !== undefined ? input.notes : existing.notes,
        status: input.status !== undefined ? input.status : existing.status,
      },
      include: {
        mustWinTask: {
          include: {
            project: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DAILY_PLAN_UPDATED',
        entityType: 'DAILY_PLAN',
        entityId: updated.id,
        metadata: { date: dateStr, mustWinTaskId: updated.mustWinTaskId },
      },
    });

    return this.formatDailyPlan(updated);
  }
}
