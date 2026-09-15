import { WorkstreamRepository } from './workstream.repository.js';
import { WorkstreamQuery } from '@kenenisa-os/shared';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import { recordAuditLog } from '../../services/audit.service.js';
import { WorkstreamStatus } from '@prisma/client';

export class WorkstreamService {
  private repository: WorkstreamRepository;

  constructor() {
    this.repository = new WorkstreamRepository();
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async listWorkstreams(userId: string, query: WorkstreamQuery) {
    return this.repository.findMany(userId, query);
  }

  async getWorkstreamById(id: string, userId: string) {
    const item = await this.repository.findById(id, userId);
    if (!item) {
      throw new NotFoundError('Workstream not found');
    }
    return item;
  }

  async createWorkstream(
    userId: string,
    input: {
      name: string;
      slug?: string;
      description?: string | null;
      status?: WorkstreamStatus;
      priorityWeight?: number;
      sortOrder?: number;
    },
  ) {
    const slug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);
    const existing = await this.repository.findBySlug(userId, slug);
    if (existing) {
      throw new ConflictError('A workstream with this name/slug already exists');
    }

    const created = await this.repository.create({
      userId,
      name: input.name,
      slug,
      description: input.description,
      status: input.status,
      priorityWeight: input.priorityWeight,
      sortOrder: input.sortOrder,
    });

    await recordAuditLog({
      userId,
      entityType: 'Workstream',
      entityId: created.id,
      action: 'WORKSTREAM_CREATED',
      metadata: { name: created.name, slug: created.slug },
    });

    return created;
  }

  async updateWorkstream(
    id: string,
    userId: string,
    input: {
      name?: string;
      slug?: string;
      description?: string | null;
      status?: WorkstreamStatus;
      priorityWeight?: number;
      sortOrder?: number;
    },
  ) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Workstream not found');
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
        throw new ConflictError('A workstream with this name/slug already exists');
      }
    }

    const updated = await this.repository.update(id, userId, {
      ...input,
      ...(slug ? { slug } : {}),
    });

    await recordAuditLog({
      userId,
      entityType: 'Workstream',
      entityId: id,
      action: 'WORKSTREAM_UPDATED',
      metadata: { changes: Object.keys(input) },
    });

    return updated;
  }

  async archiveWorkstream(id: string, userId: string) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Workstream not found');
    }

    const archived = await this.repository.archive(id, userId);

    await recordAuditLog({
      userId,
      entityType: 'Workstream',
      entityId: id,
      action: 'WORKSTREAM_ARCHIVED',
      metadata: { name: existing.name },
    });

    return archived;
  }
}
