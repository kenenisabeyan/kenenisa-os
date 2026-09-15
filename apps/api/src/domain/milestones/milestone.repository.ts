import { prisma } from '../../lib/prisma.js';
import { MilestoneStatus, Prisma } from '@prisma/client';
import { MilestoneQuery, MilestoneReorderItem } from '@kenenisa-os/shared';

export interface CreateMilestoneInput {
  userId: string;
  projectId: string;
  name: string;
  description?: string | null;
  status?: MilestoneStatus;
  sortOrder?: number;
  targetDate?: Date | null;
}

export interface UpdateMilestoneInput {
  name?: string;
  description?: string | null;
  status?: MilestoneStatus;
  sortOrder?: number;
  targetDate?: Date | null;
  completedAt?: Date | null;
}

export class MilestoneRepository {
  async findMany(userId: string, query: MilestoneQuery) {
    const where: Prisma.MilestoneWhereInput = {
      userId,
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return prisma.milestone.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  async findById(id: string, userId: string) {
    return prisma.milestone.findFirst({
      where: { id, userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  async create(data: CreateMilestoneInput) {
    return prisma.milestone.create({
      data: {
        userId: data.userId,
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        status: data.status || MilestoneStatus.UPCOMING,
        sortOrder: data.sortOrder ?? 0,
        targetDate: data.targetDate,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  async update(id: string, userId: string, data: UpdateMilestoneInput) {
    const milestone = await this.findById(id, userId);
    if (!milestone) return null;

    return prisma.milestone.update({
      where: { id },
      data,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  async reorder(userId: string, items: MilestoneReorderItem[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.milestone.updateMany({
          where: { id: item.id, userId },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  }
}
