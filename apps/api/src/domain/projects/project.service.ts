import { ProjectRepository } from './project.repository.js';
import { WorkstreamRepository } from '../workstreams/workstream.repository.js';
import { GoalRepository } from '../goals/goal.repository.js';
import { ProjectQuery } from '@kenenisa-os/shared';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/errors.js';
import { recordAuditLog } from '../../services/audit.service.js';
import { ProjectStatus, TaskPriority } from '@prisma/client';

export class ProjectService {
  private repository: ProjectRepository;
  private workstreamRepository: WorkstreamRepository;
  private goalRepository: GoalRepository;

  constructor() {
    this.repository = new ProjectRepository();
    this.workstreamRepository = new WorkstreamRepository();
    this.goalRepository = new GoalRepository();
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async listProjects(userId: string, query: ProjectQuery) {
    return this.repository.findMany(userId, query);
  }

  async getProjectById(id: string, userId: string) {
    const item = await this.repository.findById(id, userId);
    if (!item) {
      throw new NotFoundError('Project not found');
    }
    return item;
  }

  async createProject(
    userId: string,
    input: {
      workstreamId: string;
      goalId?: string | null;
      name: string;
      slug?: string;
      description?: string | null;
      status?: ProjectStatus;
      priority?: TaskPriority;
      startDate?: string | null;
      targetDate?: string | null;
    },
  ) {
    const workstream = await this.workstreamRepository.findById(input.workstreamId, userId);
    if (!workstream) {
      throw new NotFoundError('Workstream not found');
    }

    if (input.goalId) {
      const goal = await this.goalRepository.findById(input.goalId, userId);
      if (!goal) {
        throw new NotFoundError('Goal not found');
      }
      if (goal.workstreamId !== input.workstreamId) {
        throw new BadRequestError(
          'Selected goal does not belong to the specified workstream',
        );
      }
    }

    const slug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);
    const existingSlug = await this.repository.findBySlug(userId, slug);
    if (existingSlug) {
      throw new ConflictError('A project with this name/slug already exists');
    }

    const created = await this.repository.create({
      userId,
      workstreamId: input.workstreamId,
      goalId: input.goalId,
      name: input.name,
      slug,
      description: input.description,
      status: input.status,
      priority: input.priority,
      startDate: input.startDate ? new Date(input.startDate) : null,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
    });

    await recordAuditLog({
      userId,
      entityType: 'Project',
      entityId: created.id,
      action: 'PROJECT_CREATED',
      metadata: { name: created.name, slug: created.slug, workstreamId: created.workstreamId },
    });

    return created;
  }

  async updateProject(
    id: string,
    userId: string,
    input: {
      workstreamId?: string;
      goalId?: string | null;
      name?: string;
      slug?: string;
      description?: string | null;
      status?: ProjectStatus;
      priority?: TaskPriority;
      startDate?: string | null;
      targetDate?: string | null;
    },
  ) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Project not found');
    }

    const targetWorkstreamId = input.workstreamId || existing.workstreamId;
    if (input.workstreamId && input.workstreamId !== existing.workstreamId) {
      const workstream = await this.workstreamRepository.findById(input.workstreamId, userId);
      if (!workstream) {
        throw new NotFoundError('Workstream not found');
      }
    }

    if (input.goalId !== undefined) {
      if (input.goalId !== null) {
        const goal = await this.goalRepository.findById(input.goalId, userId);
        if (!goal) {
          throw new NotFoundError('Goal not found');
        }
        if (goal.workstreamId !== targetWorkstreamId) {
          throw new BadRequestError(
            'Selected goal does not belong to the specified workstream',
          );
        }
      }
    }

    let slug: string | undefined = undefined;
    if (input.slug) {
      slug = this.slugify(input.slug);
    } else if (input.name && input.name !== existing.name) {
      slug = this.slugify(input.name);
    }

    if (slug && slug !== existing.slug) {
      const duplicate = await this.repository.findBySlug(userId, slug);
      if (duplicate) {
        throw new ConflictError('A project with this name/slug already exists');
      }
    }

    let completedAt = existing.completedAt;
    let archivedAt = existing.archivedAt;

    if (input.status) {
      if (input.status === ProjectStatus.COMPLETED && existing.status !== ProjectStatus.COMPLETED) {
        completedAt = new Date();
      } else if (input.status !== ProjectStatus.COMPLETED && existing.status === ProjectStatus.COMPLETED) {
        completedAt = null;
      }

      if (input.status === ProjectStatus.ARCHIVED && existing.status !== ProjectStatus.ARCHIVED) {
        archivedAt = new Date();
      } else if (input.status !== ProjectStatus.ARCHIVED && existing.status === ProjectStatus.ARCHIVED) {
        archivedAt = null;
      }
    }

    const updated = await this.repository.update(id, userId, {
      ...input,
      ...(slug ? { slug } : {}),
      completedAt,
      archivedAt,
      startDate: input.startDate !== undefined ? (input.startDate ? new Date(input.startDate) : null) : undefined,
      targetDate: input.targetDate !== undefined ? (input.targetDate ? new Date(input.targetDate) : null) : undefined,
    });

    await recordAuditLog({
      userId,
      entityType: 'Project',
      entityId: id,
      action: 'PROJECT_UPDATED',
      metadata: { changes: Object.keys(input) },
    });

    return updated;
  }

  async archiveProject(id: string, userId: string) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Project not found');
    }

    const updated = await this.repository.update(id, userId, {
      status: ProjectStatus.ARCHIVED,
      archivedAt: new Date(),
    });

    await recordAuditLog({
      userId,
      entityType: 'Project',
      entityId: id,
      action: 'PROJECT_ARCHIVED',
      metadata: { name: existing.name },
    });

    return updated;
  }

  async completeProject(id: string, userId: string) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Project not found');
    }

    const updated = await this.repository.update(id, userId, {
      status: ProjectStatus.COMPLETED,
      completedAt: new Date(),
    });

    await recordAuditLog({
      userId,
      entityType: 'Project',
      entityId: id,
      action: 'PROJECT_COMPLETED',
      metadata: { name: existing.name },
    });

    return updated;
  }

  async reopenProject(id: string, userId: string) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Project not found');
    }

    const updated = await this.repository.update(id, userId, {
      status: ProjectStatus.ACTIVE,
      completedAt: null,
      archivedAt: null,
    });

    await recordAuditLog({
      userId,
      entityType: 'Project',
      entityId: id,
      action: 'PROJECT_REOPENED',
      metadata: { name: existing.name },
    });

    return updated;
  }
}
