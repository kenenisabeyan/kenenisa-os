import { MilestoneRepository } from './milestone.repository.js';
import { ProjectRepository } from '../projects/project.repository.js';
import { MilestoneQuery, MilestoneReorderItem } from '@kenenisa-os/shared';
import { NotFoundError } from '../../utils/errors.js';
import { recordAuditLog } from '../../services/audit.service.js';
import { MilestoneStatus } from '@prisma/client';

export class MilestoneService {
  private repository: MilestoneRepository;
  private projectRepository: ProjectRepository;

  constructor() {
    this.repository = new MilestoneRepository();
    this.projectRepository = new ProjectRepository();
  }

  async listMilestones(userId: string, query: MilestoneQuery) {
    return this.repository.findMany(userId, query);
  }

  async getMilestoneById(id: string, userId: string) {
    const item = await this.repository.findById(id, userId);
    if (!item) {
      throw new NotFoundError('Milestone not found');
    }
    return item;
  }

  async createMilestone(
    userId: string,
    input: {
      projectId: string;
      name: string;
      description?: string | null;
      status?: MilestoneStatus;
      sortOrder?: number;
      targetDate?: string | null;
    },
  ) {
    const project = await this.projectRepository.findById(input.projectId, userId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const created = await this.repository.create({
      userId,
      projectId: input.projectId,
      name: input.name,
      description: input.description,
      status: input.status,
      sortOrder: input.sortOrder,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
    });

    await recordAuditLog({
      userId,
      entityType: 'Milestone',
      entityId: created.id,
      action: 'MILESTONE_CREATED',
      metadata: { name: created.name, projectId: created.projectId },
    });

    return created;
  }

  async updateMilestone(
    id: string,
    userId: string,
    input: {
      name?: string;
      description?: string | null;
      status?: MilestoneStatus;
      sortOrder?: number;
      targetDate?: string | null;
    },
  ) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Milestone not found');
    }

    let completedAt = existing.completedAt;
    if (input.status) {
      if (input.status === MilestoneStatus.REACHED && existing.status !== MilestoneStatus.REACHED) {
        completedAt = new Date();
      } else if (input.status !== MilestoneStatus.REACHED && existing.status === MilestoneStatus.REACHED) {
        completedAt = null;
      }
    }

    const updated = await this.repository.update(id, userId, {
      ...input,
      completedAt,
      targetDate: input.targetDate !== undefined ? (input.targetDate ? new Date(input.targetDate) : null) : undefined,
    });

    await recordAuditLog({
      userId,
      entityType: 'Milestone',
      entityId: id,
      action: 'MILESTONE_UPDATED',
      metadata: { changes: Object.keys(input) },
    });

    return updated;
  }

  async completeMilestone(id: string, userId: string) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Milestone not found');
    }

    const updated = await this.repository.update(id, userId, {
      status: MilestoneStatus.REACHED,
      completedAt: new Date(),
    });

    await recordAuditLog({
      userId,
      entityType: 'Milestone',
      entityId: id,
      action: 'MILESTONE_COMPLETED',
      metadata: { name: existing.name },
    });

    return updated;
  }

  async reopenMilestone(id: string, userId: string) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Milestone not found');
    }

    const updated = await this.repository.update(id, userId, {
      status: MilestoneStatus.IN_PROGRESS,
      completedAt: null,
    });

    await recordAuditLog({
      userId,
      entityType: 'Milestone',
      entityId: id,
      action: 'MILESTONE_REOPENED',
      metadata: { name: existing.name },
    });

    return updated;
  }

  async reorderMilestones(userId: string, items: MilestoneReorderItem[]) {
    for (const item of items) {
      const milestone = await this.repository.findById(item.id, userId);
      if (!milestone) {
        throw new NotFoundError(`Milestone not found: ${item.id}`);
      }
    }

    await this.repository.reorder(userId, items);

    await recordAuditLog({
      userId,
      entityType: 'Milestone',
      entityId: items[0]?.id || 'reorder',
      action: 'MILESTONE_REORDERED',
      metadata: { itemCount: items.length },
    });

    return { success: true, count: items.length };
  }
}
