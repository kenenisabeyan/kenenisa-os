import { prisma } from '../../lib/prisma.js';
import { TimeBlockStatus as PrismaTimeBlockStatus, TaskStatus, TaskPriority, Prisma } from '@prisma/client';
import {
  TimeBlockDto,
  CreateTimeBlockInput,
  UpdateTimeBlockInput,
  ScheduleConflictDto,
  TaskDto,
} from '@kenenisa-os/shared';
import { AppError, NotFoundError, BadRequestError } from '../../utils/errors.js';

export interface TimeBlockPrismaPayload {
  id: string;
  userId: string;
  dailyPlanId: string | null;
  taskId: string | null;
  title: string;
  startAt: Date;
  endAt: Date;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  task?: {
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

export class PlanningServiceError extends AppError {
  constructor(message: string, code: string = 'PLANNING_ERROR', statusCode: number = 400) {
    super(message, statusCode, code as unknown as never);
  }
}

export class TimeBlockService {
  private formatTimeBlock(block: TimeBlockPrismaPayload): TimeBlockDto {
    const diffMs = block.endAt.getTime() - block.startAt.getTime();
    const durationMinutes = Math.max(0, Math.round(diffMs / (1000 * 60)));

    let taskDto: TaskDto | undefined = undefined;
    if (block.task) {
      taskDto = {
        id: block.task.id,
        userId: block.task.userId,
        projectId: block.task.projectId,
        milestoneId: block.task.milestoneId,
        parentTaskId: block.task.parentTaskId,
        title: block.task.title,
        description: block.task.description,
        status: block.task.status,
        priority: block.task.priority,
        estimateMinutes: block.task.estimateMinutes,
        actualMinutes: block.task.actualMinutes,
        startDate: block.task.startDate ? block.task.startDate.toISOString() : null,
        dueDate: block.task.dueDate ? block.task.dueDate.toISOString() : null,
        completedAt: block.task.completedAt ? block.task.completedAt.toISOString() : null,
        sortOrder: block.task.sortOrder,
        createdAt: block.task.createdAt.toISOString(),
        updatedAt: block.task.updatedAt.toISOString(),
        project: block.task.project
          ? { id: block.task.project.id, name: block.task.project.name, slug: block.task.project.slug }
          : undefined,
      };
    }

    return {
      id: block.id,
      userId: block.userId,
      dailyPlanId: block.dailyPlanId ?? null,
      taskId: block.taskId ?? null,
      title: block.title,
      startAt: block.startAt.toISOString(),
      endAt: block.endAt.toISOString(),
      status: block.status as TimeBlockDto['status'],
      notes: block.notes ?? null,
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
      task: taskDto,
      durationMinutes,
    };
  }

  /**
   * Check for schedule overlaps for a user.
   * Two blocks A & B overlap iff A.startAt < B.endAt AND A.endAt > B.startAt.
   */
  async findOverlappingBlocks(
    userId: string,
    startAt: Date,
    endAt: Date,
    excludeBlockId?: string,
  ): Promise<ScheduleConflictDto[]> {
    const overlapping = await prisma.timeBlock.findMany({
      where: {
        userId,
        ...(excludeBlockId ? { id: { not: excludeBlockId } } : {}),
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
      select: { id: true, title: true, startAt: true, endAt: true },
    });

    return overlapping.map((b) => ({
      conflictingBlockId: b.id,
      conflictingTitle: b.title,
      startAt: b.startAt.toISOString(),
      endAt: b.endAt.toISOString(),
    }));
  }

  async getTimeBlocks(
    userId: string,
    filters: {
      date?: string;
      startUtc?: Date;
      endUtc?: Date;
      taskId?: string;
      dailyPlanId?: string;
      status?: string;
    },
  ): Promise<TimeBlockDto[]> {
    const where: Prisma.TimeBlockWhereInput = { userId };

    if (filters.startUtc && filters.endUtc) {
      where.startAt = { gte: filters.startUtc, lte: filters.endUtc };
    }
    if (filters.taskId) where.taskId = filters.taskId;
    if (filters.dailyPlanId) where.dailyPlanId = filters.dailyPlanId;
    if (filters.status) where.status = filters.status as PrismaTimeBlockStatus;

    const items = await prisma.timeBlock.findMany({
      where,
      include: {
        task: {
          include: {
            project: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { startAt: 'asc' },
    });

    return items.map((item) => this.formatTimeBlock(item));
  }

  async getTimeBlockById(id: string, userId: string): Promise<TimeBlockDto> {
    const item = await prisma.timeBlock.findFirst({
      where: { id, userId },
      include: {
        task: {
          include: {
            project: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundError('Time block not found');
    }

    return this.formatTimeBlock(item);
  }

  async createTimeBlock(userId: string, input: CreateTimeBlockInput): Promise<TimeBlockDto> {
    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);

    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
      throw new BadRequestError('Invalid startAt or endAt date format');
    }

    if (startAt >= endAt) {
      throw new BadRequestError('startAt must be strictly before endAt (startAt < endAt)');
    }

    // Validate Task if attached
    if (input.taskId) {
      const task = await prisma.task.findFirst({
        where: { id: input.taskId, userId },
      });
      if (!task) {
        throw new NotFoundError('Attached task not found or does not belong to owner');
      }
      if (task.status === TaskStatus.CANCELLED) {
        throw new BadRequestError('Cannot schedule time block for a CANCELLED task');
      }
    }

    // Validate DailyPlan if attached
    if (input.dailyPlanId) {
      const plan = await prisma.dailyPlan.findFirst({
        where: { id: input.dailyPlanId, userId },
      });
      if (!plan) {
        throw new NotFoundError('Attached daily plan not found or does not belong to owner');
      }
    }

    // Overlap conflict detection
    const conflicts = await this.findOverlappingBlocks(userId, startAt, endAt);
    if (conflicts.length > 0) {
      throw new PlanningServiceError(
        `The selected time range (${startAt.toISOString()} - ${endAt.toISOString()}) overlaps with existing time block: "${conflicts[0].conflictingTitle}".`,
        'TIME_BLOCK_CONFLICT',
        400,
      );
    }

    const created = await prisma.timeBlock.create({
      data: {
        userId,
        dailyPlanId: input.dailyPlanId || null,
        taskId: input.taskId || null,
        title: input.title,
        startAt,
        endAt,
        status: (input.status as PrismaTimeBlockStatus) || PrismaTimeBlockStatus.PLANNED,
        notes: input.notes || null,
      },
      include: {
        task: {
          include: {
            project: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'TIME_BLOCK_CREATED',
        entityType: 'TIME_BLOCK',
        entityId: created.id,
        metadata: { title: created.title, startAt: created.startAt, endAt: created.endAt },
      },
    });

    return this.formatTimeBlock(created);
  }

  async updateTimeBlock(
    id: string,
    userId: string,
    input: UpdateTimeBlockInput,
  ): Promise<TimeBlockDto> {
    const existing = await prisma.timeBlock.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundError('Time block not found');
    }

    const startAt = input.startAt ? new Date(input.startAt) : existing.startAt;
    const endAt = input.endAt ? new Date(input.endAt) : existing.endAt;

    if (startAt >= endAt) {
      throw new BadRequestError('startAt must be strictly before endAt (startAt < endAt)');
    }

    if (input.taskId) {
      const task = await prisma.task.findFirst({
        where: { id: input.taskId, userId },
      });
      if (!task) {
        throw new NotFoundError('Attached task not found or does not belong to owner');
      }
    }

    // Check overlap if dates changed
    if (input.startAt || input.endAt) {
      const conflicts = await this.findOverlappingBlocks(userId, startAt, endAt, id);
      if (conflicts.length > 0) {
        throw new PlanningServiceError(
          `The updated time range overlaps with existing time block: "${conflicts[0].conflictingTitle}".`,
          'TIME_BLOCK_CONFLICT',
          400,
        );
      }
    }

    const updated = await prisma.timeBlock.update({
      where: { id },
      data: {
        dailyPlanId: input.dailyPlanId !== undefined ? input.dailyPlanId : existing.dailyPlanId,
        taskId: input.taskId !== undefined ? input.taskId : existing.taskId,
        title: input.title !== undefined ? input.title : existing.title,
        startAt,
        endAt,
        status: input.status ? input.status : existing.status,
        notes: input.notes !== undefined ? input.notes : existing.notes,
      },
      include: {
        task: {
          include: {
            project: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'TIME_BLOCK_UPDATED',
        entityType: 'TIME_BLOCK',
        entityId: updated.id,
        metadata: { title: updated.title, startAt: updated.startAt, endAt: updated.endAt },
      },
    });

    return this.formatTimeBlock(updated);
  }

  async deleteTimeBlock(id: string, userId: string): Promise<boolean> {
    const existing = await prisma.timeBlock.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundError('Time block not found');
    }

    await prisma.timeBlock.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'TIME_BLOCK_DELETED',
        entityType: 'TIME_BLOCK',
        entityId: id,
        metadata: { title: existing.title },
      },
    });

    return true;
  }
}
