import { TaskRepository, CreateTaskRepoInput, UpdateTaskRepoInput } from './task.repository.js';
import { ProjectRepository } from '../projects/project.repository.js';
import { MilestoneRepository } from '../milestones/milestone.repository.js';
import { recordAuditLog } from '../../services/audit.service.js';
import { TaskStatus, TaskDependencyType } from '@prisma/client';
import { TaskQuery, TaskReorderItem, type ErrorCode } from '@kenenisa-os/shared';

import { AppError } from '../../utils/errors.js';

export type CreateTaskInput = Omit<CreateTaskRepoInput, 'userId'>;
export type UpdateTaskInput = UpdateTaskRepoInput;

export class TaskServiceError extends AppError {
  constructor(
    code: string,
    message: string,
    statusCode: number = 400,
  ) {
    super(message, statusCode, code as ErrorCode);
    this.name = 'TaskServiceError';
  }
}


export class TaskService {
  private taskRepo = new TaskRepository();
  private projectRepo = new ProjectRepository();
  private milestoneRepo = new MilestoneRepository();

  async getTasks(userId: string, query: TaskQuery) {
    return this.taskRepo.findMany(userId, query);
  }

  async getTaskById(id: string, userId: string) {
    const task = await this.taskRepo.findById(id, userId);
    if (!task) {
      throw new TaskServiceError('RESOURCE_NOT_FOUND', 'Task not found.', 404);
    }
    return task;
  }

  async createTask(userId: string, input: CreateTaskInput) {

    // 1. Verify project ownership & existence
    const project = await this.projectRepo.findById(input.projectId, userId);
    if (!project) {
      throw new TaskServiceError('RESOURCE_NOT_FOUND', 'Project not found.', 404);
    }

    // 2. Validate milestone compatibility
    if (input.milestoneId) {
      const milestone = await this.milestoneRepo.findById(input.milestoneId, userId);
      if (!milestone) {
        throw new TaskServiceError('RESOURCE_NOT_FOUND', 'Milestone not found.', 404);
      }
      if (milestone.projectId !== input.projectId) {
        throw new TaskServiceError(
          'MILESTONE_PROJECT_MISMATCH',
          'Milestone must belong to the specified project.',
          400,
        );
      }
    }

    // 3. Validate parent task compatibility & depth
    if (input.parentTaskId) {
      const parentTask = await this.taskRepo.findById(input.parentTaskId, userId);
      if (!parentTask) {
        throw new TaskServiceError('RESOURCE_NOT_FOUND', 'Parent task not found.', 404);
      }
      if (parentTask.projectId !== input.projectId) {
        throw new TaskServiceError(
          'PARENT_TASK_PROJECT_MISMATCH',
          'Parent task must belong to the same project.',
          400,
        );
      }

      const chain = await this.taskRepo.findAncestorChain(input.parentTaskId);
      if (chain.length >= 5) {
        throw new TaskServiceError(
          'INVALID_TASK_HIERARCHY_DEPTH',
          'Task nesting depth cannot exceed 5 levels.',
          400,
        );
      }
    }

    const task = await this.taskRepo.create({
      ...input,
      userId,
    });

    await recordAuditLog({
      userId,
      entityType: 'TASK',
      entityId: task.id,
      action: 'TASK_CREATED',
      metadata: {
        title: task.title,
        projectId: task.projectId,
        milestoneId: task.milestoneId,
        parentTaskId: task.parentTaskId,
      },
    });

    return task;
  }

