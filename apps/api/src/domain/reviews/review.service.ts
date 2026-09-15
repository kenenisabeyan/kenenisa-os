import { prisma } from '../../lib/prisma.js';
import { ReviewStatus, Prisma } from '@prisma/client';
import {
  WeeklyReviewDto,
  CreateWeeklyReviewInput,
  UpdateWeeklyReviewInput,
  WeeklyReviewContextDto,
  WeeklyReviewQuery,
} from '@kenenisa-os/shared';
import { NotFoundError, ForbiddenError, ConflictError } from '../../utils/errors.js';

export class ReviewService {
  private formatWeeklyReview(review: {
    id: string;
    userId: string;
    weeklyPlanId: string | null;
    status: ReviewStatus;
    wins: string | null;
    challenges: string | null;
    lessons: string | null;
    nextFocus: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): WeeklyReviewDto {
    return {
      id: review.id,
      userId: review.userId,
      weeklyPlanId: review.weeklyPlanId ?? null,
      status: review.status,
      wins: review.wins ?? null,
      challenges: review.challenges ?? null,
      lessons: review.lessons ?? null,
      nextFocus: review.nextFocus ?? null,
      notes: review.notes ?? null,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }

  async listWeeklyReviews(
    userId: string,
    query: WeeklyReviewQuery,
  ): Promise<{ items: WeeklyReviewDto[]; total: number; page: number; pageSize: number }> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const skip = (page - 1) * pageSize;

    const where: Prisma.WeeklyReviewWhereInput = { userId };
    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      prisma.weeklyReview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.weeklyReview.count({ where }),
    ]);

