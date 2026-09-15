import { prisma } from '../../lib/prisma.js';
import { ProjectStatus, TaskPriority, Prisma } from '@prisma/client';
import { ProjectQuery } from '@kenenisa-os/shared';

export interface CreateProjectInput {
  userId: string;
  workstreamId: string;
  goalId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: TaskPriority;
  startDate?: Date | null;
  targetDate?: Date | null;
}

export interface UpdateProjectInput {
  workstreamId?: string;
  goalId?: string | null;
  name?: string;
  slug?: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: TaskPriority;
  startDate?: Date | null;
  targetDate?: Date | null;
  completedAt?: Date | null;
  archivedAt?: Date | null;
}

export class ProjectRepository {
  async findMany(userId: string, query: ProjectQuery) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProjectWhereInput = {
      userId,
      ...(query.workstreamId ? { workstreamId: query.workstreamId } : {}),
      ...(query.goalId ? { goalId: query.goalId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.archived !== undefined
        ? query.archived
          ? { status: ProjectStatus.ARCHIVED }
          : { status: { not: ProjectStatus.ARCHIVED } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [items, total] = await Promise.all([
      prisma.project.findMany({
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
          goal: {
            select: {
              id: true,
              title: true,
            },
          },
          _count: {
            select: {
              milestones: true,
              tasks: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
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
    return prisma.project.findFirst({
      where: { id, userId },
      include: {
        workstream: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        goal: {
          select: {
            id: true,
            title: true,
            workstreamId: true,
          },
        },
        _count: {
          select: {
            milestones: true,
            tasks: true,
          },
        },
      },
    });
  }

  async findBySlug(userId: string, slug: string) {
    return prisma.project.findUnique({
      where: {
        userId_slug: {
          userId,
          slug,
        },
      },
    });
  }

  async create(data: CreateProjectInput) {
    return prisma.project.create({
      data: {
        userId: data.userId,
        workstreamId: data.workstreamId,
        goalId: data.goalId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        status: data.status || ProjectStatus.PLANNED,
        priority: data.priority || TaskPriority.P2,
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
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            milestones: true,
            tasks: true,
          },
        },
      },
    });
  }

  async update(id: string, userId: string, data: UpdateProjectInput) {
    const project = await this.findById(id, userId);
    if (!project) return null;

    return prisma.project.update({
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
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            milestones: true,
            tasks: true,
          },
        },
      },
    });
  }
}
