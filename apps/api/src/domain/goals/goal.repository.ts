import { prisma } from '../../lib/prisma.js';
import { GoalStatus, TaskPriority, Prisma } from '@prisma/client';
import { GoalQuery } from '@kenenisa-os/shared';

export interface CreateGoalInput {
  userId: string;
  workstreamId: string;
  title: string;
  description?: string | null;
  status?: GoalStatus;
  priority?: TaskPriority;
  startDate?: Date | null;
  targetDate?: Date | null;
}

export interface UpdateGoalInput {
  workstreamId?: string;
  title?: string;
  description?: string | null;
  status?: GoalStatus;
  priority?: TaskPriority;
  startDate?: Date | null;
  targetDate?: Date | null;
  completedAt?: Date | null;
}

export class GoalRepository {
  async findMany(userId: string, query: GoalQuery) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.GoalWhereInput = {
      userId,
      ...(query.workstreamId ? { workstreamId: query.workstreamId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [items, total] = await Promise.all([
      prisma.goal.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          workstream: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              projects: true,
            },
          },
        },
      }),
      prisma.goal.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string, userId: string) {
    return prisma.goal.findFirst({
      where: { id, userId },
      include: {
        workstream: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });
  }

  async create(data: CreateGoalInput) {
    return prisma.goal.create({
      data: {
        userId: data.userId,
        workstreamId: data.workstreamId,
        title: data.title,
        description: data.description,
        status: data.status || GoalStatus.PLANNED,
        priority: data.priority || TaskPriority.P1,
        startDate: data.startDate,
        targetDate: data.targetDate,
      },
      include: {
        workstream: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });
  }

  async update(id: string, userId: string, data: UpdateGoalInput) {
    const goal = await this.findById(id, userId);
    if (!goal) return null;

    return prisma.goal.update({
      where: { id },
      data,
      include: {
        workstream: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });
  }
}
