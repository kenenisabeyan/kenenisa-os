import { prisma } from '../../lib/prisma.js';
import { LearningItemType, LearningItemStatus, SkillRelevance, Prisma } from '@prisma/client';
import {
  LearningItemDto,
  CreateLearningItemInput,
  UpdateLearningItemInput,
  LearningItemQuery,
  RecordLearningActivityInput,
  LinkLearningSkillInput,
  LearningMetricsDto,
  LearningActivityDto,
  LearningItemSkillDto,
  SkillDto,
} from '@kenenisa-os/shared';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';

export class LearningService {
  private formatLearningItem(item: {
    id: string;
    userId: string;
    projectId: string | null;
    title: string;
    description: string | null;
    type: LearningItemType;
    status: LearningItemStatus;
    source: string | null;
    url: string | null;
    estimatedMinutes: number;
    progressPercent: number;
    startedAt: Date | null;
    targetDate: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    project?: { id: string; name: string; slug: string } | null;
    skills?: {
      id: string;
      learningItemId: string;
      skillId: string;
      relevance: SkillRelevance;
      createdAt: Date;
      skill?: {
        id: string;
        userId: string;
        name: string;
        slug: string;
        description: string | null;
        category: string | null;
        currentLevel: string;
        targetLevel: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
      };
    }[];
    activities?: { minutes: number }[];
    _count?: { activities?: number; skills?: number };
  }): LearningItemDto {
    const totalLoggedMinutes = item.activities
      ? item.activities.reduce((acc, act) => acc + act.minutes, 0)
      : undefined;

    const skills: LearningItemSkillDto[] | undefined = item.skills
      ? item.skills.map((s) => ({
          id: s.id,
          learningItemId: s.learningItemId,
          skillId: s.skillId,
          relevance: s.relevance,
          createdAt: s.createdAt.toISOString(),
          skill: s.skill
            ? {
                id: s.skill.id,
                userId: s.skill.userId,
                name: s.skill.name,
                slug: s.skill.slug,
                description: s.skill.description ?? null,
                category: s.skill.category ?? null,
                currentLevel: s.skill.currentLevel as SkillDto['currentLevel'],
                targetLevel: s.skill.targetLevel as SkillDto['targetLevel'],
                status: s.skill.status as SkillDto['status'],
                createdAt: s.skill.createdAt.toISOString(),
                updatedAt: s.skill.updatedAt.toISOString(),
              }
            : undefined,
        }))
      : undefined;

    return {
      id: item.id,
      userId: item.userId,
      projectId: item.projectId ?? null,
      title: item.title,
      description: item.description ?? null,
      type: item.type,
      status: item.status,
      source: item.source ?? null,
      url: item.url ?? null,
      estimatedMinutes: item.estimatedMinutes,
      progressPercent: item.progressPercent,
      startedAt: item.startedAt ? item.startedAt.toISOString() : null,
      targetDate: item.targetDate ? item.targetDate.toISOString().split('T')[0] : null,
      completedAt: item.completedAt ? item.completedAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      project: item.project ? { id: item.project.id, name: item.project.name, slug: item.project.slug } : null,
      skills,
      totalLoggedMinutes,
      _count: item._count,
    };
  }

  async listLearningItems(
    userId: string,
    query: LearningItemQuery,
  ): Promise<{ items: LearningItemDto[]; total: number; page: number; pageSize: number }> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const skip = (page - 1) * pageSize;

    const where: Prisma.LearningItemWhereInput = { userId };
    if (query.status) {
      where.status = query.status;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.projectId) {
      where.projectId = query.projectId;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { source: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.learningItem.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, slug: true } },
          skills: {
            include: {
              skill: true,
            },
          },
          activities: { select: { minutes: true } },
          _count: { select: { activities: true, skills: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.learningItem.count({ where }),
    ]);

