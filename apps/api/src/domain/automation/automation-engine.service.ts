import { prisma } from '../../lib/prisma.js';
import { TaskStatus, MilestoneStatus } from '@prisma/client';
import { recordAuditLog } from '../../services/audit.service.js';
import { logger } from '../../lib/logger.js';
import {
  domainEventBus,
  DomainEvent,
  TaskStatusChangedEvent,
  MilestoneStatusChangedEvent,
  LearningRecordedEvent,
  EvidenceCreatedEvent,
  DeadlineApproachingEvent,
} from './domain-event-bus.js';

export interface AutomationConditionDef {
  projectId?: string;
  milestoneId?: string;
  tagIncludes?: string;
  minMinutes?: number;
  statusEquals?: string;
  priorityEquals?: string;
  entityType?: string;
}

export interface AutomationActionDef {
  type: 'CREATE_TASK' | 'CREATE_NOTIFICATION' | 'UPDATE_TASK_STATUS' | 'RECORD_AUDIT_LOG';
  params: Record<string, any>;
}

export interface RuleExecutionResult {
  ruleId: string;
  ruleName: string;
  matched: boolean;
  actionsExecuted: number;
  errors?: string[];
}

export class AutomationEngineService {
  private static instance: AutomationEngineService;
  private initialized = false;

  private constructor() {}

  public static getInstance(): AutomationEngineService {
    if (!AutomationEngineService.instance) {
      AutomationEngineService.instance = new AutomationEngineService();
    }
    return AutomationEngineService.instance;
  }

  /**
   * Initializes event subscriptions to the domain event bus.
   */
  public initialize(): void {
    if (this.initialized) return;

    domainEventBus.subscribe('task.status_changed', async (evt) => {
      await this.handleTaskStatusChanged(evt);
    });
    domainEventBus.subscribe('milestone.status_changed', async (evt) => {
      await this.handleMilestoneStatusChanged(evt);
    });
    domainEventBus.subscribe('learning.recorded', async (evt) => {
      await this.handleLearningRecorded(evt);
    });
    domainEventBus.subscribe('evidence.created', async (evt) => {
      await this.handleEvidenceCreated(evt);
    });
    domainEventBus.subscribe('deadline.approaching', async (evt) => {
      await this.handleDeadlineApproaching(evt);
    });

    this.initialized = true;
    logger.info('[AutomationEngineService] Subscribed to DomainEventBus events.');
  }

  public async handleTaskStatusChanged(event: TaskStatusChangedEvent): Promise<RuleExecutionResult[]> {
    const triggerTypes: string[] = ['TASK_STATUS_CHANGED'];
    if (event.newStatus === TaskStatus.DONE) {
      triggerTypes.push('TASK_COMPLETED');
    }

    return this.evaluateAndExecute(event.userId, triggerTypes, event);
  }

  public async handleMilestoneStatusChanged(event: MilestoneStatusChangedEvent): Promise<RuleExecutionResult[]> {
    const triggerTypes: string[] = ['MILESTONE_STATUS_CHANGED'];
    if (event.newStatus === MilestoneStatus.REACHED) {
      triggerTypes.push('MILESTONE_REACHED');
    }

    return this.evaluateAndExecute(event.userId, triggerTypes, event);
  }

  public async handleLearningRecorded(event: LearningRecordedEvent): Promise<RuleExecutionResult[]> {
    return this.evaluateAndExecute(event.userId, ['LEARNING_LOGGED'], event);
  }

  public async handleEvidenceCreated(event: EvidenceCreatedEvent): Promise<RuleExecutionResult[]> {
    return this.evaluateAndExecute(event.userId, ['EVIDENCE_CREATED'], event);
  }

  public async handleDeadlineApproaching(event: DeadlineApproachingEvent): Promise<RuleExecutionResult[]> {
    return this.evaluateAndExecute(event.userId, ['DEADLINE_APPROACHING'], event);
  }

