import { prisma } from '../../lib/prisma.js';
import { TaskStatus, TaskPriority, TaskDependencyType, Prisma } from '@prisma/client';
import { TaskQuery, TaskReorderItem } from '@kenenisa-os/shared';

export interface CreateTaskRepoInput {
  userId: string;
  projectId: string;
  milestoneId?: string | null;
  parentTaskId?: string | null;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimateMinutes?: number;
  actualMinutes?: number;
  startDate?: Date | null;
  dueDate?: Date | null;
  sortOrder?: number;
}

export interface UpdateTaskRepoInput {
  projectId?: string;
  milestoneId?: string | null;
  parentTaskId?: string | null;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimateMinutes?: number;
  actualMinutes?: number;
  startDate?: Date | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  sortOrder?: number;
}

export class TaskRepository {
  async findMany(userId: string, query: TaskQuery) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const now = new Date();

    const where: Prisma.TaskWhereInput = {
      userId,
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.milestoneId ? { milestoneId: query.milestoneId } : {}),
      ...(query.parentTaskId !== undefined ? { parentTaskId: query.parentTaskId } : {}),
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
      ...(query.overdue
        ? {
            dueDate: { lt: now },
            status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
          }
        : {}),
      ...(query.ready
        ? {
            status: TaskStatus.READY,
          }
        : {}),
      ...(query.blocked
        ? {
            status: TaskStatus.BLOCKED,
          }
        : {}),
      ...(query.completed
        ? {
            status: TaskStatus.DONE,
          }
        : {}),
    };

    const sortBy = query.sortBy || 'sortOrder';
    const sortOrder = query.sortOrder || 'asc';

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          milestone: {
            select: {
              id: true,
              name: true,
            },
          },
          parentTask: {
            select: {
              id: true,
              title: true,
            },
          },
          _count: {
            select: {
              subtasks: true,
              blockingDependencies: true,
              dependentDependencies: true,
            },
          },
        },
      }),
      prisma.task.count({ where }),
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
    return prisma.task.findFirst({
      where: { id, userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            workstreamId: true,
          },
        },
        milestone: {
          select: {
            id: true,
            name: true,
            projectId: true,
          },
        },
        parentTask: {
          select: {
            id: true,
            title: true,
            projectId: true,
          },
        },
        subtasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            estimateMinutes: true,
            actualMinutes: true,
            dueDate: true,
            completedAt: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        blockingDependencies: {
          include: {
            blockingTask: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
              },
            },
          },
        },
        dependentDependencies: {
          include: {
            dependentTask: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
              },
            },
          },
        },
        _count: {
          select: {
            subtasks: true,
            blockingDependencies: true,
            dependentDependencies: true,
          },
        },
      },
    });
  }

  async create(data: CreateTaskRepoInput) {
    return prisma.task.create({
      data: {
        userId: data.userId,
        projectId: data.projectId,
        milestoneId: data.milestoneId,
        parentTaskId: data.parentTaskId,
        title: data.title,
        description: data.description,
        status: data.status || TaskStatus.BACKLOG,
        priority: data.priority || TaskPriority.P2,
        estimateMinutes: data.estimateMinutes || 0,
        actualMinutes: data.actualMinutes || 0,
        startDate: data.startDate,
        dueDate: data.dueDate,
        sortOrder: data.sortOrder || 0,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        milestone: {
          select: {
            id: true,
            name: true,
          },
        },
        parentTask: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            subtasks: true,
            blockingDependencies: true,
            dependentDependencies: true,
          },
        },
      },
    });
  }

  async update(id: string, userId: string, data: UpdateTaskRepoInput) {
    const task = await this.findById(id, userId);
    if (!task) return null;

    return prisma.task.update({
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
        milestone: {
          select: {
            id: true,
            name: true,
          },
        },
        parentTask: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            subtasks: true,
            blockingDependencies: true,
            dependentDependencies: true,
          },
        },
      },
    });
  }

  async reorder(userId: string, items: TaskReorderItem[]) {
    const itemIds = items.map((i) => i.id);
    const existing = await prisma.task.findMany({
      where: {
        id: { in: itemIds },
        userId,
      },
      select: { id: true },
    });

    if (existing.length !== itemIds.length) {
      return false;
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.task.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return true;
  }

  async findSubtasks(parentTaskId: string, userId: string) {
    return prisma.task.findMany({
      where: {
        parentTaskId,
        userId,
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            subtasks: true,
            blockingDependencies: true,
            dependentDependencies: true,
          },
        },
      },
    });
  }

  async addDependency(
    blockingTaskId: string,
    dependentTaskId: string,
    dependencyType: TaskDependencyType = TaskDependencyType.BLOCKS,
  ) {
    return prisma.taskDependency.create({
      data: {
        blockingTaskId,
        dependentTaskId,
        dependencyType,
      },
      include: {
        blockingTask: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
        dependentTask: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });
  }

  async findDependencyById(id: string) {
    return prisma.taskDependency.findUnique({
      where: { id },
      include: {
        dependentTask: {
          select: { userId: true },
        },
      },
    });
  }

  async removeDependency(id: string) {
    return prisma.taskDependency.delete({
      where: { id },
    });
  }

  async findDependency(blockingTaskId: string, dependentTaskId: string) {
    return prisma.taskDependency.findUnique({
      where: {
        blockingTaskId_dependentTaskId: {
          blockingTaskId,
          dependentTaskId,
        },
      },
    });
  }

  /**
   * Traverse forward from `startTaskId` following blockingTaskId -> dependentTaskId edges
   * to determine all reachable dependent task IDs for cycle detection.
   */
  async findReachableTaskIds(startTaskId: string): Promise<Set<string>> {
    const visited = new Set<string>();
    const queue: string[] = [startTaskId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const deps = await prisma.taskDependency.findMany({
        where: { blockingTaskId: currentId },
        select: { dependentTaskId: true },
      });

      for (const dep of deps) {
        if (!visited.has(dep.dependentTaskId)) {
          queue.push(dep.dependentTaskId);
        }
      }
    }

    return visited;
  }

  /**
   * Check ancestor depth and return parent chain up to root
   */
  async findAncestorChain(taskId: string): Promise<string[]> {
    const chain: string[] = [];
    let currentId: string | null = taskId;

    while (currentId) {
      chain.push(currentId);
      const t: { parentTaskId: string | null } | null = await prisma.task.findUnique({
        where: { id: currentId },
        select: { parentTaskId: true },
      });

      if (!t || !t.parentTaskId) break;
      if (chain.includes(t.parentTaskId)) {
        // Cycle detected in DB
        break;
      }
      currentId = t.parentTaskId;
    }

    return chain;
  }

  async findUnsatisfiedBlockers(taskId: string): Promise<number> {
    const count = await prisma.taskDependency.count({
      where: {
        dependentTaskId: taskId,
        blockingTask: {
          status: { not: TaskStatus.DONE },
        },
      },
    });
    return count;
  }

  async findDependentTasks(blockingTaskId: string) {
    return prisma.taskDependency.findMany({
      where: { blockingTaskId },
      include: {
        dependentTask: true,
      },
    });
  }
}