    return {
      items: items.map((item) => this.formatLearningItem(item)),
      total,
      page,
      pageSize,
    };
  }

  async getLearningItemById(id: string, userId: string): Promise<LearningItemDto> {
    const item = await prisma.learningItem.findFirst({
      where: { id, userId },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        skills: {
          include: {
            skill: true,
          },
        },
        activities: { select: { minutes: true } },
        _count: { select: { activities: true, skills: true } },
      },
    });

    if (!item) {
      throw new NotFoundError('Learning item not found');
    }

    return this.formatLearningItem(item);
  }

  async createLearningItem(userId: string, input: CreateLearningItemInput): Promise<LearningItemDto> {
    if (input.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: input.projectId, userId },
      });
      if (!project) {
        throw new BadRequestError('Referenced project not found or does not belong to user');
      }
    }

    const created = await prisma.learningItem.create({
      data: {
        userId,
        projectId: input.projectId ?? null,
        title: input.title,
        description: input.description ?? null,
        type: (input.type as LearningItemType) ?? LearningItemType.COURSE,
        status: (input.status as LearningItemStatus) ?? LearningItemStatus.NOT_STARTED,
        source: input.source ?? null,
        url: input.url ?? null,
        estimatedMinutes: input.estimatedMinutes ?? 0,
        targetDate: input.targetDate ? new Date(input.targetDate) : null,
      },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        skills: { include: { skill: true } },
        activities: { select: { minutes: true } },
        _count: { select: { activities: true, skills: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LEARNING_ITEM_CREATED',
        entityType: 'LEARNING_ITEM',
        entityId: created.id,
        metadata: { title: created.title, type: created.type },
      },
    });

    return this.formatLearningItem(created);
  }

  async updateLearningItem(id: string, userId: string, input: UpdateLearningItemInput): Promise<LearningItemDto> {
    const existing = await prisma.learningItem.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundError('Learning item not found');
    }

    if (input.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: input.projectId, userId },
      });
      if (!project) {
        throw new BadRequestError('Referenced project not found or does not belong to user');
      }
    }

    const updated = await prisma.learningItem.update({
      where: { id },
      data: {
        projectId: input.projectId !== undefined ? input.projectId : existing.projectId,
        title: input.title !== undefined ? input.title : existing.title,
        description: input.description !== undefined ? input.description : existing.description,
        type: input.type ? input.type : existing.type,
        status: input.status ? input.status : existing.status,
        source: input.source !== undefined ? input.source : existing.source,
        url: input.url !== undefined ? input.url : existing.url,
        estimatedMinutes: input.estimatedMinutes !== undefined ? input.estimatedMinutes : existing.estimatedMinutes,
        progressPercent: input.progressPercent !== undefined ? input.progressPercent : existing.progressPercent,
        targetDate: input.targetDate !== undefined ? (input.targetDate ? new Date(input.targetDate) : null) : existing.targetDate,
      },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        skills: { include: { skill: true } },
        activities: { select: { minutes: true } },
        _count: { select: { activities: true, skills: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LEARNING_ITEM_UPDATED',
        entityType: 'LEARNING_ITEM',
        entityId: id,
      },
    });

    return this.formatLearningItem(updated);
  }

  async startLearningItem(id: string, userId: string): Promise<LearningItemDto> {
    const existing = await prisma.learningItem.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundError('Learning item not found');
    }

    const updated = await prisma.learningItem.update({
      where: { id },
      data: {
        status: LearningItemStatus.IN_PROGRESS,
        startedAt: existing.startedAt ?? new Date(),
      },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        skills: { include: { skill: true } },
        activities: { select: { minutes: true } },
        _count: { select: { activities: true, skills: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LEARNING_ITEM_STARTED',
        entityType: 'LEARNING_ITEM',
        entityId: id,
      },
    });

    return this.formatLearningItem(updated);
  }

  async pauseLearningItem(id: string, userId: string): Promise<LearningItemDto> {
    const existing = await prisma.learningItem.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundError('Learning item not found');
    }

    const updated = await prisma.learningItem.update({
      where: { id },
      data: { status: LearningItemStatus.PAUSED },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        skills: { include: { skill: true } },
        activities: { select: { minutes: true } },
        _count: { select: { activities: true, skills: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LEARNING_ITEM_PAUSED',
        entityType: 'LEARNING_ITEM',
        entityId: id,
      },
    });

    return this.formatLearningItem(updated);
  }

  async completeLearningItem(id: string, userId: string): Promise<LearningItemDto> {
    const existing = await prisma.learningItem.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundError('Learning item not found');
    }

    const updated = await prisma.learningItem.update({
      where: { id },
      data: {
        status: LearningItemStatus.COMPLETED,
        progressPercent: 100,
        completedAt: new Date(),
      },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        skills: { include: { skill: true } },
        activities: { select: { minutes: true } },
        _count: { select: { activities: true, skills: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LEARNING_ITEM_COMPLETED',
        entityType: 'LEARNING_ITEM',
        entityId: id,
      },
    });

    return this.formatLearningItem(updated);
  }

  async reopenLearningItem(id: string, userId: string): Promise<LearningItemDto> {
    const existing = await prisma.learningItem.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundError('Learning item not found');
    }

    const updated = await prisma.learningItem.update({
      where: { id },
      data: {
        status: LearningItemStatus.IN_PROGRESS,
        completedAt: null,
      },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        skills: { include: { skill: true } },
        activities: { select: { minutes: true } },
        _count: { select: { activities: true, skills: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LEARNING_ITEM_REOPENED',
        entityType: 'LEARNING_ITEM',
        entityId: id,
      },
    });

    return this.formatLearningItem(updated);
  }

  async recordActivity(
    id: string,
    userId: string,
    input: RecordLearningActivityInput,
  ): Promise<LearningActivityDto> {
    const item = await prisma.learningItem.findFirst({
      where: { id, userId },
    });
    if (!item) {
      throw new NotFoundError('Learning item not found');
    }

    const activityDate = input.date ? new Date(input.date) : new Date();

    const created = await prisma.learningActivity.create({
      data: {
        userId,
        learningItemId: id,
        date: activityDate,
        minutes: input.minutes,
        notes: input.notes ?? null,
      },
    });

    // Automatically transition to IN_PROGRESS if currently NOT_STARTED
    if (item.status === LearningItemStatus.NOT_STARTED) {
      await prisma.learningItem.update({
        where: { id },
        data: {
          status: LearningItemStatus.IN_PROGRESS,
          startedAt: new Date(),
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LEARNING_ACTIVITY_CREATED',
        entityType: 'LEARNING_ACTIVITY',
        entityId: created.id,
        metadata: { learningItemId: id, minutes: input.minutes },
      },
    });

    return {
      id: created.id,
      userId: created.userId,
      learningItemId: created.learningItemId,
      date: created.date.toISOString(),
      minutes: created.minutes,
      notes: created.notes ?? null,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async linkSkill(
    id: string,
    userId: string,
    input: LinkLearningSkillInput,
  ): Promise<LearningItemSkillDto> {
    const [item, skill] = await Promise.all([
      prisma.learningItem.findFirst({ where: { id, userId } }),
      prisma.skill.findFirst({ where: { id: input.skillId, userId } }),
    ]);

    if (!item) throw new NotFoundError('Learning item not found');
    if (!skill) throw new NotFoundError('Skill not found');

    const created = await prisma.learningItemSkill.upsert({
      where: {
        learningItemId_skillId: {
          learningItemId: id,
          skillId: input.skillId,
        },
      },
      create: {
        learningItemId: id,
        skillId: input.skillId,
        relevance: (input.relevance as SkillRelevance) ?? SkillRelevance.PRIMARY,
      },
      update: {
        relevance: (input.relevance as SkillRelevance) ?? SkillRelevance.PRIMARY,
      },
      include: {
        skill: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LEARNING_SKILL_LINKED',
        entityType: 'LEARNING_ITEM_SKILL',
        entityId: created.id,
        metadata: { learningItemId: id, skillId: input.skillId },
      },
    });

    return {
      id: created.id,
      learningItemId: created.learningItemId,
      skillId: created.skillId,
      relevance: created.relevance,
      createdAt: created.createdAt.toISOString(),
      skill: created.skill
        ? {
            id: created.skill.id,
            userId: created.skill.userId,
            name: created.skill.name,
            slug: created.skill.slug,
            description: created.skill.description ?? null,
            category: created.skill.category ?? null,
            currentLevel: created.skill.currentLevel,
            targetLevel: created.skill.targetLevel,
            status: created.skill.status,
            createdAt: created.skill.createdAt.toISOString(),
            updatedAt: created.skill.updatedAt.toISOString(),
          }
        : undefined,
    };
  }

  async unlinkSkill(id: string, userId: string, skillId: string): Promise<void> {
    const item = await prisma.learningItem.findFirst({
      where: { id, userId },
    });
    if (!item) throw new NotFoundError('Learning item not found');

    const existing = await prisma.learningItemSkill.findUnique({
      where: {
        learningItemId_skillId: {
          learningItemId: id,
          skillId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Learning-skill link not found');
    }

    await prisma.learningItemSkill.delete({
      where: { id: existing.id },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LEARNING_SKILL_UNLINKED',
        entityType: 'LEARNING_ITEM_SKILL',
        entityId: existing.id,
        metadata: { learningItemId: id, skillId },
      },
    });
  }

  async getMetrics(userId: string): Promise<LearningMetricsDto> {
    const [totalItems, inProgressItems, completedItems, activitiesSum, activeSkillsCount, linkedProjectsCount] =
      await Promise.all([
        prisma.learningItem.count({ where: { userId } }),
        prisma.learningItem.count({ where: { userId, status: LearningItemStatus.IN_PROGRESS } }),
        prisma.learningItem.count({ where: { userId, status: LearningItemStatus.COMPLETED } }),
        prisma.learningActivity.aggregate({
          where: { userId },
          _sum: { minutes: true },
        }),
        prisma.skill.count({ where: { userId, status: 'ACTIVE' } }),
        prisma.learningItem.count({
          where: { userId, projectId: { not: null } },
        }),
      ]);

    return {
      totalItems,
      inProgressItems,
      completedItems,
      totalLoggedMinutes: activitiesSum._sum.minutes ?? 0,
      activeSkillsCount,
      linkedProjectsCount,
    };
  }
}
