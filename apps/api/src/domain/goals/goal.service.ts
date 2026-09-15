import { GoalRepository } from './goal.repository.js';
import { WorkstreamRepository } from '../workstreams/workstream.repository.js';
import { GoalQuery } from '@kenenisa-os/shared';
import { NotFoundError } from '../../utils/errors.js';
import { recordAuditLog } from '../../services/audit.service.js';
import { GoalStatus, TaskPriority } from '@prisma/client';

export class GoalService {
  private repository: GoalRepository;
  private workstreamRepository: WorkstreamRepository;

  constructor() {
    this.repository = new GoalRepository();
    this.workstreamRepository = new WorkstreamRepository();
  }

  async listGoals(userId: string, query: GoalQuery) {
    return this.repository.findMany(userId, query);
  }

  async getGoalById(id: string, userId: string) {
    const item = await this.repository.findById(id, userId);
    if (!item) {
      throw new NotFoundError('Goal not found');
    }
    return item;
  }

  async createGoal(
    userId: string,
    input: {
      workstreamId: string;
      title: string;
      description?: string | null;
      status?: GoalStatus;
      priority?: TaskPriority;
      startDate?: string | null;
      targetDate?: string | null;
    },
  ) {
    const workstream = await this.workstreamRepository.findById(input.workstreamId, userId);
    if (!workstream) {
      throw new NotFoundError('Workstream not found');
    }

    const created = await this.repository.create({
      userId,
      workstreamId: input.workstreamId,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      startDate: input.startDate ? new Date(input.startDate) : null,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
    });

    await recordAuditLog({
      userId,
      entityType: 'Goal',
      entityId: created.id,
      action: 'GOAL_CREATED',
      metadata: { title: created.title, workstreamId: created.workstreamId },
    });

    return created;
  }

  async updateGoal(
    id: string,
    userId: string,
    input: {
      workstreamId?: string;
      title?: string;
      description?: string | null;
      status?: GoalStatus;
      priority?: TaskPriority;
      startDate?: string | null;
      targetDate?: string | null;
    },
  ) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Goal not found');
    }

    if (input.workstreamId && input.workstreamId !== existing.workstreamId) {
      const workstream = await this.workstreamRepository.findById(input.workstreamId, userId);
      if (!workstream) {
        throw new NotFoundError('Workstream not found');
      }
    }

    let completedAt = existing.completedAt;
    if (input.status) {
      if (input.status === GoalStatus.ACHIEVED && existing.status !== GoalStatus.ACHIEVED) {
        completedAt = new Date();
      } else if (input.status !== GoalStatus.ACHIEVED && existing.status === GoalStatus.ACHIEVED) {
        completedAt = null;
      }
    }

    const updated = await this.repository.update(id, userId, {
      ...input,
      completedAt,
      startDate: input.startDate !== undefined ? (input.startDate ? new Date(input.startDate) : null) : undefined,
      targetDate: input.targetDate !== undefined ? (input.targetDate ? new Date(input.targetDate) : null) : undefined,
    });

    await recordAuditLog({
      userId,
      entityType: 'Goal',
      entityId: id,
      action: 'GOAL_UPDATED',
      metadata: { changes: Object.keys(input) },
    });

    return updated;
  }

  async completeGoal(id: string, userId: string) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Goal not found');
    }

    const updated = await this.repository.update(id, userId, {
      status: GoalStatus.ACHIEVED,
      completedAt: new Date(),
    });

    await recordAuditLog({
      userId,
      entityType: 'Goal',
      entityId: id,
      action: 'GOAL_COMPLETED',
      metadata: { title: existing.title },
    });

    return updated;
  }

  async reopenGoal(id: string, userId: string) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Goal not found');
    }

    const updated = await this.repository.update(id, userId, {
      status: GoalStatus.IN_PROGRESS,
      completedAt: null,
    });

    await recordAuditLog({
      userId,
      entityType: 'Goal',
      entityId: id,
      action: 'GOAL_REOPENED',
      metadata: { title: existing.title },
    });

    return updated;
  }
}