    return {
      items: items.map((i) => this.formatWeeklyReview(i)),
      total,
      page,
      pageSize,
    };
  }

  async getWeeklyReviewById(id: string, userId: string): Promise<WeeklyReviewDto> {
    const item = await prisma.weeklyReview.findFirst({
      where: { id, userId },
    });

    if (!item) {
      throw new NotFoundError('Weekly review not found');
    }

    return this.formatWeeklyReview(item);
  }

  async createWeeklyReview(userId: string, input: CreateWeeklyReviewInput): Promise<WeeklyReviewDto> {
    if (input.weeklyPlanId) {
      const plan = await prisma.weeklyPlan.findFirst({
        where: { id: input.weeklyPlanId, userId },
      });
      if (!plan) {
        throw new ForbiddenError('Weekly plan not found or does not belong to user');
      }

      const existing = await prisma.weeklyReview.findFirst({
        where: { userId, weeklyPlanId: input.weeklyPlanId },
      });
      if (existing) {
        throw new ConflictError('A review already exists for this weekly plan');
      }
    }

    const created = await prisma.weeklyReview.create({
      data: {
        userId,
        weeklyPlanId: input.weeklyPlanId ?? null,
        status: ReviewStatus.DRAFT,
        wins: input.wins ?? null,
        challenges: input.challenges ?? null,
        lessons: input.lessons ?? null,
        nextFocus: input.nextFocus ?? null,
        notes: input.notes ?? null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'WEEKLY_REVIEW_CREATED',
        entityType: 'WEEKLY_REVIEW',
        entityId: created.id,
        metadata: { weeklyPlanId: created.weeklyPlanId },
      },
    });

    return this.formatWeeklyReview(created);
  }

  async updateWeeklyReview(id: string, userId: string, input: UpdateWeeklyReviewInput): Promise<WeeklyReviewDto> {
    const existing = await prisma.weeklyReview.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new NotFoundError('Weekly review not found');
    }

    const updated = await prisma.weeklyReview.update({
      where: { id },
      data: {
        wins: input.wins !== undefined ? input.wins : existing.wins,
        challenges: input.challenges !== undefined ? input.challenges : existing.challenges,
        lessons: input.lessons !== undefined ? input.lessons : existing.lessons,
        nextFocus: input.nextFocus !== undefined ? input.nextFocus : existing.nextFocus,
        notes: input.notes !== undefined ? input.notes : existing.notes,
        status: input.status ? input.status : existing.status,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'WEEKLY_REVIEW_UPDATED',
        entityType: 'WEEKLY_REVIEW',
        entityId: id,
        metadata: { status: updated.status },
      },
    });

    return this.formatWeeklyReview(updated);
  }

  async completeWeeklyReview(id: string, userId: string): Promise<WeeklyReviewDto> {
    return this.updateWeeklyReview(id, userId, { status: 'COMPLETED' });
  }

  async reopenWeeklyReview(id: string, userId: string): Promise<WeeklyReviewDto> {
    return this.updateWeeklyReview(id, userId, { status: 'DRAFT' });
  }

  async getWeeklyReviewContext(userId: string, weekStartStr?: string): Promise<WeeklyReviewContextDto> {
    const now = new Date();
    let weekStart = new Date(weekStartStr ?? now);
    if (isNaN(weekStart.getTime())) {
      weekStart = new Date();
    }

    // Default week start to Monday 00:00:00.000 UTC
    const day = weekStart.getUTCDay();
    const diffToMon = (day === 0 ? -6 : 1 - day);
    const mon = new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate() + diffToMon, 0, 0, 0, 0));
    const sun = new Date(Date.UTC(mon.getUTCFullYear(), mon.getUTCMonth(), mon.getUTCDate() + 6, 23, 59, 59, 999));

    const weekStartIso = mon.toISOString().split('T')[0];
    const weekEndIso = sun.toISOString().split('T')[0];

    // Read factual aggregates for the date range [mon, sun]
    const [
      completedTasks,
      blockedTasks,
      cancelledTasks,
      timeBlocks,
      learningActivities,
      learningItemsCompleted,
      skillsUpdated,
      evidenceCreated,
      activeProjects,
    ] = await Promise.all([
      prisma.task.count({ where: { userId, status: 'DONE', completedAt: { gte: mon, lte: sun } } }),
      prisma.task.count({ where: { userId, status: 'BLOCKED' } }),
      prisma.task.count({ where: { userId, status: 'CANCELLED', updatedAt: { gte: mon, lte: sun } } }),
      prisma.timeBlock.findMany({ where: { userId, startAt: { gte: mon, lte: sun } } }),
      prisma.learningActivity.aggregate({
        where: { userId, date: { gte: mon, lte: sun } },
        _sum: { minutes: true },
      }),
      prisma.learningItem.count({ where: { userId, status: 'COMPLETED', completedAt: { gte: mon, lte: sun } } }),
      prisma.auditLog.count({ where: { userId, action: 'SKILL_LEVEL_CHANGED', createdAt: { gte: mon, lte: sun } } }),
      prisma.evidence.count({ where: { userId, date: { gte: mon, lte: sun } } }),
      prisma.project.count({ where: { userId, status: 'ACTIVE' } }),
    ]);

    let plannedMinutes = 0;
    timeBlocks.forEach((tb) => {
      const duration = Math.max(0, Math.round((tb.endAt.getTime() - tb.startAt.getTime()) / 60000));
      plannedMinutes += duration;
    });

    const userSettings = await prisma.userSettings.findUnique({ where: { userId } });
    const dailyCap = userSettings?.dailyWorkCapacityMinutes ?? 480;

    // Calculate over-capacity days
    const minutesByDay = new Map<string, number>();
    timeBlocks.forEach((tb) => {
      const dayKey = tb.startAt.toISOString().split('T')[0];
      const duration = Math.max(0, Math.round((tb.endAt.getTime() - tb.startAt.getTime()) / 60000));
      minutesByDay.set(dayKey, (minutesByDay.get(dayKey) ?? 0) + duration);
    });

    let overCapacityDays = 0;
    minutesByDay.forEach((mins) => {
      if (mins > dailyCap) overCapacityDays++;
    });

    return {
      weekStart: weekStartIso,
      weekEnd: weekEndIso,
      completedTasks,
      blockedTasks,
      cancelledTasks,
      plannedMinutes,
      actualLoggedMinutes: plannedMinutes,
      learningMinutes: learningActivities._sum.minutes ?? 0,
      learningItemsCompleted,
      skillsUpdated,
      evidenceCreated,
      activeProjects,
      overCapacityDays,
    };
  }
}
