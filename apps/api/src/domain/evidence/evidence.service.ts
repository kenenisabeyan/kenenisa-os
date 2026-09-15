import { prisma } from '../../lib/prisma.js';
import { EvidenceType, Prisma } from '@prisma/client';
import {
  EvidenceDto,
  CreateEvidenceInput,
  UpdateEvidenceInput,
  EvidenceQuery,
} from '@kenenisa-os/shared';
import { NotFoundError, ForbiddenError, ConflictError } from '../../utils/errors.js';

export class EvidenceService {
  private formatEvidence(item: {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    type: EvidenceType;
    url: string | null;
    externalReference: string | null;
    date: Date;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
    tasks?: { id: string; evidenceId: string; taskId: string; createdAt: Date; task?: { id: string; title: string; status: string } }[];
    projects?: { id: string; evidenceId: string; projectId: string; createdAt: Date; project?: { id: string; name: string; slug: string } }[];
    learningItems?: { id: string; evidenceId: string; learningItemId: string; createdAt: Date; learningItem?: { id: string; title: string; type: string } }[];
    skills?: { id: string; evidenceId: string; skillId: string; createdAt: Date; skill?: { id: string; name: string; currentLevel: string } }[];
  }): EvidenceDto {
    return {
      id: item.id,
      userId: item.userId,
      title: item.title,
      description: item.description ?? null,
      type: item.type,
      url: item.url ?? null,
      externalReference: item.externalReference ?? null,
      date: item.date.toISOString().split('T')[0],
      verified: item.verified,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      tasks: item.tasks?.map((t) => ({
        id: t.id,
        evidenceId: t.evidenceId,
        taskId: t.taskId,
        createdAt: t.createdAt.toISOString(),
        task: t.task ? { id: t.task.id, title: t.task.title, status: t.task.status } : undefined,
      })),
      projects: item.projects?.map((p) => ({
        id: p.id,
        evidenceId: p.evidenceId,
        projectId: p.projectId,
        createdAt: p.createdAt.toISOString(),
        project: p.project ? { id: p.project.id, name: p.project.name, slug: p.project.slug } : undefined,
      })),
      learningItems: item.learningItems?.map((l) => ({
        id: l.id,
        evidenceId: l.evidenceId,
        learningItemId: l.learningItemId,
        createdAt: l.createdAt.toISOString(),
        learningItem: l.learningItem ? { id: l.learningItem.id, title: l.learningItem.title, type: l.learningItem.type } : undefined,
      })),
      skills: item.skills?.map((s) => ({
        id: s.id,
        evidenceId: s.evidenceId,
        skillId: s.skillId,
        createdAt: s.createdAt.toISOString(),
        skill: s.skill ? { id: s.skill.id, name: s.skill.name, currentLevel: s.skill.currentLevel } : undefined,
      })),
    };
  }

  async listEvidence(
    userId: string,
    query: EvidenceQuery,
  ): Promise<{ items: EvidenceDto[]; total: number; page: number; pageSize: number }> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const skip = (page - 1) * pageSize;

    const where: Prisma.EvidenceWhereInput = { userId };
    if (query.type) {
      where.type = query.type;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.projectId) {
      where.projects = { some: { projectId: query.projectId } };
    }
    if (query.taskId) {
      where.tasks = { some: { taskId: query.taskId } };
    }
    if (query.learningItemId) {
      where.learningItems = { some: { learningItemId: query.learningItemId } };
    }
    if (query.skillId) {
      where.skills = { some: { skillId: query.skillId } };
    }

