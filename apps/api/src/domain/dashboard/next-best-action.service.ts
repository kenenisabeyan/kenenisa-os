import { prisma } from '../../lib/prisma.js';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { NextBestActionDto, TaskDto } from '@kenenisa-os/shared';

export class NextBestActionService {
  async evaluateNextBestAction(
    userId: string,
    targetDate: Date = new Date(),
  ): Promise<NextBestActionDto | null> {
    // 1. Fetch candidate tasks from Prisma
    const candidateTasks = await prisma.task.findMany({
      where: {
        userId,
        status: { in: [TaskStatus.READY, TaskStatus.IN_PROGRESS] },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            priority: true,
            workstream: {
              select: {
                id: true,
                name: true,
                priorityWeight: true,
              },
            },
          },
        },
        milestone: {
          select: {
            id: true,
            name: true,
          },
        },
        parentTask: {
          select: {
            id: true,
            title: true,
          },
        },
        blockingDependencies: {
          include: {
            blockingTask: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
              },
            },
          },
        },
        _count: {
          select: {
            subtasks: true,
            blockingDependencies: true,
            dependentDependencies: true,
          },
        },
      },
    });

    if (candidateTasks.length === 0) {
      return null;
    }

    // 2. Filter out any candidate that has unresolved blockers
    const executableCandidates = candidateTasks.filter((task) => {
      const hasUnresolvedBlockers = task.blockingDependencies.some(
        (dep) => dep.blockingTask.status !== TaskStatus.DONE,
      );
      return !hasUnresolvedBlockers;
    });

    if (executableCandidates.length === 0) {
      return null;
    }

    // Date normalization for urgency calculations
    const startOfToday = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    // 3. Score and evaluate each candidate
    const scoredCandidates = executableCandidates.map((task) => {
      const factors: string[] = [];

      // A. Priority Score (0-35)
      let priorityScore = 0;
      if (task.priority === TaskPriority.P0) {
        priorityScore = 35;
        factors.push('P0 Urgent Priority');
      } else if (task.priority === TaskPriority.P1) {
        priorityScore = 27;
        factors.push('P1 High Priority');
      } else if (task.priority === TaskPriority.P2) {
        priorityScore = 18;
        factors.push('P2 Medium Priority');
      } else {
        priorityScore = 9;
        factors.push('P3 Low Priority');
      }

      // B. Urgency Score (0-30)
      let urgencyScore = 0;
      if (task.dueDate) {
        const due = new Date(task.dueDate);
        const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());

        if (startOfDue < startOfToday) {
          urgencyScore = 30;
          factors.push('Overdue');
        } else if (startOfDue.getTime() === startOfToday.getTime()) {
          urgencyScore = 25;
          factors.push('Due Today');
        } else if (startOfDue.getTime() === startOfTomorrow.getTime()) {
          urgencyScore = 18;
          factors.push('Due Tomorrow');
        } else if (startOfDue <= endOfWeek) {
          urgencyScore = 10;
          factors.push('Due this week');
        }
      }

      // C. Strategic Score (0-20)
      const wsWeight = task.project?.workstream?.priorityWeight || 1;
      const wsScore = Math.min(10, wsWeight);

      let projScore = 5;
      if (task.project?.priority === TaskPriority.P0) projScore = 10;
      else if (task.project?.priority === TaskPriority.P1) projScore = 7;
      else if (task.project?.priority === TaskPriority.P2) projScore = 5;
      else if (task.project?.priority === TaskPriority.P3) projScore = 2;

      const strategicScore = wsScore + projScore;
      if (wsWeight >= 8) {
        factors.push(`Core Workstream: ${task.project?.workstream?.name}`);
      }

      // D. Readiness Bonus (0-10)
      let readinessBonus = 0;
      if (task.status === TaskStatus.READY) {
        readinessBonus = 10;
        factors.push('READY for execution');
      }

      // E. Continuity Bonus (0-5)
      let continuityBonus = 0;
      if (task.status === TaskStatus.IN_PROGRESS) {
        continuityBonus = 5;
        factors.push('Currently IN_PROGRESS');
      }

      const totalScore = Math.min(
        100,
        priorityScore + urgencyScore + strategicScore + readinessBonus + continuityBonus,
      );

      const reasons: { category: string; points: number; description: string }[] = [
        { category: 'PRIORITY', points: priorityScore, description: `Task priority level (+${priorityScore} pts)` },
        { category: 'URGENCY', points: urgencyScore, description: urgencyScore > 0 ? `Task due date urgency (+${urgencyScore} pts)` : 'No immediate due date constraint' },
        { category: 'STRATEGIC', points: strategicScore, description: `Strategic workstream & project alignment (+${strategicScore} pts)` },
        { category: 'READINESS', points: readinessBonus + continuityBonus, description: task.status === TaskStatus.IN_PROGRESS ? 'Active momentum (+5 pts)' : 'Unblocked & ready for pickup (+10 pts)' },
      ];

      return {
        task,
        score: totalScore,
        reasons,
      };
    });

    // 4. Deterministic Tie-Breaking Sort
    const priorityRank: Record<TaskPriority, number> = {
      P0: 4,
      P1: 3,
      P2: 2,
      P3: 1,
    };

    scoredCandidates.sort((a, b) => {
      // 1. Score
      if (b.score !== a.score) return b.score - a.score;

      // 2. Task priority
      if (priorityRank[b.task.priority] !== priorityRank[a.task.priority]) {
        return priorityRank[b.task.priority] - priorityRank[a.task.priority];
      }

      // 3. Due date (ascending, nulls last)
      if (a.task.dueDate && b.task.dueDate) {
        const diff = new Date(a.task.dueDate).getTime() - new Date(b.task.dueDate).getTime();
        if (diff !== 0) return diff;
      } else if (a.task.dueDate && !b.task.dueDate) {
        return -1;
      } else if (!a.task.dueDate && b.task.dueDate) {
        return 1;
      }

      // 4. Project priority
      const aProjPrio = a.task.project?.priority ? priorityRank[a.task.project.priority] : 0;
      const bProjPrio = b.task.project?.priority ? priorityRank[b.task.project.priority] : 0;
      if (bProjPrio !== aProjPrio) return bProjPrio - aProjPrio;

      // 5. Task sortOrder
      if (a.task.sortOrder !== b.task.sortOrder) return a.task.sortOrder - b.task.sortOrder;

      // 6. createdAt
      const createdDiff =
        new Date(a.task.createdAt).getTime() - new Date(b.task.createdAt).getTime();
      if (createdDiff !== 0) return createdDiff;

      // 7. Stable ID comparison
      return a.task.id.localeCompare(b.task.id);
    });

    const top = scoredCandidates[0];

    const formattedTaskDto: TaskDto = {
      id: top.task.id,
      userId: top.task.userId,
      projectId: top.task.projectId,
      milestoneId: top.task.milestoneId,
      parentTaskId: top.task.parentTaskId,
      title: top.task.title,
      description: top.task.description,
      status: top.task.status,
      priority: top.task.priority,
      estimateMinutes: top.task.estimateMinutes,
      actualMinutes: top.task.actualMinutes,
      startDate: top.task.startDate ? top.task.startDate.toISOString() : null,
      dueDate: top.task.dueDate ? top.task.dueDate.toISOString() : null,
      completedAt: top.task.completedAt ? top.task.completedAt.toISOString() : null,
      sortOrder: top.task.sortOrder,
      createdAt: top.task.createdAt.toISOString(),
      updatedAt: top.task.updatedAt.toISOString(),
      project: top.task.project
        ? {
            id: top.task.project.id,
            name: top.task.project.name,
            slug: top.task.project.slug,
          }
        : undefined,
      milestone: top.task.milestone
        ? {
            id: top.task.milestone.id,
            name: top.task.milestone.name,
          }
        : null,
      parentTask: top.task.parentTask
        ? {
            id: top.task.parentTask.id,
            title: top.task.parentTask.title,
          }
        : null,
      _count: top.task._count,
    };

    return {
      recommendedTask: formattedTaskDto,
      score: top.score,
      reasons: top.reasons,
      candidatePoolCount: candidateTasks.length,
      evaluatedAt: targetDate.toISOString(),
    };
  }
}
