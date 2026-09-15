import { prisma } from '../../lib/prisma.js';
import { TaskStatus } from '@prisma/client';
import {
  WeeklyPlanDto,
  CreateWeeklyPlanInput,
  UpdateWeeklyPlanInput,
  WeeklyPlanningResponseDto,
  TaskDto,
} from '@kenenisa-os/shared';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import { PlanningDateService } from './planning-date.service.js';
import { CapacityService } from './capacity.service.js';

export interface WeeklyPlanPrismaPayload {
  id: string;
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  theme: string | null;
  notes: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class WeeklyPlanService {
  private dateService = new PlanningDateService();
  private capacityService = new CapacityService();

  private formatWeeklyPlan(plan: WeeklyPlanPrismaPayload): WeeklyPlanDto {
    return {
      id: plan.id,
      userId: plan.userId,
      weekStart: plan.weekStart.toISOString().split('T')[0],
      weekEnd: plan.weekEnd.toISOString().split('T')[0],
      theme: plan.theme,
      notes: plan.notes,
      status: plan.status as WeeklyPlanDto['status'],
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }

  async getWeeklyPlanningOverview(userId: string, weekStartStr?: string): Promise<WeeklyPlanningResponseDto> {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { weekStartsOn: true },
    });
    const weekStartsOn = userSettings?.weekStartsOn ?? 1;

    const { weekStartStr: startStr, weekEndStr: endStr, startUtc, endUtc } =
      this.dateService.getWeeklyBounds(weekStartStr, weekStartsOn);

    const [weeklyPlanRaw, capacity, dailyPlansRaw, unscheduledTasksRaw] = await Promise.all([
      prisma.weeklyPlan.findFirst({
        where: { userId, weekStart: startUtc },
      }),
      this.capacityService.getWeeklyCapacity(userId, startStr),
      prisma.dailyPlan.findMany({
        where: {
          userId,
          date: { gte: startUtc, lte: endUtc },
        },
        include: {
          mustWinTask: { select: { id: true, title: true, priority: true } },
        },
        orderBy: { date: 'asc' },
      }),
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
          _count: { select: { subtasks: true, blockingDependencies: true, dependentDependencies: true } },
        },
        orderBy: { priority: 'asc' },
        take: 20,
      }),
    ]);

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

    const formatDailyPlanShort = (dp: typeof dailyPlansRaw[number]) => ({
      id: dp.id,
      userId: dp.userId,
      date: dp.date.toISOString().split('T')[0],
      mustWinTaskId: dp.mustWinTaskId,
      notes: dp.notes,
      status: dp.status,
      createdAt: dp.createdAt.toISOString(),
      updatedAt: dp.updatedAt.toISOString(),
    });

    return {
      weekStart: startStr,
      weekEnd: endStr,
      plan: weeklyPlanRaw ? this.formatWeeklyPlan(weeklyPlanRaw) : null,
      capacity,
      dailyPlans: dailyPlansRaw.map(formatDailyPlanShort),
      unscheduledReadyTasks: unscheduledTasksRaw.map(formatTask),
    };
  }

  async createWeeklyPlan(userId: string, input: CreateWeeklyPlanInput): Promise<WeeklyPlanDto> {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { weekStartsOn: true },
    });
    const weekStartsOn = userSettings?.weekStartsOn ?? 1;

    const { startUtc, endUtc } = this.dateService.getWeeklyBounds(input.weekStart, weekStartsOn);

    const existing = await prisma.weeklyPlan.findFirst({
      where: { userId, weekStart: startUtc },
    });

    if (existing) {
      throw new BadRequestError(`A Weekly Plan already exists for week starting ${input.weekStart}`);
    }

    const created = await prisma.weeklyPlan.create({
      data: {
        userId,
        weekStart: startUtc,
        weekEnd: endUtc,
        theme: input.theme || null,
        notes: input.notes || null,
        status: input.status || 'active',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'WEEKLY_PLAN_CREATED',
        entityType: 'WEEKLY_PLAN',
        entityId: created.id,
        metadata: { weekStart: input.weekStart, theme: input.theme },
      },
    });

    return this.formatWeeklyPlan(created);
  }

  async updateWeeklyPlan(userId: string, weekStartStr: string, input: UpdateWeeklyPlanInput): Promise<WeeklyPlanDto> {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { weekStartsOn: true },
    });
    const weekStartsOn = userSettings?.weekStartsOn ?? 1;

    const { startUtc } = this.dateService.getWeeklyBounds(weekStartStr, weekStartsOn);

    const existing = await prisma.weeklyPlan.findFirst({
      where: { userId, weekStart: startUtc },
    });

    if (!existing) {
      throw new NotFoundError(`Weekly plan for week starting ${weekStartStr} not found`);
    }

    const updated = await prisma.weeklyPlan.update({
      where: { id: existing.id },
      data: {
        theme: input.theme !== undefined ? input.theme : existing.theme,
        notes: input.notes !== undefined ? input.notes : existing.notes,
        status: input.status !== undefined ? input.status : existing.status,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'WEEKLY_PLAN_UPDATED',
        entityType: 'WEEKLY_PLAN',
        entityId: updated.id,
        metadata: { weekStart: weekStartStr, theme: updated.theme },
      },
    });

    return this.formatWeeklyPlan(updated);
  }
}
