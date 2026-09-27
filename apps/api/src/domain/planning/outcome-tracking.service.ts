import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../utils/errors.js';
import { PlanHorizon, PlanOutcomeState, TaskStatus, TaskPriority, OutcomeVerificationState } from '@prisma/client';
import type {
  PlanOutcomeDto,
  CreatePlanOutcomeInput,
  UpdatePlanOutcomeInput,
  PlanResultSnapshotDto,
} from '@kenenisa-os/shared';

export class OutcomeTrackingService {
  /**
   * Derive the objective outcome state based on authoritative task & project records.
   * User confirmations (isUserConfirmed == true) are preserved.
   */
  public async evaluateOutcomeState(outcomeId: string): Promise<PlanOutcomeState> {
    const outcome = await prisma.planOutcome.findUnique({
      where: { id: outcomeId },
      include: {
        task: {
          include: {
            dependentDependencies: true,
          },
        },
        project: {
          include: {
            tasks: true,
          },
        },
      },
    });

    if (!outcome) {
      throw new NotFoundError(`PlanOutcome not found with ID ${outcomeId}`);
    }

    // Preserve user override
    if (outcome.isUserConfirmed) {
      return outcome.outcomeState;
    }

    // Explicit cancellation or rescheduling
    if (outcome.outcomeState === PlanOutcomeState.CANCELLED || outcome.outcomeState === PlanOutcomeState.RESCHEDULED) {
      return outcome.outcomeState;
    }

    // 1. Task-based evaluation
    if (outcome.taskId && outcome.task) {
      const task = outcome.task;

      if (task.status === TaskStatus.DONE) {
        return PlanOutcomeState.COMPLETED;
      }
      if (task.status === TaskStatus.CANCELLED) {
        return PlanOutcomeState.CANCELLED;
      }
      if (task.status === TaskStatus.BLOCKED || (task.dependentDependencies && task.dependentDependencies.length > 0)) {
        return PlanOutcomeState.BLOCKED;
      }
      if (task.status === TaskStatus.IN_PROGRESS) {
        return PlanOutcomeState.IN_PROGRESS;
      }

      // Check if scheduled end time passed without completion
      const now = new Date();
      if (outcome.endDate && new Date(outcome.endDate) < now) {
        return PlanOutcomeState.MISSED;
      }

      return PlanOutcomeState.PLANNED;
    }

    // 2. Project-based evaluation
    if (outcome.projectId && outcome.project) {
      const tasks = outcome.project.tasks || [];
      if (tasks.length === 0) {
        return outcome.outcomeState;
      }

      const completed = tasks.filter((t) => t.status === TaskStatus.DONE).length;
      const blocked = tasks.filter((t) => t.status === TaskStatus.BLOCKED).length;

      if (completed === tasks.length) {
        return PlanOutcomeState.COMPLETED;
      }
      if (completed > 0) {
        return PlanOutcomeState.PARTIALLY_COMPLETED;
      }
      if (blocked > 0) {
        return PlanOutcomeState.BLOCKED;
      }

      const now = new Date();
      if (outcome.endDate && new Date(outcome.endDate) < now) {
        return PlanOutcomeState.MISSED;
      }

      return PlanOutcomeState.PLANNED;
    }

    // 3. Date-based fallback check for standalone outcomes
    const now = new Date();
    if (outcome.endDate && new Date(outcome.endDate) < now && outcome.outcomeState === PlanOutcomeState.PLANNED) {
      return PlanOutcomeState.MISSED;
    }

    return outcome.outcomeState;
  }

