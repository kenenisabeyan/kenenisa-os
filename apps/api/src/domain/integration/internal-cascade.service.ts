import { prisma } from '../../lib/prisma.js';
import { TaskStatus, MilestoneStatus, ProjectStatus } from '@prisma/client';
import { recordAuditLog } from '../../services/audit.service.js';
import { domainEventBus } from '../automation/domain-event-bus.js';

export interface CascadeResult {
  unblockedTaskIds: string[];
  blockedTaskIds: string[];
  milestoneStatusUpdated?: { milestoneId: string; newStatus: MilestoneStatus };
  projectStatusUpdated?: { projectId: string; newStatus: ProjectStatus };
  skillAdvancements?: { skillId: string; totalMinutes: number }[];
}

/**
 * Internal Cascade Service
 * Handles reliable, transactional cross-module side effects and cascades
 * across Strategic, Execution, and Development layers.
 */
export class InternalCascadeService {
  /**
   * Evaluates cascades when a Task's status changes.
   */
  public static async onTaskStatusChanged(
    taskId: string,
    userId: string,
    previousStatus: TaskStatus,
    newStatus: TaskStatus
  ): Promise<CascadeResult> {
    const result: CascadeResult = {
      unblockedTaskIds: [],
      blockedTaskIds: [],
    };

    if (previousStatus === newStatus) {
      return result;
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
      select: { id: true, projectId: true, milestoneId: true, title: true },
    });

    if (!task) {
      return result;
    }

    // 1. Dependency Unblocking / Blocking Cascades
    if (newStatus === TaskStatus.DONE) {
      // Find all tasks that depend on this task
      const dependentDeps = await prisma.taskDependency.findMany({
        where: { blockingTaskId: taskId, dependencyType: 'BLOCKS' },
        include: { dependentTask: true },
      });

      for (const dep of dependentDeps) {
        if (dep.dependentTask.userId !== userId) continue;

        // Check if dependent task has any OTHER unresolved blockers
        const remainingBlockersCount = await prisma.taskDependency.count({
          where: {
            dependentTaskId: dep.dependentTaskId,
            blockingTaskId: { not: taskId },
            blockingTask: { status: { not: TaskStatus.DONE } },
          },
        });

        if (remainingBlockersCount === 0 && dep.dependentTask.status === TaskStatus.BLOCKED) {
          await prisma.task.update({
            where: { id: dep.dependentTaskId },
            data: { status: TaskStatus.READY },
          });
          result.unblockedTaskIds.push(dep.dependentTaskId);

          await recordAuditLog({
            userId,
            entityType: 'TASK',
            entityId: dep.dependentTaskId,
            action: 'TASK_AUTOMATICALLY_UNBLOCKED',
            metadata: { unblockedByTaskId: taskId },
          });
        }
      }
    } else if (previousStatus === TaskStatus.DONE) {
      // Task was re-opened from DONE -> Re-block dependent tasks if they were READY or IN_PROGRESS
      const dependentDeps = await prisma.taskDependency.findMany({
        where: { blockingTaskId: taskId, dependencyType: 'BLOCKS' },
        include: { dependentTask: true },
      });

      for (const dep of dependentDeps) {
        if (dep.dependentTask.userId !== userId) continue;

        if (
          dep.dependentTask.status === TaskStatus.READY ||
          dep.dependentTask.status === TaskStatus.IN_PROGRESS
        ) {
          await prisma.task.update({
            where: { id: dep.dependentTaskId },
            data: { status: TaskStatus.BLOCKED },
          });
          result.blockedTaskIds.push(dep.dependentTaskId);

          await recordAuditLog({
            userId,
            entityType: 'TASK',
            entityId: dep.dependentTaskId,
            action: 'TASK_AUTOMATICALLY_BLOCKED',
            metadata: { blockedByReopenedTaskId: taskId },
          });
        }
      }
    }

    // 2. Milestone Progress & Auto-Completion Cascade
    if (task.milestoneId) {
      const milestoneTasks = await prisma.task.findMany({
        where: { milestoneId: task.milestoneId, userId },
        select: { id: true, status: true },
      });

      const totalMilestoneTasks = milestoneTasks.length;
      const completedMilestoneTasks = milestoneTasks.filter((t) => t.status === TaskStatus.DONE).length;

      const currentMilestone = await prisma.milestone.findUnique({
        where: { id: task.milestoneId },
      });

      if (currentMilestone) {
        if (totalMilestoneTasks > 0 && completedMilestoneTasks === totalMilestoneTasks) {
          // All tasks in milestone are DONE -> Advance Milestone to REACHED
          if (currentMilestone.status !== MilestoneStatus.REACHED) {
            await prisma.milestone.update({
              where: { id: task.milestoneId },
              data: {
                status: MilestoneStatus.REACHED,
                completedAt: new Date(),
              },
            });
            result.milestoneStatusUpdated = {
              milestoneId: task.milestoneId,
              newStatus: MilestoneStatus.REACHED,
            };

            await recordAuditLog({
              userId,
              entityType: 'Milestone',
              entityId: task.milestoneId,
              action: 'MILESTONE_AUTO_COMPLETED_ALL_TASKS_DONE',
              metadata: { milestoneName: currentMilestone.name },
            });
          }
        } else if (currentMilestone.status === MilestoneStatus.REACHED) {
          // A task was re-opened or deleted -> Milestone is no longer REACHED
          await prisma.milestone.update({
            where: { id: task.milestoneId },
            data: {
              status: MilestoneStatus.IN_PROGRESS,
              completedAt: null,
            },
          });
          result.milestoneStatusUpdated = {
            milestoneId: task.milestoneId,
            newStatus: MilestoneStatus.IN_PROGRESS,
          };
        }
      }
    }