  async updateTask(id: string, userId: string, input: UpdateTaskRepoInput) {
    const existing = await this.taskRepo.findById(id, userId);
    if (!existing) {
      throw new TaskServiceError('RESOURCE_NOT_FOUND', 'Task not found.', 404);
    }

    const targetProjectId = input.projectId || existing.projectId;

    // Validate project
    if (input.projectId && input.projectId !== existing.projectId) {
      const project = await this.projectRepo.findById(input.projectId, userId);
      if (!project) {
        throw new TaskServiceError('RESOURCE_NOT_FOUND', 'Project not found.', 404);
      }
    }

    // Validate milestone
    if (input.milestoneId) {
      const milestone = await this.milestoneRepo.findById(input.milestoneId, userId);
      if (!milestone) {
        throw new TaskServiceError('RESOURCE_NOT_FOUND', 'Milestone not found.', 404);
      }
      if (milestone.projectId !== targetProjectId) {
        throw new TaskServiceError(
          'MILESTONE_PROJECT_MISMATCH',
          'Milestone must belong to the target project.',
          400,
        );
      }
    }

    // Validate parentTaskId & cycle/depth
    if (input.parentTaskId !== undefined && input.parentTaskId !== null) {
      if (input.parentTaskId === id) {
        throw new TaskServiceError(
          'SELF_PARENTING_NOT_ALLOWED',
          'A task cannot be its own parent.',
          400,
        );
      }

      const parentTask = await this.taskRepo.findById(input.parentTaskId, userId);
      if (!parentTask) {
        throw new TaskServiceError('RESOURCE_NOT_FOUND', 'Parent task not found.', 404);
      }

      if (parentTask.projectId !== targetProjectId) {
        throw new TaskServiceError(
          'PARENT_TASK_PROJECT_MISMATCH',
          'Parent task must belong to the same project.',
          400,
        );
      }

      const chain = await this.taskRepo.findAncestorChain(input.parentTaskId);
      if (chain.includes(id)) {
        throw new TaskServiceError(
          'INVALID_TASK_HIERARCHY_CYCLE',
          'Setting this parent creates a hierarchy cycle.',
          400,
        );
      }

      if (chain.length >= 5) {
        throw new TaskServiceError(
          'INVALID_TASK_HIERARCHY_DEPTH',
          'Task nesting depth cannot exceed 5 levels.',
          400,
        );
      }
    }

    // Validate status transition if status is being updated directly
    if (input.status && input.status !== existing.status) {
      if (input.status === TaskStatus.IN_PROGRESS || input.status === TaskStatus.READY) {
        const blockersCount = await this.taskRepo.findUnsatisfiedBlockers(id);
        if (blockersCount > 0) {
          throw new TaskServiceError(
            'TASK_HAS_UNRESOLVED_DEPENDENCIES',
            'Cannot mark task as READY or IN_PROGRESS while blocking dependencies are unresolved.',
            400,
          );
        }
      }
    }

    const updated = await this.taskRepo.update(id, userId, input);

    await recordAuditLog({
      userId,
      entityType: 'TASK',
      entityId: id,
      action: 'TASK_UPDATED',
      metadata: {
        updatedFields: Object.keys(input),
      },
    });

    return updated;
  }

  async startTask(id: string, userId: string) {
    const task = await this.taskRepo.findById(id, userId);
    if (!task) {
      throw new TaskServiceError('RESOURCE_NOT_FOUND', 'Task not found.', 404);
    }

    const blockersCount = await this.taskRepo.findUnsatisfiedBlockers(id);
    if (blockersCount > 0) {
      throw new TaskServiceError(
        'TASK_HAS_UNRESOLVED_DEPENDENCIES',
        'Cannot start task while blocking dependencies are unresolved.',
        400,
      );
    }

    const updated = await this.taskRepo.update(id, userId, {
      status: TaskStatus.IN_PROGRESS,
    });

    await recordAuditLog({
      userId,
      entityType: 'TASK',
      entityId: id,
      action: 'TASK_STARTED',
    });

    return updated;
  }

  async blockTask(id: string, userId: string) {
    const task = await this.taskRepo.findById(id, userId);
    if (!task) {
      throw new TaskServiceError('RESOURCE_NOT_FOUND', 'Task not found.', 404);
    }

    const updated = await this.taskRepo.update(id, userId, {
      status: TaskStatus.BLOCKED,
    });

    await recordAuditLog({
      userId,
      entityType: 'TASK',
      entityId: id,
      action: 'TASK_BLOCKED',
    });

    return updated;
  }

  async completeTask(id: string, userId: string) {
    const task = await this.taskRepo.findById(id, userId);
    if (!task) {
      throw new TaskServiceError('RESOURCE_NOT_FOUND', 'Task not found.', 404);
    }

    const updated = await this.taskRepo.update(id, userId, {
      status: TaskStatus.DONE,
      completedAt: new Date(),
    });

    // Automatically check dependent tasks and unblock them if all blockers are now clear
    const dependents = await this.taskRepo.findDependentTasks(id);
    for (const dep of dependents) {
      const blockersCount = await this.taskRepo.findUnsatisfiedBlockers(dep.dependentTaskId);
      if (blockersCount === 0 && dep.dependentTask.status === TaskStatus.BLOCKED) {
        await this.taskRepo.update(dep.dependentTaskId, userId, {
          status: TaskStatus.READY,
        });
      }
    }

    await recordAuditLog({
      userId,
      entityType: 'TASK',
      entityId: id,
      action: 'TASK_COMPLETED',
    });

    return updated;
  }

  async reopenTask(id: string, userId: string) {
    const task = await this.taskRepo.findById(id, userId);
    if (!task) {
      throw new TaskServiceError('RESOURCE_NOT_FOUND', 'Task not found.', 404);
    }

    const blockersCount = await this.taskRepo.findUnsatisfiedBlockers(id);
    const targetStatus = blockersCount > 0 ? TaskStatus.BLOCKED : TaskStatus.READY;

    const updated = await this.taskRepo.update(id, userId, {
      status: targetStatus,
      completedAt: null,
    });

    await recordAuditLog({
      userId,
      entityType: 'TASK',
      entityId: id,
      action: 'TASK_REOPENED',
    });

    return updated;
  }