  /**
   * Create a new plan outcome item.
   */
  public async createOutcome(userId: string, input: CreatePlanOutcomeInput): Promise<PlanOutcomeDto> {
    const created = await prisma.planOutcome.create({
      data: {
        userId,
        horizon: input.horizon as PlanHorizon,
        yearPlanId: input.yearPlanId || null,
        monthPlanId: input.monthPlanId || null,
        weeklyPlanId: input.weeklyPlanId || null,
        dailyPlanId: input.dailyPlanId || null,
        workstreamId: input.workstreamId || null,
        goalId: input.goalId || null,
        projectId: input.projectId || null,
        milestoneId: input.milestoneId || null,
        taskId: input.taskId || null,
        title: input.title,
        description: input.description || null,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        plannedMinutes: input.plannedMinutes || null,
        priority: (input.priority as TaskPriority) || TaskPriority.P2,
        expectedResult: input.expectedResult || null,
        actualResult: input.actualResult || null,
        outcomeState: (input.outcomeState as PlanOutcomeState) || PlanOutcomeState.PLANNED,
        isUserConfirmed: input.isUserConfirmed ?? false,
        userExplanation: input.userExplanation || null,
        rescheduledTo: input.rescheduledTo ? new Date(input.rescheduledTo) : null,
        carriedForwardToId: input.carriedForwardToId || null,
      },
      include: {
        workstream: true,
        goal: true,
        project: true,
        milestone: true,
        task: true,
        evidenceLinks: {
          include: {
            evidence: true,
          },
        },
      },
    });

    return this.mapToDto(created);
  }

  /**
   * Update outcome with state re-evaluation if not user confirmed.
   */
  public async updateOutcome(userId: string, id: string, input: UpdatePlanOutcomeInput): Promise<PlanOutcomeDto> {
    const existing = await prisma.planOutcome.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundError(`Outcome not found with ID ${id}`);
    }

    const updated = await prisma.planOutcome.update({
      where: { id },
      data: {
        yearPlanId: input.yearPlanId !== undefined ? input.yearPlanId : existing.yearPlanId,
        monthPlanId: input.monthPlanId !== undefined ? input.monthPlanId : existing.monthPlanId,
        weeklyPlanId: input.weeklyPlanId !== undefined ? input.weeklyPlanId : existing.weeklyPlanId,
        dailyPlanId: input.dailyPlanId !== undefined ? input.dailyPlanId : existing.dailyPlanId,
        workstreamId: input.workstreamId !== undefined ? input.workstreamId : existing.workstreamId,
        goalId: input.goalId !== undefined ? input.goalId : existing.goalId,
        projectId: input.projectId !== undefined ? input.projectId : existing.projectId,
        milestoneId: input.milestoneId !== undefined ? input.milestoneId : existing.milestoneId,
        taskId: input.taskId !== undefined ? input.taskId : existing.taskId,
        title: input.title !== undefined ? input.title : existing.title,
        description: input.description !== undefined ? input.description : existing.description,
        startDate: input.startDate ? new Date(input.startDate) : input.startDate === null ? null : existing.startDate,
        endDate: input.endDate ? new Date(input.endDate) : input.endDate === null ? null : existing.endDate,
        plannedMinutes: input.plannedMinutes !== undefined ? input.plannedMinutes : existing.plannedMinutes,
        priority: input.priority ? (input.priority as TaskPriority) : existing.priority,
        expectedResult: input.expectedResult !== undefined ? input.expectedResult : existing.expectedResult,
        actualResult: input.actualResult !== undefined ? input.actualResult : existing.actualResult,
        outcomeState: input.outcomeState ? (input.outcomeState as PlanOutcomeState) : existing.outcomeState,
        isUserConfirmed: input.isUserConfirmed !== undefined ? input.isUserConfirmed : existing.isUserConfirmed,
        userExplanation: input.userExplanation !== undefined ? input.userExplanation : existing.userExplanation,
        rescheduledTo: input.rescheduledTo ? new Date(input.rescheduledTo) : existing.rescheduledTo,
        carriedForwardToId: input.carriedForwardToId !== undefined ? input.carriedForwardToId : existing.carriedForwardToId,
      },
      include: {
        workstream: true,
        goal: true,
        project: true,
        milestone: true,
        task: true,
        evidenceLinks: {
          include: {
            evidence: true,
          },
        },
      },
    });

