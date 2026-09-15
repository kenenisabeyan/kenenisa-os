import { prisma } from '../../lib/prisma.js';
import { OpportunityType, OpportunityStatus, TaskPriority, OpportunitySource, SkillRelevance, Prisma } from '@prisma/client';
import {
  OpportunityDto,
  OpportunityDetailDto,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  OpportunityQuery,
  OpportunityFollowUpsDto,
  OpportunityDeadlinesDto,
  OpportunityAnalyticsDto,
  OpportunityActivityDto,
} from '@kenenisa-os/shared';
import { NotFoundError, ForbiddenError, ConflictError } from '../../utils/errors.js';

type OpportunityRecord = {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  type: OpportunityType;
  status: OpportunityStatus;
  priority: TaskPriority;
  organizationName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  source: OpportunitySource;
  sourceUrl?: string | null;
  location?: string | null;
  remote: boolean;
  estimatedValue?: Prisma.Decimal | number | null;
  currency: string;
  startDate?: Date | null;
  deadline?: Date | null;
  followUpDate?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date | null;
  _count?: {
    skills?: number;
    projects?: number;
    evidence?: number;
    tasks?: number;
    activities?: number;
  };
};

type OpportunityActivityRecord = Prisma.OpportunityActivityGetPayload<Record<string, never>>;

export class OpportunityService {
  private formatOpportunity(op: OpportunityRecord): OpportunityDto {
    return {
      id: op.id,
      userId: op.userId,
      title: op.title,
      description: op.description ?? null,
      type: op.type,
      status: op.status,
      priority: op.priority,
      organizationName: op.organizationName ?? null,
      contactName: op.contactName ?? null,
      contactEmail: op.contactEmail ?? null,
      source: op.source,
      sourceUrl: op.sourceUrl ?? null,
      location: op.location ?? null,
      remote: op.remote,
      estimatedValue: op.estimatedValue ? Number(op.estimatedValue) : null,
      currency: op.currency,
      startDate: op.startDate ? op.startDate.toISOString() : null,
      deadline: op.deadline ? op.deadline.toISOString() : null,
      followUpDate: op.followUpDate ? op.followUpDate.toISOString() : null,
      notes: op.notes ?? null,
      createdAt: op.createdAt.toISOString(),
      updatedAt: op.updatedAt.toISOString(),
      closedAt: op.closedAt ? op.closedAt.toISOString() : null,
      _count: op._count
        ? {
            skills: op._count.skills,
            projects: op._count.projects,
            evidence: op._count.evidence,
            tasks: op._count.tasks,
            activities: op._count.activities,
          }
        : undefined,
    };
  }

  private formatActivity(act: OpportunityActivityRecord): OpportunityActivityDto {
    return {
      id: act.id,
      opportunityId: act.opportunityId,
      userId: act.userId,
      type: act.type,
      title: act.title,
      description: act.description ?? null,
      occurredAt: act.occurredAt.toISOString(),
      createdAt: act.createdAt.toISOString(),
    };
  }