    const [items, total] = await Promise.all([
      prisma.evidence.findMany({
        where,
        include: {
          tasks: { include: { task: { select: { id: true, title: true, status: true } } } },
          projects: { include: { project: { select: { id: true, name: true, slug: true } } } },
          learningItems: { include: { learningItem: { select: { id: true, title: true, type: true } } } },
          skills: { include: { skill: { select: { id: true, name: true, currentLevel: true } } } },
        },
        orderBy: { date: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.evidence.count({ where }),
    ]);

    return {
      items: items.map((i) => this.formatEvidence(i)),
      total,
      page,
      pageSize,
    };
  }

  async getEvidenceById(id: string, userId: string): Promise<EvidenceDto> {
    const item = await prisma.evidence.findFirst({
      where: { id, userId },
      include: {
        tasks: { include: { task: { select: { id: true, title: true, status: true } } } },
        projects: { include: { project: { select: { id: true, name: true, slug: true } } } },
        learningItems: { include: { learningItem: { select: { id: true, title: true, type: true } } } },
        skills: { include: { skill: { select: { id: true, name: true, currentLevel: true } } } },
      },
    });

    if (!item) {
      throw new NotFoundError('Evidence record not found');
    }

    return this.formatEvidence(item);
  }

  async createEvidence(userId: string, input: CreateEvidenceInput): Promise<EvidenceDto> {
    // Validate related entities belong to user
    if (input.taskId) {
      const task = await prisma.task.findFirst({ where: { id: input.taskId, userId } });
      if (!task) throw new ForbiddenError('Task not found or does not belong to user');
    }
    if (input.projectId) {
      const proj = await prisma.project.findFirst({ where: { id: input.projectId, userId } });
      if (!proj) throw new ForbiddenError('Project not found or does not belong to user');
    }
    if (input.learningItemId) {
      const li = await prisma.learningItem.findFirst({ where: { id: input.learningItemId, userId } });
      if (!li) throw new ForbiddenError('Learning item not found or does not belong to user');
    }
    if (input.skillId) {
      const skill = await prisma.skill.findFirst({ where: { id: input.skillId, userId } });
      if (!skill) throw new ForbiddenError('Skill not found or does not belong to user');
    }

    const dateVal = input.date ? new Date(input.date) : new Date();

    const created = await prisma.evidence.create({
      data: {
        userId,
        title: input.title,
        description: input.description ?? null,
        type: (input.type as EvidenceType) ?? EvidenceType.PROJECT,
        url: input.url ?? null,
        externalReference: input.externalReference ?? null,
        date: dateVal,
        tasks: input.taskId ? { create: { taskId: input.taskId } } : undefined,
        projects: input.projectId ? { create: { projectId: input.projectId } } : undefined,
        learningItems: input.learningItemId ? { create: { learningItemId: input.learningItemId } } : undefined,
        skills: input.skillId ? { create: { skillId: input.skillId } } : undefined,
      },
      include: {
        tasks: { include: { task: { select: { id: true, title: true, status: true } } } },
        projects: { include: { project: { select: { id: true, name: true, slug: true } } } },
        learningItems: { include: { learningItem: { select: { id: true, title: true, type: true } } } },
        skills: { include: { skill: { select: { id: true, name: true, currentLevel: true } } } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EVIDENCE_CREATED',
        entityType: 'EVIDENCE',
        entityId: created.id,
        metadata: { title: created.title, type: created.type },
      },
    });

    return this.formatEvidence(created);
  }

  async updateEvidence(id: string, userId: string, input: UpdateEvidenceInput): Promise<EvidenceDto> {
    const existing = await prisma.evidence.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new NotFoundError('Evidence record not found');
    }

    const updated = await prisma.evidence.update({
      where: { id },
      data: {
        title: input.title !== undefined ? input.title : existing.title,
        description: input.description !== undefined ? input.description : existing.description,
        type: input.type ? input.type : existing.type,
        url: input.url !== undefined ? input.url : existing.url,
        externalReference: input.externalReference !== undefined ? input.externalReference : existing.externalReference,
        date: input.date ? new Date(input.date) : existing.date,
      },
      include: {
        tasks: { include: { task: { select: { id: true, title: true, status: true } } } },
        projects: { include: { project: { select: { id: true, name: true, slug: true } } } },
        learningItems: { include: { learningItem: { select: { id: true, title: true, type: true } } } },
        skills: { include: { skill: { select: { id: true, name: true, currentLevel: true } } } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EVIDENCE_UPDATED',
        entityType: 'EVIDENCE',
        entityId: id,
        metadata: { title: updated.title },
      },
    });

    return this.formatEvidence(updated);
  }

  async deleteEvidence(id: string, userId: string): Promise<void> {
    const existing = await prisma.evidence.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new NotFoundError('Evidence record not found');
    }

    await prisma.evidence.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EVIDENCE_DELETED',
        entityType: 'EVIDENCE',
        entityId: id,
        metadata: { title: existing.title },
      },
    });
  }

  async linkTask(evidenceId: string, taskId: string, userId: string): Promise<EvidenceDto> {
    const evidence = await prisma.evidence.findFirst({ where: { id: evidenceId, userId } });
    if (!evidence) throw new NotFoundError('Evidence record not found');

    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new ForbiddenError('Task not found or does not belong to user');

    const existingLink = await prisma.evidenceTask.findUnique({
      where: { evidenceId_taskId: { evidenceId, taskId } },
    });
    if (existingLink) {
      throw new ConflictError('Evidence is already linked to this task');
    }

    await prisma.evidenceTask.create({
      data: { evidenceId, taskId },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EVIDENCE_LINKED',
        entityType: 'EVIDENCE',
        entityId: evidenceId,
        metadata: { linkedEntityType: 'TASK', linkedEntityId: taskId },
      },
    });

    return this.getEvidenceById(evidenceId, userId);
  }

  async unlinkTask(evidenceId: string, taskId: string, userId: string): Promise<EvidenceDto> {
    const evidence = await prisma.evidence.findFirst({ where: { id: evidenceId, userId } });
    if (!evidence) throw new NotFoundError('Evidence record not found');

    const existingLink = await prisma.evidenceTask.findUnique({
      where: { evidenceId_taskId: { evidenceId, taskId } },
    });
    if (!existingLink) throw new NotFoundError('Task link not found');

    await prisma.evidenceTask.delete({
      where: { evidenceId_taskId: { evidenceId, taskId } },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EVIDENCE_UNLINKED',
        entityType: 'EVIDENCE',
        entityId: evidenceId,
        metadata: { unlinkedEntityType: 'TASK', unlinkedEntityId: taskId },
      },
    });

    return this.getEvidenceById(evidenceId, userId);
  }

  async linkProject(evidenceId: string, projectId: string, userId: string): Promise<EvidenceDto> {
    const evidence = await prisma.evidence.findFirst({ where: { id: evidenceId, userId } });
    if (!evidence) throw new NotFoundError('Evidence record not found');

    const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) throw new ForbiddenError('Project not found or does not belong to user');

    const existingLink = await prisma.evidenceProject.findUnique({
      where: { evidenceId_projectId: { evidenceId, projectId } },
    });
    if (existingLink) throw new ConflictError('Evidence is already linked to this project');

    await prisma.evidenceProject.create({
      data: { evidenceId, projectId },
    });

    return this.getEvidenceById(evidenceId, userId);
  }

  async unlinkProject(evidenceId: string, projectId: string, userId: string): Promise<EvidenceDto> {
    const evidence = await prisma.evidence.findFirst({ where: { id: evidenceId, userId } });
    if (!evidence) throw new NotFoundError('Evidence record not found');

    const existingLink = await prisma.evidenceProject.findUnique({
      where: { evidenceId_projectId: { evidenceId, projectId } },
    });
    if (!existingLink) throw new NotFoundError('Project link not found');

    await prisma.evidenceProject.delete({
      where: { evidenceId_projectId: { evidenceId, projectId } },
    });

    return this.getEvidenceById(evidenceId, userId);
  }

  async linkLearningItem(evidenceId: string, learningItemId: string, userId: string): Promise<EvidenceDto> {
    const evidence = await prisma.evidence.findFirst({ where: { id: evidenceId, userId } });
    if (!evidence) throw new NotFoundError('Evidence record not found');

    const li = await prisma.learningItem.findFirst({ where: { id: learningItemId, userId } });
    if (!li) throw new ForbiddenError('Learning item not found or does not belong to user');

    const existingLink = await prisma.evidenceLearningItem.findUnique({
      where: { evidenceId_learningItemId: { evidenceId, learningItemId } },
    });
    if (existingLink) throw new ConflictError('Evidence is already linked to this learning item');

    await prisma.evidenceLearningItem.create({
      data: { evidenceId, learningItemId },
    });

    return this.getEvidenceById(evidenceId, userId);
  }

  async unlinkLearningItem(evidenceId: string, learningItemId: string, userId: string): Promise<EvidenceDto> {
    const evidence = await prisma.evidence.findFirst({ where: { id: evidenceId, userId } });
    if (!evidence) throw new NotFoundError('Evidence record not found');

    const existingLink = await prisma.evidenceLearningItem.findUnique({
      where: { evidenceId_learningItemId: { evidenceId, learningItemId } },
    });
    if (!existingLink) throw new NotFoundError('Learning item link not found');

    await prisma.evidenceLearningItem.delete({
      where: { evidenceId_learningItemId: { evidenceId, learningItemId } },
    });

    return this.getEvidenceById(evidenceId, userId);
  }

  async linkSkill(evidenceId: string, skillId: string, userId: string): Promise<EvidenceDto> {
    const evidence = await prisma.evidence.findFirst({ where: { id: evidenceId, userId } });
    if (!evidence) throw new NotFoundError('Evidence record not found');

    const skill = await prisma.skill.findFirst({ where: { id: skillId, userId } });
    if (!skill) throw new ForbiddenError('Skill not found or does not belong to user');

    const existingLink = await prisma.evidenceSkill.findUnique({
      where: { evidenceId_skillId: { evidenceId, skillId } },
    });
    if (existingLink) throw new ConflictError('Evidence is already linked to this skill');

    await prisma.evidenceSkill.create({
      data: { evidenceId, skillId },
    });

    return this.getEvidenceById(evidenceId, userId);
  }

  async unlinkSkill(evidenceId: string, skillId: string, userId: string): Promise<EvidenceDto> {
    const evidence = await prisma.evidence.findFirst({ where: { id: evidenceId, userId } });
    if (!evidence) throw new NotFoundError('Evidence record not found');

    const existingLink = await prisma.evidenceSkill.findUnique({
      where: { evidenceId_skillId: { evidenceId, skillId } },
    });
    if (!existingLink) throw new NotFoundError('Skill link not found');

    await prisma.evidenceSkill.delete({
      where: { evidenceId_skillId: { evidenceId, skillId } },
    });

    return this.getEvidenceById(evidenceId, userId);
  }
}