    // 3. Project Progress & Status Cascade
    if (task.projectId) {
      const projectMilestones = await prisma.milestone.findMany({
        where: { projectId: task.projectId, userId },
        select: { id: true, status: true },
      });

      const currentProject = await prisma.project.findUnique({
        where: { id: task.projectId },
      });

      if (currentProject && projectMilestones.length > 0) {
        const allReached = projectMilestones.every((m) => m.status === MilestoneStatus.REACHED);
        if (allReached && currentProject.status !== ProjectStatus.COMPLETED) {
          await prisma.project.update({
            where: { id: task.projectId },
            data: {
              status: ProjectStatus.COMPLETED,
              completedAt: new Date(),
            },
          });
          result.projectStatusUpdated = {
            projectId: task.projectId,
            newStatus: ProjectStatus.COMPLETED,
          };
        } else if (!allReached && currentProject.status === ProjectStatus.COMPLETED) {
          await prisma.project.update({
            where: { id: task.projectId },
            data: {
              status: ProjectStatus.ACTIVE,
              completedAt: null,
            },
          });
          result.projectStatusUpdated = {
            projectId: task.projectId,
            newStatus: ProjectStatus.ACTIVE,
          };
        }
      }
    }

    // Emit to Domain Event Bus for cross-module automation rules & workflows
    await domainEventBus.emit({
      type: 'task.status_changed',
      userId,
      taskId,
      previousStatus,
      newStatus,
      title: task.title,
      projectId: task.projectId,
      milestoneId: task.milestoneId,
    });

    return result;
  }

  /**
   * Evaluates cascades when a Milestone status changes.
   */
  public static async onMilestoneStatusChanged(
    milestoneId: string,
    userId: string,
    newStatus: MilestoneStatus
  ): Promise<CascadeResult> {
    const result: CascadeResult = { unblockedTaskIds: [], blockedTaskIds: [] };

    const milestone = await prisma.milestone.findFirst({
      where: { id: milestoneId, userId },
      select: { id: true, projectId: true, name: true, status: true },
    });

    if (!milestone) return result;

    const projectMilestones = await prisma.milestone.findMany({
      where: { projectId: milestone.projectId, userId },
      select: { id: true, status: true },
    });

    const currentProject = await prisma.project.findUnique({
      where: { id: milestone.projectId },
    });

    if (currentProject && projectMilestones.length > 0) {
      const allReached = projectMilestones.every((m) =>
        m.id === milestoneId ? newStatus === MilestoneStatus.REACHED : m.status === MilestoneStatus.REACHED
      );

      if (allReached && currentProject.status !== ProjectStatus.COMPLETED) {
        await prisma.project.update({
          where: { id: milestone.projectId },
          data: { status: ProjectStatus.COMPLETED, completedAt: new Date() },
        });
        result.projectStatusUpdated = {
          projectId: milestone.projectId,
          newStatus: ProjectStatus.COMPLETED,
        };
      } else if (!allReached && currentProject.status === ProjectStatus.COMPLETED) {
        await prisma.project.update({
          where: { id: milestone.projectId },
          data: { status: ProjectStatus.ACTIVE, completedAt: null },
        });
        result.projectStatusUpdated = {
          projectId: milestone.projectId,
          newStatus: ProjectStatus.ACTIVE,
        };
      }
    }

    // Emit to Domain Event Bus
    await domainEventBus.emit({
      type: 'milestone.status_changed',
      userId,
      milestoneId,
      previousStatus: milestone.status,
      newStatus,
      title: milestone.name,
      projectId: milestone.projectId,
    });

    return result;
  }

  /**
   * Evaluates cascades when a Learning Activity is recorded.
   * Updates linked skills and computes accumulated practice hours.
   */
  public static async onLearningActivityLogged(
    learningItemId: string,
    userId: string,
    minutes: number
  ): Promise<CascadeResult> {
    const result: CascadeResult = { unblockedTaskIds: [], blockedTaskIds: [], skillAdvancements: [] };

    const itemSkills = await prisma.learningItemSkill.findMany({
      where: { learningItemId },
      include: { skill: true },
    });

    for (const itemSkill of itemSkills) {
      if (itemSkill.skill.userId !== userId) continue;

      // Calculate total practice minutes logged across all activities for items linked to this skill
      const totalActivities = await prisma.learningActivity.aggregate({
        where: {
          userId,
          learningItem: {
            skills: { some: { skillId: itemSkill.skillId } },
          },
        },
        _sum: { minutes: true },
      });

      const totalSkillMinutes = totalActivities._sum.minutes || 0;
      result.skillAdvancements?.push({
        skillId: itemSkill.skillId,
        totalMinutes: totalSkillMinutes,
      });

      await recordAuditLog({
        userId,
        entityType: 'Skill',
        entityId: itemSkill.skillId,
        action: 'SKILL_PRACTICE_ACCUMULATED',
        metadata: {
          addedMinutes: minutes,
          totalAccumulatedMinutes: totalSkillMinutes,
          skillName: itemSkill.skill.name,
        },
      });
    }

    // Emit to Domain Event Bus
    const learningItem = await prisma.learningItem.findUnique({
      where: { id: learningItemId },
      select: { title: true },
    });

    await domainEventBus.emit({
      type: 'learning.recorded',
      userId,
      learningItemId,
      minutes,
      title: learningItem?.title || 'Learning Session',
      skillIds: itemSkills.map((s) => s.skillId),
    });

    return result;
  }
}