  async listOpportunities(
    userId: string,
    query: OpportunityQuery
  ): Promise<{ items: OpportunityDto[]; total: number; page: number; pageSize: number }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.OpportunityWhereInput = {
      userId,
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
      ...(query.priority && { priority: query.priority }),
      ...(query.source && { source: query.source }),
      ...(query.remote !== undefined && { remote: query.remote }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { organizationName: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { contactName: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }],
        include: {
          _count: {
            select: {
              skills: true,
              projects: true,
              evidence: true,
              tasks: true,
              activities: true,
            },
          },
        },
      }),
      prisma.opportunity.count({ where }),
    ]);

    return {
      items: items.map((i) => this.formatOpportunity(i)),
      total,
      page,
      pageSize,
    };
  }

  async getOpportunityById(id: string, userId: string): Promise<OpportunityDetailDto> {
    const op = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        projects: {
          include: {
            project: {
              select: { id: true, name: true, slug: true, status: true },
            },
          },
        },
        evidence: {
          include: {
            evidence: true,
          },
        },
        tasks: {
          include: {
            task: true,
          },
        },
        activities: {
          orderBy: { occurredAt: 'desc' },
        },
        _count: {
          select: {
            skills: true,
            projects: true,
            evidence: true,
            tasks: true,
            activities: true,
          },
        },
      },
    });

    if (!op) {
      throw new NotFoundError(`Opportunity not found: ${id}`);
    }
    if (op.userId !== userId) {
      throw new ForbiddenError('You do not have access to this opportunity');
    }

    const base = this.formatOpportunity(op);

    return {
      ...base,
      skills: op.skills.map((s) => ({
        id: s.id,
        opportunityId: s.opportunityId,
        skillId: s.skillId,
        relevance: s.relevance,
        createdAt: s.createdAt.toISOString(),
        skill: s.skill
          ? {
              id: s.skill.id,
              userId: s.skill.userId,
              name: s.skill.name,
              slug: s.skill.slug,
              description: s.skill.description,
              category: s.skill.category,
              currentLevel: s.skill.currentLevel,
              targetLevel: s.skill.targetLevel,
              status: s.skill.status,
              createdAt: s.skill.createdAt.toISOString(),
              updatedAt: s.skill.updatedAt.toISOString(),
            }
          : undefined,
      })),
      projects: op.projects.map((p) => ({
        id: p.id,
        opportunityId: p.opportunityId,
        projectId: p.projectId,
        createdAt: p.createdAt.toISOString(),
        project: p.project ?? undefined,
      })),
      evidence: op.evidence.map((e) => ({
        id: e.id,
        opportunityId: e.opportunityId,
        evidenceId: e.evidenceId,
        createdAt: e.createdAt.toISOString(),
        evidence: e.evidence
          ? {
              id: e.evidence.id,
              userId: e.evidence.userId,
              title: e.evidence.title,
              description: e.evidence.description,
              type: e.evidence.type,
              url: e.evidence.url,
              externalReference: e.evidence.externalReference,
              date: e.evidence.date.toISOString(),
              verified: e.evidence.verified,
              createdAt: e.evidence.createdAt.toISOString(),
              updatedAt: e.evidence.updatedAt.toISOString(),
            }
          : undefined,
      })),
      tasks: op.tasks.map((t) => ({
        id: t.id,
        opportunityId: t.opportunityId,
        taskId: t.taskId,
        createdAt: t.createdAt.toISOString(),
        task: t.task
          ? {
              id: t.task.id,
              userId: t.task.userId,
              projectId: t.task.projectId,
              milestoneId: t.task.milestoneId,
              parentTaskId: t.task.parentTaskId,
              title: t.task.title,
              description: t.task.description,
              status: t.task.status,
              priority: t.task.priority,
              estimateMinutes: t.task.estimateMinutes,
              actualMinutes: t.task.actualMinutes,
              startDate: t.task.startDate ? t.task.startDate.toISOString() : null,
              dueDate: t.task.dueDate ? t.task.dueDate.toISOString() : null,
              completedAt: t.task.completedAt ? t.task.completedAt.toISOString() : null,
              sortOrder: t.task.sortOrder,
              createdAt: t.task.createdAt.toISOString(),
              updatedAt: t.task.updatedAt.toISOString(),
            }
          : undefined,
      })),
      activities: op.activities.map((a) => this.formatActivity(a)),
    };
  }

  async createOpportunity(userId: string, input: CreateOpportunityInput): Promise<OpportunityDto> {
    const op = await prisma.opportunity.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        type: input.type || 'FULL_TIME',
        status: input.status || 'DISCOVERED',
        priority: input.priority || 'P2',
        organizationName: input.organizationName,
        contactName: input.contactName,
        contactEmail: input.contactEmail || null,
        source: input.source || 'OTHER',
        sourceUrl: input.sourceUrl || null,
        location: input.location,
        remote: input.remote ?? false,
        estimatedValue: input.estimatedValue ? new Prisma.Decimal(input.estimatedValue) : null,
        currency: input.currency || 'USD',
        startDate: input.startDate ? new Date(input.startDate) : null,
        deadline: input.deadline ? new Date(input.deadline) : null,
        followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
        notes: input.notes,
        activities: {
          create: {
            userId,
            type: 'STATUS_CHANGE',
            title: `Opportunity created as ${input.status || 'DISCOVERED'}`,
            description: input.description || undefined,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        entityType: 'Opportunity',
        entityId: op.id,
        action: 'OPPORTUNITY_CREATED',
        metadata: { title: op.title, type: op.type, status: op.status },
      },
    });

    return this.formatOpportunity(op);
  }

  async updateOpportunity(
    id: string,
    userId: string,
    input: UpdateOpportunityInput
  ): Promise<OpportunityDto> {
    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError(`Opportunity not found: ${id}`);
    if (existing.userId !== userId) throw new ForbiddenError('Access denied');

    const data: Prisma.OpportunityUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.type !== undefined) data.type = input.type;
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.organizationName !== undefined) data.organizationName = input.organizationName;
    if (input.contactName !== undefined) data.contactName = input.contactName;
    if (input.contactEmail !== undefined) data.contactEmail = input.contactEmail || null;
    if (input.source !== undefined) data.source = input.source;
    if (input.sourceUrl !== undefined) data.sourceUrl = input.sourceUrl || null;
    if (input.location !== undefined) data.location = input.location;
    if (input.remote !== undefined) data.remote = input.remote;
    if (input.estimatedValue !== undefined)
      data.estimatedValue = input.estimatedValue ? new Prisma.Decimal(input.estimatedValue) : null;
    if (input.currency !== undefined) data.currency = input.currency;
    if (input.startDate !== undefined)
      data.startDate = input.startDate ? new Date(input.startDate) : null;
    if (input.deadline !== undefined)
      data.deadline = input.deadline ? new Date(input.deadline) : null;
    if (input.followUpDate !== undefined)
      data.followUpDate = input.followUpDate ? new Date(input.followUpDate) : null;
    if (input.notes !== undefined) data.notes = input.notes;

    const updated = await prisma.opportunity.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId,
        entityType: 'Opportunity',
        entityId: id,
        action: 'OPPORTUNITY_UPDATED',
        metadata: { title: updated.title },
      },
    });

    return this.formatOpportunity(updated);
  }

  async transitionStatus(
    id: string,
    userId: string,
    newStatus: OpportunityStatus
  ): Promise<OpportunityDto> {
    const op = await prisma.opportunity.findUnique({ where: { id } });
    if (!op) throw new NotFoundError(`Opportunity not found: ${id}`);
    if (op.userId !== userId) throw new ForbiddenError('Access denied');

    const terminalStatuses: OpportunityStatus[] = ['REJECTED', 'WITHDRAWN', 'EXPIRED', 'ARCHIVED', 'COMPLETED'];
    const isTerminal = terminalStatuses.includes(newStatus);

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        status: newStatus,
        closedAt: isTerminal ? new Date() : null,
        activities: {
          create: {
            userId,
            type: 'STATUS_CHANGE',
            title: `Status changed to ${newStatus}`,
            description: `Transitioned from ${op.status} to ${newStatus}`,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        entityType: 'Opportunity',
        entityId: id,
        action: 'OPPORTUNITY_STATUS_CHANGED',
        metadata: { from: op.status, to: newStatus },
      },
    });

    return this.formatOpportunity(updated);
  }

  async linkSkill(
    id: string,
    userId: string,
    skillId: string,
    relevance: SkillRelevance = 'PRIMARY'
  ): Promise<OpportunityDetailDto> {
    const [op, skill] = await Promise.all([
      prisma.opportunity.findUnique({ where: { id } }),
      prisma.skill.findUnique({ where: { id: skillId } }),
    ]);

    if (!op) throw new NotFoundError(`Opportunity not found: ${id}`);
    if (!skill) throw new NotFoundError(`Skill not found: ${skillId}`);
    if (op.userId !== userId || skill.userId !== userId) {
      throw new ForbiddenError('Cross-user relationship not allowed');
    }

    const existing = await prisma.opportunitySkill.findUnique({
      where: { opportunityId_skillId: { opportunityId: id, skillId } },
    });
    if (existing) throw new ConflictError('Skill is already linked to this opportunity');

    await prisma.opportunitySkill.create({
      data: { opportunityId: id, skillId, relevance },
    });

    return this.getOpportunityById(id, userId);
  }

  async unlinkSkill(id: string, userId: string, skillId: string): Promise<OpportunityDetailDto> {
    const op = await prisma.opportunity.findUnique({ where: { id } });
    if (!op) throw new NotFoundError(`Opportunity not found: ${id}`);
    if (op.userId !== userId) throw new ForbiddenError('Access denied');

    await prisma.opportunitySkill.deleteMany({
      where: { opportunityId: id, skillId },
    });

    return this.getOpportunityById(id, userId);
  }

  async linkProject(id: string, userId: string, projectId: string): Promise<OpportunityDetailDto> {
    const [op, project] = await Promise.all([
      prisma.opportunity.findUnique({ where: { id } }),
      prisma.project.findUnique({ where: { id: projectId } }),
    ]);

    if (!op) throw new NotFoundError(`Opportunity not found: ${id}`);
    if (!project) throw new NotFoundError(`Project not found: ${projectId}`);
    if (op.userId !== userId || project.userId !== userId) {
      throw new ForbiddenError('Cross-user relationship not allowed');
    }

    const existing = await prisma.opportunityProject.findUnique({
      where: { opportunityId_projectId: { opportunityId: id, projectId } },
    });
    if (existing) throw new ConflictError('Project is already linked to this opportunity');

    await prisma.opportunityProject.create({
      data: { opportunityId: id, projectId },
    });

    return this.getOpportunityById(id, userId);
  }

  async unlinkProject(id: string, userId: string, projectId: string): Promise<OpportunityDetailDto> {
    const op = await prisma.opportunity.findUnique({ where: { id } });
    if (!op) throw new NotFoundError(`Opportunity not found: ${id}`);
    if (op.userId !== userId) throw new ForbiddenError('Access denied');

    await prisma.opportunityProject.deleteMany({
      where: { opportunityId: id, projectId },
    });

    return this.getOpportunityById(id, userId);
  }

  async linkEvidence(id: string, userId: string, evidenceId: string): Promise<OpportunityDetailDto> {
    const [op, evidence] = await Promise.all([
      prisma.opportunity.findUnique({ where: { id } }),
      prisma.evidence.findUnique({ where: { id: evidenceId } }),
    ]);

    if (!op) throw new NotFoundError(`Opportunity not found: ${id}`);
    if (!evidence) throw new NotFoundError(`Evidence not found: ${evidenceId}`);
    if (op.userId !== userId || evidence.userId !== userId) {
      throw new ForbiddenError('Cross-user relationship not allowed');
    }

    const existing = await prisma.opportunityEvidence.findUnique({
      where: { opportunityId_evidenceId: { opportunityId: id, evidenceId } },
    });
    if (existing) throw new ConflictError('Evidence is already linked to this opportunity');

    await prisma.opportunityEvidence.create({
      data: { opportunityId: id, evidenceId },
    });

    return this.getOpportunityById(id, userId);
  }

  async unlinkEvidence(id: string, userId: string, evidenceId: string): Promise<OpportunityDetailDto> {
    const op = await prisma.opportunity.findUnique({ where: { id } });
    if (!op) throw new NotFoundError(`Opportunity not found: ${id}`);
    if (op.userId !== userId) throw new ForbiddenError('Access denied');

    await prisma.opportunityEvidence.deleteMany({
      where: { opportunityId: id, evidenceId },
    });

    return this.getOpportunityById(id, userId);
  }

  async linkTask(id: string, userId: string, taskId: string): Promise<OpportunityDetailDto> {
    const [op, task] = await Promise.all([
      prisma.opportunity.findUnique({ where: { id } }),
      prisma.task.findUnique({ where: { id: taskId } }),
    ]);

    if (!op) throw new NotFoundError(`Opportunity not found: ${id}`);
    if (!task) throw new NotFoundError(`Task not found: ${taskId}`);
    if (op.userId !== userId || task.userId !== userId) {
      throw new ForbiddenError('Cross-user relationship not allowed');
    }

    const existing = await prisma.opportunityTask.findUnique({
      where: { opportunityId_taskId: { opportunityId: id, taskId } },
    });
    if (existing) throw new ConflictError('Task is already linked to this opportunity');

    await prisma.opportunityTask.create({
      data: { opportunityId: id, taskId },
    });

    return this.getOpportunityById(id, userId);
  }

  async unlinkTask(id: string, userId: string, taskId: string): Promise<OpportunityDetailDto> {
    const op = await prisma.opportunity.findUnique({ where: { id } });
    if (!op) throw new NotFoundError(`Opportunity not found: ${id}`);
    if (op.userId !== userId) throw new ForbiddenError('Access denied');

    await prisma.opportunityTask.deleteMany({
      where: { opportunityId: id, taskId },
    });

    return this.getOpportunityById(id, userId);
  }

  async createActivity(
    id: string,
    userId: string,
    input: { type?: Prisma.OpportunityActivityGetPayload<Record<string, never>>['type']; title: string; description?: string | null; occurredAt?: string }
  ): Promise<OpportunityActivityDto> {
    const op = await prisma.opportunity.findUnique({ where: { id } });
    if (!op) throw new NotFoundError(`Opportunity not found: ${id}`);
    if (op.userId !== userId) throw new ForbiddenError('Access denied');

    const act = await prisma.opportunityActivity.create({
      data: {
        opportunityId: id,
        userId,
        type: input.type || 'NOTE',
        title: input.title,
        description: input.description,
        occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date(),
      },
    });

    return this.formatActivity(act);
  }

  async getFollowUps(userId: string): Promise<OpportunityFollowUpsDto> {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const ops = await prisma.opportunity.findMany({
      where: {
        userId,
        followUpDate: { not: null },
        status: { notIn: ['COMPLETED', 'REJECTED', 'WITHDRAWN', 'EXPIRED', 'ARCHIVED'] },
      },
      orderBy: { followUpDate: 'asc' },
    });

    const overdue: OpportunityDto[] = [];
    const today: OpportunityDto[] = [];
    const upcoming: OpportunityDto[] = [];

    ops.forEach((o) => {
      if (!o.followUpDate) return;
      const dateStr = o.followUpDate.toISOString().split('T')[0];
      const dto = this.formatOpportunity(o);
      if (dateStr < todayStr) {
        overdue.push(dto);
      } else if (dateStr === todayStr) {
        today.push(dto);
      } else {
        upcoming.push(dto);
      }
    });

    return { overdue, today, upcoming };
  }

  async getDeadlines(userId: string): Promise<OpportunityDeadlinesDto> {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const ops = await prisma.opportunity.findMany({
      where: {
        userId,
        deadline: { not: null },
        status: { notIn: ['COMPLETED', 'REJECTED', 'WITHDRAWN', 'EXPIRED', 'ARCHIVED'] },
      },
      orderBy: { deadline: 'asc' },
    });

    const overdue: OpportunityDto[] = [];
    const today: OpportunityDto[] = [];
    const next7Days: OpportunityDto[] = [];
    const next30Days: OpportunityDto[] = [];

    ops.forEach((o) => {
      if (!o.deadline) return;
      const dateStr = o.deadline.toISOString().split('T')[0];
      const dto = this.formatOpportunity(o);
      if (dateStr < todayStr) {
        overdue.push(dto);
      } else if (dateStr === todayStr) {
        today.push(dto);
      } else if (dateStr <= in7) {
        next7Days.push(dto);
      } else if (dateStr <= in30) {
        next30Days.push(dto);
      }
    });

    return { overdue, today, next7Days, next30Days };
  }

  async getOpportunityAnalytics(userId: string): Promise<OpportunityAnalyticsDto> {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const ops = await prisma.opportunity.findMany({
      where: { userId },
      select: {
        status: true,
        type: true,
        followUpDate: true,
      },
    });

    const totalOpportunities = ops.length;
    const activeOpportunities = ops.filter((o) =>
      ['DISCOVERED', 'EVALUATING', 'PREPARING', 'APPLIED', 'IN_DISCUSSION', 'INTERVIEW', 'OFFERED', 'ACCEPTED', 'ACTIVE'].includes(
        o.status
      )
    ).length;

    const appliedOpportunities = ops.filter((o) => o.status === 'APPLIED').length;
    const interviews = ops.filter((o) => o.status === 'INTERVIEW').length;
    const offers = ops.filter((o) => o.status === 'OFFERED').length;
    const accepted = ops.filter((o) => o.status === 'ACCEPTED').length;
    const completed = ops.filter((o) => o.status === 'COMPLETED').length;
    const rejected = ops.filter((o) => o.status === 'REJECTED').length;
    const withdrawn = ops.filter((o) => o.status === 'WITHDRAWN').length;
    const expired = ops.filter((o) => o.status === 'EXPIRED').length;

    const followUpsDue = ops.filter(
      (o) => o.followUpDate && o.followUpDate.toISOString().split('T')[0] === todayStr
    ).length;
    const followUpsOverdue = ops.filter(
      (o) => o.followUpDate && o.followUpDate.toISOString().split('T')[0] < todayStr
    ).length;

    const statusCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    ops.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      typeCounts[o.type] = (typeCounts[o.type] || 0) + 1;
    });

    return {
      totalOpportunities,
      activeOpportunities,
      appliedOpportunities,
      interviews,
      offers,
      accepted,
      completed,
      rejected,
      withdrawn,
      expired,
      followUpsDue,
      followUpsOverdue,
      byStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      byType: Object.entries(typeCounts).map(([type, count]) => ({ type, count })),
    };
  }
}
