import { prisma } from '../../lib/prisma.js';
import { WorkstreamStatus, Prisma } from '@prisma/client';
import { WorkstreamQuery } from '@kenenisa-os/shared';

export interface CreateWorkstreamInput {
  userId: string;
  name: string;
  slug: string;
  description?: string | null;
  status?: WorkstreamStatus;
  priorityWeight?: number;
  sortOrder?: number;
}

export interface UpdateWorkstreamInput {
  name?: string;
  slug?: string;
  description?: string | null;
  status?: WorkstreamStatus;
  priorityWeight?: number;
  sortOrder?: number;
}

export class WorkstreamRepository {
  async findMany(userId: string, query: WorkstreamQuery) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.WorkstreamWhereInput = {
      userId,
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

    const sortBy = query.sortBy || 'sortOrder';
    const sortOrder = query.sortOrder || 'asc';

    const [items, total] = await Promise.all([
      prisma.workstream.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              goals: true,
              projects: true,
            },
          },
        },
      }),
      prisma.workstream.count({ where }),
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
    return prisma.workstream.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            goals: true,
            projects: true,
          },
        },
      },
    });
  }

  async findBySlug(userId: string, slug: string) {
    return prisma.workstream.findUnique({
      where: {
        userId_slug: {
          userId,
          slug,
        },
      },
    });
  }

  async create(data: CreateWorkstreamInput) {
    return prisma.workstream.create({
      data: {
        userId: data.userId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        status: data.status || WorkstreamStatus.ACTIVE,
        priorityWeight: data.priorityWeight ?? 1,
        sortOrder: data.sortOrder ?? 0,
      },
      include: {
        _count: {
          select: {
            goals: true,
            projects: true,
          },
        },
      },
    });
  }

  async update(id: string, userId: string, data: UpdateWorkstreamInput) {
    const workstream = await this.findById(id, userId);
    if (!workstream) return null;

    return prisma.workstream.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            goals: true,
            projects: true,
          },
        },
      },
    });
  }

  async archive(id: string, userId: string) {
    const workstream = await this.findById(id, userId);
    if (!workstream) return null;

    return prisma.workstream.update({
      where: { id },
      data: { status: WorkstreamStatus.ARCHIVED },
    });
  }
}
