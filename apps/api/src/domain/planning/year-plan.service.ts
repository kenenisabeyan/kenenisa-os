import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import type { YearPlanDto, CreateYearPlanInput, UpdateYearPlanInput } from '@kenenisa-os/shared';
import { TaskPriority } from '@prisma/client';

export class YearPlanService {
  public async getYearPlan(userId: string, year: number): Promise<YearPlanDto | null> {
    const plan = await prisma.yearPlan.findUnique({
      where: {
        userId_year: {
          userId,
          year,
        },
      },
      include: {
        workstream: true,
        goal: true,
        project: true,
        monthPlans: {
          orderBy: { month: 'asc' },
        },
        planOutcomes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!plan) return null;
    return this.mapToDto(plan);
  }

  public async createYearPlan(userId: string, input: CreateYearPlanInput): Promise<YearPlanDto> {
    const existing = await prisma.yearPlan.findUnique({
      where: {
        userId_year: {
          userId,
          year: input.year,
        },
      },
    });
    if (existing) {
      throw new ConflictError(`Yearly plan for ${input.year} already exists.`);
    }

    const created = await prisma.yearPlan.create({
      data: {
        userId,
        year: input.year,
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
        monthPlans: true,
        planOutcomes: true,
      },
    });

    return this.mapToDto(created);
  }

  public async updateYearPlan(userId: string, year: number, input: UpdateYearPlanInput): Promise<YearPlanDto> {
    const existing = await prisma.yearPlan.findUnique({
      where: {
        userId_year: {
          userId,
          year,
        },
      },
    });
    if (!existing) {
      throw new NotFoundError(`Yearly plan for ${year} not found.`);
    }

    const updated = await prisma.yearPlan.update({
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
        monthPlans: true,
        planOutcomes: true,
      },
    });

    return this.mapToDto(updated);
  }

  public async listYearPlans(userId: string): Promise<YearPlanDto[]> {
    const list = await prisma.yearPlan.findMany({
      where: { userId },
      orderBy: { year: 'desc' },
      include: {
        workstream: true,
        goal: true,
        project: true,
      },
    });

    return list.map((p) => this.mapToDto(p));
  }

  private mapToDto(item: any): YearPlanDto {
    return {
      id: item.id,
      userId: item.userId,
      year: item.year,
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
      monthPlans: item.monthPlans ? item.monthPlans.map((m: any) => ({
        ...m,
        startDate: m.startDate.toISOString(),
        endDate: m.endDate.toISOString(),
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })) : [],
      planOutcomes: item.planOutcomes ? item.planOutcomes.map((o: any) => ({
        ...o,
        startDate: o.startDate ? o.startDate.toISOString() : null,
        endDate: o.endDate ? o.endDate.toISOString() : null,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      })) : [],
    };
  }
}
