import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import type { MonthPlanDto, CreateMonthPlanInput, UpdateMonthPlanInput } from '@kenenisa-os/shared';
import { TaskPriority } from '@prisma/client';

export class MonthPlanService {
  public async getMonthPlan(userId: string, year: number, month: number): Promise<MonthPlanDto | null> {
    const plan = await prisma.monthPlan.findUnique({
      where: {
        userId_year_month: {
          userId,
          year,
          month,
        },
      },
      include: {
        workstream: true,
        goal: true,
        project: true,
        weeklyPlans: {
          orderBy: { weekStart: 'asc' },
        },
        planOutcomes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!plan) return null;
    return this.mapToDto(plan);
  }

  public async createMonthPlan(userId: string, input: CreateMonthPlanInput): Promise<MonthPlanDto> {
    const existing = await prisma.monthPlan.findUnique({
      where: {
        userId_year_month: {
          userId,
          year: input.year,
          month: input.month,
        },
      },
    });
    if (existing) {
      throw new ConflictError(`Monthly plan for ${input.year}-${input.month} already exists.`);
    }

    const created = await prisma.monthPlan.create({
      data: {
        userId,
        yearPlanId: input.yearPlanId || null,
        year: input.year,
        month: input.month,
        title: input.title,
        description: input.description || null,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        status: input.status || 'ACTIVE',
        priority: (input.priority as TaskPriority) || TaskPriority.P1,
        expectedOutcomes: input.expectedOutcomes || null,
        actualOutcomes: input.actualOutcomes || null,
        notes: input.notes || null,
        workstreamId: input.workstreamId || null,
        goalId: input.goalId || null,
        projectId: input.projectId || null,
      },
      include: {
        workstream: true,
        goal: true,
        project: true,
        weeklyPlans: true,
        planOutcomes: true,
      },
    });

    return this.mapToDto(created);
  }

  public async updateMonthPlan(
    userId: string,
    year: number,
    month: number,
    input: UpdateMonthPlanInput,
  ): Promise<MonthPlanDto> {
    const existing = await prisma.monthPlan.findUnique({
      where: {
        userId_year_month: {
          userId,
          year,
          month,
        },
      },
    });
    if (!existing) {
      throw new NotFoundError(`Monthly plan for ${year}-${month} not found.`);
    }

    const updated = await prisma.monthPlan.update({
      where: { id: existing.id },
      data: {
        title: input.title !== undefined ? input.title : existing.title,
        description: input.description !== undefined ? input.description : existing.description,
        startDate: input.startDate ? new Date(input.startDate) : existing.startDate,
        endDate: input.endDate ? new Date(input.endDate) : existing.endDate,
        status: input.status !== undefined ? input.status : existing.status,
        priority: input.priority ? (input.priority as TaskPriority) : existing.priority,
        expectedOutcomes: input.expectedOutcomes !== undefined ? input.expectedOutcomes : existing.expectedOutcomes,
        actualOutcomes: input.actualOutcomes !== undefined ? input.actualOutcomes : existing.actualOutcomes,
        notes: input.notes !== undefined ? input.notes : existing.notes,
        workstreamId: input.workstreamId !== undefined ? input.workstreamId : existing.workstreamId,
        goalId: input.goalId !== undefined ? input.goalId : existing.goalId,
        projectId: input.projectId !== undefined ? input.projectId : existing.projectId,
      },
      include: {
        workstream: true,
        goal: true,
        project: true,
        weeklyPlans: true,
        planOutcomes: true,
      },
    });

    return this.mapToDto(updated);
  }

  public async listMonthPlans(userId: string, year?: number): Promise<MonthPlanDto[]> {
    const where: any = { userId };
    if (year) where.year = year;

    const list = await prisma.monthPlan.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        workstream: true,
        goal: true,
        project: true,
      },
    });

    return list.map((p) => this.mapToDto(p));
  }

  private mapToDto(item: any): MonthPlanDto {
    return {
      id: item.id,
      userId: item.userId,
      yearPlanId: item.yearPlanId,
      year: item.year,
      month: item.month,
      title: item.title,
      description: item.description,
      startDate: item.startDate.toISOString(),
      endDate: item.endDate.toISOString(),
      status: item.status,
      priority: item.priority,
      expectedOutcomes: item.expectedOutcomes,
      actualOutcomes: item.actualOutcomes,
      notes: item.notes,
      workstreamId: item.workstreamId,
      goalId: item.goalId,
      projectId: item.projectId,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      workstream: item.workstream || null,
      goal: item.goal || null,
      project: item.project || null,
      weeklyPlans: item.weeklyPlans
        ? item.weeklyPlans.map((w: any) => ({
            ...w,
            weekStart: w.weekStart.toISOString(),
            weekEnd: w.weekEnd.toISOString(),
            createdAt: w.createdAt.toISOString(),
            updatedAt: w.updatedAt.toISOString(),
          }))
        : [],
      planOutcomes: item.planOutcomes
        ? item.planOutcomes.map((o: any) => ({
            ...o,
            startDate: o.startDate ? o.startDate.toISOString() : null,
            endDate: o.endDate ? o.endDate.toISOString() : null,
            createdAt: o.createdAt.toISOString(),
            updatedAt: o.updatedAt.toISOString(),
          }))
        : [],
    };
  }
}
