import { TaskStatus, MilestoneStatus } from '@prisma/client';
import { logger } from '../../lib/logger.js';

export const MAX_CASCADE_DEPTH = 3;

export interface BaseDomainEvent {
  userId: string;
  depth?: number;
  timestamp?: Date;
}

export interface TaskStatusChangedEvent extends BaseDomainEvent {
  type: 'task.status_changed';
  taskId: string;
  previousStatus: TaskStatus;
  newStatus: TaskStatus;
  title: string;
  projectId?: string | null;
  milestoneId?: string | null;
  tags?: string[];
}

export interface MilestoneStatusChangedEvent extends BaseDomainEvent {
  type: 'milestone.status_changed';
  milestoneId: string;
  previousStatus: MilestoneStatus;
  newStatus: MilestoneStatus;
  title: string;
  projectId: string;
}

export interface LearningRecordedEvent extends BaseDomainEvent {
  type: 'learning.recorded';
  learningItemId: string;
  minutes: number;
  title: string;
  skillIds?: string[];
}

export interface EvidenceCreatedEvent extends BaseDomainEvent {
  type: 'evidence.created';
  evidenceId: string;
  title: string;
  evidenceType: string;
  url?: string;
  projectId?: string;
  taskId?: string;
}

export interface DeadlineApproachingEvent extends BaseDomainEvent {
  type: 'deadline.approaching';
  entityType: 'TASK' | 'MILESTONE' | 'ACADEMIC_EXAM' | 'ACADEMIC_ASSIGNMENT';
  entityId: string;
  title: string;
  dueDate: Date;
  daysRemaining: number;
}

export interface DomainEventMap {
  'task.status_changed': TaskStatusChangedEvent;
  'milestone.status_changed': MilestoneStatusChangedEvent;
  'learning.recorded': LearningRecordedEvent;
  'evidence.created': EvidenceCreatedEvent;
  'deadline.approaching': DeadlineApproachingEvent;
}

export type DomainEvent =
  | TaskStatusChangedEvent
  | MilestoneStatusChangedEvent
  | LearningRecordedEvent
  | EvidenceCreatedEvent
  | DeadlineApproachingEvent;

export type DomainEventType = keyof DomainEventMap;
export type DomainEventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void> | void;

export class DomainEventBus {
  private static instance: DomainEventBus;
  private listeners: Map<DomainEventType, Set<DomainEventHandler<any>>> = new Map();

  private constructor() {}

  public static getInstance(): DomainEventBus {
    if (!DomainEventBus.instance) {
      DomainEventBus.instance = new DomainEventBus();
    }
    return DomainEventBus.instance;
  }

  /**
   * Subscribe a typed listener callback to an event type.
   * Returns an unsubscribe function.
   */
  public subscribe<K extends keyof DomainEventMap>(
    eventType: K,
    handler: (event: DomainEventMap[K]) => Promise<void> | void
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);

    return () => {
      this.listeners.get(eventType)?.delete(handler);
    };
  }

  /**
   * Emits a domain event asynchronously to all registered listeners.
   * Enforces recursion depth protection (max depth 3).
   */
  public async emit(event: DomainEvent): Promise<void> {
    const currentDepth = event.depth ?? 0;
    if (currentDepth >= MAX_CASCADE_DEPTH) {
      logger.warn(
        `[DomainEventBus] Max cascade depth limit (${MAX_CASCADE_DEPTH}) reached for event ${event.type}. Aborting event propagation to prevent infinite recursion loop.`
      );
      return;
    }

    const eventWithMetadata: DomainEvent = {
      ...event,
      depth: currentDepth,
      timestamp: event.timestamp || new Date(),
    };

    const handlers = this.listeners.get(event.type);
    if (!handlers || handlers.size === 0) {
      return;
    }

    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(eventWithMetadata);
      } catch (err) {
        logger.error({ err }, `[DomainEventBus] Error executing handler for ${event.type}`);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Clears all registered event handlers (useful for test isolation).
   */
  public clearListeners(): void {
    this.listeners.clear();
  }
}

export const domainEventBus = DomainEventBus.getInstance();