  async cancelTask(id: string, userId: string) {
    const task = await this.taskRepo.findById(id, userId);
    if (!task) {
      throw new TaskServiceError('RESOURCE_NOT_FOUND', 'Task not found.', 404);
    }

    const updated = await this.taskRepo.update(id, userId, {
      status: TaskStatus.CANCELLED,
    });

    await recordAuditLog({
      userId,
      entityType: 'TASK',
      entityId: id,
      action: 'TASK_CANCELLED',
    });

    return updated;
  }

  async reorderTasks(userId: string, items: TaskReorderItem[]) {
    const success = await this.taskRepo.reorder(userId, items);
    if (!success) {
      throw new TaskServiceError(
        'INVALID_REORDER_PAYLOAD',
        'One or more tasks were not found or belong to another user.',
        400,
      );
    }

    await recordAuditLog({
      userId,
      entityType: 'TASK',
      entityId: 'BATCH',
      action: 'TASK_REORDERED',
      metadata: { count: items.length },
    });

    return true;
  }

  async createSubtask(userId: string, parentTaskId: string, input: CreateTaskInput) {
    const parentTask = await this.taskRepo.findById(parentTaskId, userId);
    if (!parentTask) {
      throw new TaskServiceError('RESOURCE_NOT_FOUND', 'Parent task not found.', 404);
    }

    return this.createTask(userId, {
      ...input,
      projectId: parentTask.projectId,
      parentTaskId: parentTask.id,
    });
  }


  async addDependency(
    userId: string,
    dependentTaskId: string,
    blockingTaskId: string,
    dependencyType: TaskDependencyType = TaskDependencyType.BLOCKS,
  ) {
    if (dependentTaskId === blockingTaskId) {
      throw new TaskServiceError(
        'SELF_DEPENDENCY_NOT_ALLOWED',
        'A task cannot depend on itself.',
        400,
      );
    }

    const [dependentTask, blockingTask] = await Promise.all([
      this.taskRepo.findById(dependentTaskId, userId),
      this.taskRepo.findById(blockingTaskId, userId),
    ]);

    if (!dependentTask || !blockingTask) {
      throw new TaskServiceError(
        'RESOURCE_NOT_FOUND',
        'Dependent or blocking task not found.',
        404,
      );
    }

    // Check duplicate relationship
    const existing = await this.taskRepo.findDependency(blockingTaskId, dependentTaskId);
    if (existing) {
      throw new TaskServiceError(
        'DUPLICATE_DEPENDENCY',
        'Dependency relationship already exists.',
        400,
      );
    }

    // Cycle detection algorithm:
    // Check if `blockingTaskId` is reachable from `dependentTaskId`
    const reachableFromDependent = await this.taskRepo.findReachableTaskIds(dependentTaskId);
    if (reachableFromDependent.has(blockingTaskId)) {
      throw new TaskServiceError(
        'DEPENDENCY_CYCLE_DETECTED',
        'Adding this dependency would create a cycle in the task graph.',
        400,
      );
    }

    const dep = await this.taskRepo.addDependency(
      blockingTaskId,
      dependentTaskId,
      dependencyType,
    );

    // Update status to BLOCKED if blocking task is not DONE and dependent task was READY/IN_PROGRESS
    if (
      blockingTask.status !== TaskStatus.DONE &&
      (dependentTask.status === TaskStatus.READY || dependentTask.status === TaskStatus.IN_PROGRESS)
    ) {
      await this.taskRepo.update(dependentTaskId, userId, {
        status: TaskStatus.BLOCKED,
      });
    }

    await recordAuditLog({
      userId,
      entityType: 'TASK_DEPENDENCY',
      entityId: dep.id,
      action: 'TASK_DEPENDENCY_CREATED',
      metadata: { blockingTaskId, dependentTaskId },
    });

    return dep;
  }

  async removeDependency(userId: string, dependentTaskId: string, dependencyId: string) {
    const dep = await this.taskRepo.findDependencyById(dependencyId);
    if (!dep || dep.dependentTask.userId !== userId || dep.dependentTaskId !== dependentTaskId) {
      throw new TaskServiceError('RESOURCE_NOT_FOUND', 'Dependency relationship not found.', 404);
    }

    await this.taskRepo.removeDependency(dependencyId);

    // Evaluate dependent task readiness
    const remainingBlockers = await this.taskRepo.findUnsatisfiedBlockers(dependentTaskId);
    const dependentTask = await this.taskRepo.findById(dependentTaskId, userId);
    if (remainingBlockers === 0 && dependentTask?.status === TaskStatus.BLOCKED) {
      await this.taskRepo.update(dependentTaskId, userId, {
        status: TaskStatus.READY,
      });
    }

    await recordAuditLog({
      userId,
      entityType: 'TASK_DEPENDENCY',
      entityId: dependencyId,
      action: 'TASK_DEPENDENCY_REMOVED',
    });

    return true;
  }
}