    return this.mapToDto(updated);
  }

  /**
   * User confirmation/override of an outcome result.
   */
  public async confirmUserOutcome(
    userId: string,
    id: string,
    outcomeState: PlanOutcomeState,
    actualResult?: string,
    explanation?: string,
  ): Promise<PlanOutcomeDto> {
    const existing = await prisma.planOutcome.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundError(`Outcome not found with ID ${id}`);
    }

    const updated = await prisma.planOutcome.update({
      where: { id },
      data: {
        outcomeState,
        isUserConfirmed: true,
        actualResult: actualResult ?? existing.actualResult,
        userExplanation: explanation ?? existing.userExplanation,
      },
      include: {
        workstream: true,
        goal: true,
        project: true,
        milestone: true,
        task: true,
        evidenceLinks: {
          include: {
            evidence: true,
          },
        },
      },
    });

    return this.mapToDto(updated);
  }

  /**
   * Attach evidence proof to plan outcome.
   */
  public async linkEvidence(
    userId: string,
    planOutcomeId: string,
    evidenceId: string,
    verificationState: OutcomeVerificationState = OutcomeVerificationState.OBSERVED,
  ): Promise<PlanOutcomeDto> {
    const outcome = await prisma.planOutcome.findFirst({
      where: { id: planOutcomeId, userId },
    });
    if (!outcome) {
      throw new NotFoundError(`PlanOutcome not found with ID ${planOutcomeId}`);
    }

    const evidence = await prisma.evidence.findFirst({
      where: { id: evidenceId, userId },
    });
    if (!evidence) {
      throw new NotFoundError(`Evidence not found with ID ${evidenceId}`);
    }

    await prisma.planOutcomeEvidence.upsert({
      where: {
        planOutcomeId_evidenceId: {
          planOutcomeId,
          evidenceId,
        },
      },
      create: {
        planOutcomeId,
        evidenceId,
        verificationState,
      },
      update: {
        verificationState,
      },
    });

    const refreshed = await prisma.planOutcome.findUnique({
      where: { id: planOutcomeId },
      include: {
        workstream: true,
        goal: true,
        project: true,
        milestone: true,
        task: true,
        evidenceLinks: {
          include: {
            evidence: true,
          },
        },
      },
    });

    return this.mapToDto(refreshed!);
  }

  /**
   * Generate an immutable factual result snapshot for a period key.
   */
  public async generatePeriodSnapshot(
    userId: string,
    horizon: PlanHorizon,
    periodKey: string,
    summaryText?: string,
  ): Promise<PlanResultSnapshotDto> {
    const outcomes = await prisma.planOutcome.findMany({
      where: { userId, horizon },
    });

    let totalPlanned = 0;
    let totalCompleted = 0;
    let totalPartial = 0;
    let totalMissed = 0;
    let totalBlocked = 0;
    let totalRescheduled = 0;
    let totalCancelled = 0;

    for (const item of outcomes) {
      switch (item.outcomeState) {
        case PlanOutcomeState.COMPLETED:
          totalCompleted++;
          break;
        case PlanOutcomeState.PARTIALLY_COMPLETED:
          totalPartial++;
          break;
        case PlanOutcomeState.MISSED:
          totalMissed++;
          break;
        case PlanOutcomeState.BLOCKED:
          totalBlocked++;
          break;
        case PlanOutcomeState.RESCHEDULED:
          totalRescheduled++;
          break;
        case PlanOutcomeState.CANCELLED:
          totalCancelled++;
          break;
        default:
          totalPlanned++;
          break;
      }
    }

    const snapshot = await prisma.planResultSnapshot.upsert({
      where: {
        userId_horizon_periodKey: {
          userId,
          horizon,
          periodKey,
        },
      },
      create: {
        userId,
        horizon,
        periodKey,
        summaryText: summaryText || null,
        totalPlanned,
        totalCompleted,
        totalPartial,
        totalMissed,
        totalBlocked,
        totalRescheduled,
        totalCancelled,
        snapshotData: { outcomesCount: outcomes.length, generatedAt: new Date().toISOString() },
      },
      update: {
        summaryText: summaryText || null,
        totalPlanned,
        totalCompleted,
        totalPartial,
        totalMissed,
        totalBlocked,
        totalRescheduled,
        totalCancelled,
        snapshotData: { outcomesCount: outcomes.length, updated: new Date().toISOString() },
      },
    });

    return {
      id: snapshot.id,
      userId: snapshot.userId,
      horizon: snapshot.horizon as any,
      periodKey: snapshot.periodKey,
      summaryText: snapshot.summaryText,
      totalPlanned: snapshot.totalPlanned,
      totalCompleted: snapshot.totalCompleted,
      totalPartial: snapshot.totalPartial,
      totalMissed: snapshot.totalMissed,
      totalBlocked: snapshot.totalBlocked,
      totalRescheduled: snapshot.totalRescheduled,
      totalCancelled: snapshot.totalCancelled,
      snapshotData: snapshot.snapshotData as any,
      createdAt: snapshot.createdAt.toISOString(),
    };
  }

  public async listOutcomes(
    userId: string,
    filters?: {
      horizon?: PlanHorizon;
      yearPlanId?: string;
      monthPlanId?: string;
      weeklyPlanId?: string;
      dailyPlanId?: string;
      outcomeState?: PlanOutcomeState;
    },
  ): Promise<PlanOutcomeDto[]> {
    const where: any = { userId };
    if (filters?.horizon) where.horizon = filters.horizon;
    if (filters?.yearPlanId) where.yearPlanId = filters.yearPlanId;
    if (filters?.monthPlanId) where.monthPlanId = filters.monthPlanId;
    if (filters?.weeklyPlanId) where.weeklyPlanId = filters.weeklyPlanId;
    if (filters?.dailyPlanId) where.dailyPlanId = filters.dailyPlanId;
    if (filters?.outcomeState) where.outcomeState = filters.outcomeState;

    const outcomes = await prisma.planOutcome.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        workstream: true,
        goal: true,
        project: true,
        milestone: true,
        task: true,
        evidenceLinks: {
          include: {
            evidence: true,
          },
        },
      },
    });

    return outcomes.map((o) => this.mapToDto(o));
  }

  public async deleteOutcome(userId: string, id: string): Promise<void> {
    const existing = await prisma.planOutcome.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundError(`Outcome not found with ID ${id}`);
    }
    await prisma.planOutcome.delete({ where: { id } });
  }

  private mapToDto(item: any): PlanOutcomeDto {
    return {
      id: item.id,
      userId: item.userId,
      horizon: item.horizon as any,
      yearPlanId: item.yearPlanId,
      monthPlanId: item.monthPlanId,
      weeklyPlanId: item.weeklyPlanId,
      dailyPlanId: item.dailyPlanId,
      workstreamId: item.workstreamId,
      goalId: item.goalId,
      projectId: item.projectId,
      milestoneId: item.milestoneId,
      taskId: item.taskId,
      title: item.title,
      description: item.description,
      startDate: item.startDate ? item.startDate.toISOString() : null,
      endDate: item.endDate ? item.endDate.toISOString() : null,
      plannedMinutes: item.plannedMinutes,
      priority: item.priority,
      expectedResult: item.expectedResult,
      actualResult: item.actualResult,
      outcomeState: item.outcomeState as any,
      isUserConfirmed: item.isUserConfirmed,
      userExplanation: item.userExplanation,
      rescheduledTo: item.rescheduledTo ? item.rescheduledTo.toISOString() : null,
      carriedForwardToId: item.carriedForwardToId,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      workstream: item.workstream ? item.workstream : null,
      goal: item.goal ? item.goal : null,
      project: item.project ? item.project : null,
      milestone: item.milestone ? item.milestone : null,
      task: item.task ? item.task : null,
      evidenceLinks: item.evidenceLinks
        ? item.evidenceLinks.map((e: any) => ({
            id: e.id,
            planOutcomeId: e.planOutcomeId,
            evidenceId: e.evidenceId,
            verificationState: e.verificationState,
            createdAt: e.createdAt.toISOString(),
            evidence: e.evidence ? e.evidence : null,
          }))
        : [],
    };
  }
}