  /**
   * Core evaluator: fetches matching rules, checks conditions, and safely executes actions.
   */
  public async evaluateAndExecute(
    userId: string,
    triggerTypes: string[],
    event: DomainEvent
  ): Promise<RuleExecutionResult[]> {
    const results: RuleExecutionResult[] = [];

    try {
      const activeRules = await prisma.automationRule.findMany({
        where: {
          userId,
          triggerType: { in: triggerTypes },
          isEnabled: true,
        },
      });

      for (const rule of activeRules) {
        const conditions = (rule.conditions || {}) as AutomationConditionDef;
        const isMatched = this.evaluateCondition(conditions, event);

        if (!isMatched) {
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            matched: false,
            actionsExecuted: 0,
          });
          continue;
        }

        const actions = Array.isArray(rule.actions) ? (rule.actions as unknown as AutomationActionDef[]) : [];
        let executedCount = 0;
        const errors: string[] = [];

        for (const action of actions) {
          try {
            await this.executeAction(rule.id, rule.name, userId, action, event);
            executedCount++;
          } catch (err: any) {
            logger.error({ err }, `[AutomationEngine] Error executing action in rule ${rule.id}`);
            errors.push(err.message || 'Action execution error');
          }
        }

        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          matched: true,
          actionsExecuted: executedCount,
          errors: errors.length > 0 ? errors : undefined,
        });

        // Audit the automated rule run
        await recordAuditLog({
          userId,
          entityType: 'AUTOMATION_RULE',
          entityId: rule.id,
          action: 'AUTOMATION_RULE_EXECUTED',
          metadata: {
            ruleName: rule.name,
            triggerType: rule.triggerType,
            actionsExecuted: executedCount,
            eventDepth: event.depth ?? 0,
          },
        });
      }
    } catch (err) {
      logger.error({ err }, '[AutomationEngine] Fatal error in evaluateAndExecute');
    }

    return results;
  }

  /**
   * Pure deterministic condition evaluation without unsafe eval().
   */
  public evaluateCondition(condition: AutomationConditionDef, event: DomainEvent): boolean {
    if (!condition || Object.keys(condition).length === 0) {
      return true;
    }

    const anyEvent = event as any;

    if (condition.projectId && anyEvent.projectId !== condition.projectId) {
      return false;
    }

    if (condition.milestoneId && anyEvent.milestoneId !== condition.milestoneId) {
      return false;
    }

    if (condition.tagIncludes) {
      const tags = anyEvent.tags as string[] | undefined;
      if (!tags || !tags.includes(condition.tagIncludes)) {
        return false;
      }
    }

    if (condition.minMinutes !== undefined) {
      const minutes = (anyEvent.minutes as number | undefined) || 0;
      if (minutes < condition.minMinutes) {
        return false;
      }
    }

    if (condition.statusEquals) {
      const newStatus = anyEvent.newStatus as string | undefined;
      if (newStatus !== condition.statusEquals) {
        return false;
      }
    }

    if (condition.entityType) {
      const entityType = anyEvent.entityType as string | undefined;
      if (entityType !== condition.entityType) {
        return false;
      }
    }

    return true;
  }

  /**
   * Safely executes a single action with depth propagation.
   */
  private async executeAction(
    ruleId: string,
    ruleName: string,
    userId: string,
    action: AutomationActionDef,
    event: DomainEvent
  ): Promise<void> {
    const currentDepth = (event.depth ?? 0) + 1;

    switch (action.type) {
      case 'CREATE_TASK': {
        const anyEvent = event as any;
        const targetProjectId = action.params?.projectId || anyEvent.projectId;
        if (!targetProjectId) {
          logger.warn(`[AutomationEngine] CREATE_TASK skipped: no projectId resolved.`);
          return;
        }

        const newTask = await prisma.task.create({
          data: {
            userId,
            projectId: targetProjectId,
            milestoneId: action.params?.milestoneId || anyEvent.milestoneId || null,
            title: action.params?.title || `Follow-up: ${ruleName}`,
            description: action.params?.description || `Auto-generated by automation rule: ${ruleName}`,
            priority: action.params?.priority || 'P2',
            status: TaskStatus.READY,
          },
        });

        // Emit new event if depth permits
        await domainEventBus.emit({
          type: 'task.status_changed',
          userId,
          taskId: newTask.id,
          previousStatus: TaskStatus.BACKLOG,
          newStatus: TaskStatus.READY,
          title: newTask.title,
          projectId: newTask.projectId,
          milestoneId: newTask.milestoneId,
          depth: currentDepth,
        });
        break;
      }

      case 'CREATE_NOTIFICATION': {
        await prisma.userMemory.create({
          data: {
            userId,
            key: `auto_${ruleId}_${Date.now()}`,
            value: JSON.stringify({
              ruleId,
              ruleName,
              message: action.params?.message || `Automation rule executed: ${ruleName}`,
              timestamp: new Date().toISOString(),
            }),
            category: 'OTHER',
            source: 'AUTOMATION',
            confidence: 1.0,
          },
        });
        break;
      }

      case 'UPDATE_TASK_STATUS': {
        const taskId = action.params?.taskId;
        const targetStatus = action.params?.status as TaskStatus | undefined;
        if (taskId && targetStatus) {
          const existing = await prisma.task.findFirst({
            where: { id: taskId, userId },
          });
          if (existing && existing.status !== targetStatus) {
            await prisma.task.update({
              where: { id: taskId },
              data: { status: targetStatus },
            });

            await domainEventBus.emit({
              type: 'task.status_changed',
              userId,
              taskId,
              previousStatus: existing.status,
              newStatus: targetStatus,
              title: existing.title,
              projectId: existing.projectId,
              milestoneId: existing.milestoneId,
              depth: currentDepth,
            });
          }
        }
        break;
      }

      case 'RECORD_AUDIT_LOG': {
        await recordAuditLog({
          userId,
          entityType: 'AUTOMATION_ACTION',
          entityId: ruleId,
          action: action.params?.action || 'ACTION_EXECUTED',
          metadata: {
            ruleName,
            ...action.params,
          },
        });
        break;
      }

      default:
        logger.warn(`[AutomationEngine] Unrecognized action type: ${(action as any).type}`);
    }
  }
}

export const automationEngineService = AutomationEngineService.getInstance();
