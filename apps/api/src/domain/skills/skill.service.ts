import { prisma } from '../../lib/prisma.js';
import { SkillLevel, SkillStatus, Prisma } from '@prisma/client';
import {
  SkillDto,
  SkillDetailDto,
  CreateSkillInput,
  UpdateSkillInput,
  SkillQuery,
  LearningItemDto,
} from '@kenenisa-os/shared';
import { NotFoundError, ConflictError } from '../../utils/errors.js';

export class SkillService {
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private formatSkill(skill: {
    id: string;
    userId: string;
    name: string;
    slug: string;
    description: string | null;
    category: string | null;
    currentLevel: SkillLevel;
    targetLevel: SkillLevel;
    status: SkillStatus;
    createdAt: Date;
    updatedAt: Date;
    _count?: { learningItems?: number };
  }): SkillDto {
    return {
      id: skill.id,
      userId: skill.userId,
      name: skill.name,
      slug: skill.slug,
      description: skill.description ?? null,
      category: skill.category ?? null,
      currentLevel: skill.currentLevel,
      targetLevel: skill.targetLevel,
      status: skill.status,
      createdAt: skill.createdAt.toISOString(),
      updatedAt: skill.updatedAt.toISOString(),
      _count: skill._count,
    };
  }

  async listSkills(userId: string, query: SkillQuery): Promise<{ items: SkillDto[]; total: number; page: number; pageSize: number }> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const skip = (page - 1) * pageSize;

    const where: Prisma.SkillWhereInput = { userId };
    if (query.status) {
      where.status = query.status;
    }
    if (query.category) {
      where.category = { contains: query.category, mode: 'insensitive' };
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        include: {
          _count: { select: { learningItems: true } },
        },
        orderBy: { name: 'asc' },
        skip,
        take: pageSize,
      }),
      prisma.skill.count({ where }),
    ]);

    return {
      items: items.map((item) => this.formatSkill(item)),
      total,
      page,
      pageSize,
    };
  }

  async getSkillById(id: string, userId: string): Promise<SkillDetailDto> {
    const item = await prisma.skill.findFirst({
      where: { id, userId },
      include: {
        _count: { select: { learningItems: true } },
        learningItems: {
          include: {
            learningItem: {
              include: {
                project: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundError('Skill not found');
    }

    const formattedLearningItems: LearningItemDto[] = item.learningItems.map((lis) => {
      const li = lis.learningItem;
      return {
        id: li.id,
        userId: li.userId,
        projectId: li.projectId ?? null,
        title: li.title,
        description: li.description ?? null,
        type: li.type,
        status: li.status,
        source: li.source ?? null,
        url: li.url ?? null,
        estimatedMinutes: li.estimatedMinutes,
        progressPercent: li.progressPercent,
        startedAt: li.startedAt ? li.startedAt.toISOString() : null,
        targetDate: li.targetDate ? li.targetDate.toISOString().split('T')[0] : null,
        completedAt: li.completedAt ? li.completedAt.toISOString() : null,
        createdAt: li.createdAt.toISOString(),
        updatedAt: li.updatedAt.toISOString(),
        project: li.project ? { id: li.project.id, name: li.project.name, slug: li.project.slug } : null,
      };
    });

    // Derive applied projects from linked learning items that belong to projects
    const projectMap = new Map<string, { id: string; name: string; slug: string }>();
    item.learningItems.forEach((lis) => {
      if (lis.learningItem.project) {
        projectMap.set(lis.learningItem.project.id, lis.learningItem.project);
      }
    });

    return {
      ...this.formatSkill(item),
      learningItems: formattedLearningItems,
      appliedProjects: Array.from(projectMap.values()),
    };
  }

  async createSkill(userId: string, input: CreateSkillInput): Promise<SkillDto> {
    const slug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);

    const existing = await prisma.skill.findFirst({
      where: { userId, slug },
    });
    if (existing) {
      throw new ConflictError(`A skill with slug "${slug}" already exists`);
    }

    const created = await prisma.skill.create({
      data: {
        userId,
        name: input.name,
        slug,
        description: input.description ?? null,
        category: input.category ?? null,
        currentLevel: (input.currentLevel as SkillLevel) ?? SkillLevel.BEGINNER,
        targetLevel: (input.targetLevel as SkillLevel) ?? SkillLevel.ADVANCED,
        status: (input.status as SkillStatus) ?? SkillStatus.ACTIVE,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SKILL_CREATED',
        entityType: 'SKILL',
        entityId: created.id,
        metadata: { name: created.name, slug: created.slug },
      },
    });

    return this.formatSkill(created);
  }

  async updateSkill(id: string, userId: string, input: UpdateSkillInput): Promise<SkillDto> {
    const existing = await prisma.skill.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundError('Skill not found');
    }

    const isLevelChange =
      (input.currentLevel && input.currentLevel !== existing.currentLevel) ||
      (input.targetLevel && input.targetLevel !== existing.targetLevel);

    const updated = await prisma.skill.update({
      where: { id },
      data: {
        name: input.name !== undefined ? input.name : existing.name,
        description: input.description !== undefined ? input.description : existing.description,
        category: input.category !== undefined ? input.category : existing.category,
        currentLevel: input.currentLevel ? input.currentLevel : existing.currentLevel,
        targetLevel: input.targetLevel ? input.targetLevel : existing.targetLevel,
        status: input.status ? input.status : existing.status,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: isLevelChange ? 'SKILL_LEVEL_CHANGED' : 'SKILL_UPDATED',
        entityType: 'SKILL',
        entityId: id,
        metadata: {
          previousCurrentLevel: existing.currentLevel,
          newCurrentLevel: updated.currentLevel,
        },
      },
    });

    return this.formatSkill(updated);
  }

  async archiveSkill(id: string, userId: string): Promise<SkillDto> {
    return this.updateSkill(id, userId, { status: 'ARCHIVED' });
  }
}
