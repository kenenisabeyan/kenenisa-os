import { describe, it, expect, beforeEach, vi } from 'vitest';
import crypto from 'node:crypto';
import { TaskStatus } from '@prisma/client';
import {
  domainEventBus,
  MAX_CASCADE_DEPTH,
  TaskStatusChangedEvent,
} from '../domain/automation/domain-event-bus.js';
import {
  automationEngineService,
  AutomationConditionDef,
} from '../domain/automation/automation-engine.service.js';
import { webhookService } from '../domain/integration/webhook.service.js';

describe('DomainEventBus & AutomationEngineService', () => {
  beforeEach(() => {
    domainEventBus.clearListeners();
    vi.restoreAllMocks();
  });

  describe('DomainEventBus', () => {
    it('should register listeners and receive typed events', async () => {
      let receivedEvent: any = null;

      const unsubscribe = domainEventBus.subscribe('task.status_changed', (evt) => {
        receivedEvent = evt;
      });

      await domainEventBus.emit({
        type: 'task.status_changed',
        userId: 'user_123',
        taskId: 'task_001',
        previousStatus: TaskStatus.READY,
        newStatus: TaskStatus.DONE,
        title: 'Complete System Integration Matrix',
        depth: 0,
      });

      expect(receivedEvent).not.toBeNull();
      expect(receivedEvent?.taskId).toBe('task_001');
      expect(receivedEvent?.newStatus).toBe(TaskStatus.DONE);
      expect(receivedEvent?.depth).toBe(0);

      // Test unsubscribe
      receivedEvent = null;
      unsubscribe();

      await domainEventBus.emit({
        type: 'task.status_changed',
        userId: 'user_123',
        taskId: 'task_002',
        previousStatus: TaskStatus.BACKLOG,
        newStatus: TaskStatus.READY,
        title: 'Next Task',
      });

      expect(receivedEvent).toBeNull();
    });

    it('should halt propagation when cascade depth reaches limit (prevent infinite loops)', async () => {
      let callsAtDepth3 = 0;

      domainEventBus.subscribe('task.status_changed', () => {
        callsAtDepth3++;
      });

      // Emit event at depth = MAX_CASCADE_DEPTH (3)
      await domainEventBus.emit({
        type: 'task.status_changed',
        userId: 'user_123',
        taskId: 'task_loop',
        previousStatus: TaskStatus.READY,
        newStatus: TaskStatus.DONE,
        title: 'Recursive Task',
        depth: MAX_CASCADE_DEPTH,
      });

      // Should be blocked and not invoke handlers
      expect(callsAtDepth3).toBe(0);
    });

    it('should isolate listener errors without halting other listeners', async () => {
      const executionOrder: string[] = [];

      domainEventBus.subscribe('learning.recorded', () => {
        executionOrder.push('first');
        throw new Error('Simulated listener failure');
      });

      domainEventBus.subscribe('learning.recorded', () => {
        executionOrder.push('second');
      });

      await domainEventBus.emit({
        type: 'learning.recorded',
        userId: 'user_123',
        learningItemId: 'item_1',
        minutes: 45,
        title: 'Deep Learning with PyTorch',
      });

      expect(executionOrder).toEqual(['first', 'second']);
    });
  });

  describe('AutomationEngine Condition Evaluator', () => {
    it('should evaluate deterministic condition predicates safely without eval', () => {
      const condition: AutomationConditionDef = {
        projectId: 'proj_astu_grad',
        statusEquals: TaskStatus.DONE,
      };

      const matchingEvent: TaskStatusChangedEvent = {
        type: 'task.status_changed',
        userId: 'user_123',
        taskId: 'task_01',
        previousStatus: TaskStatus.IN_PROGRESS,
        newStatus: TaskStatus.DONE,
        title: 'Defense Chapter 1',
        projectId: 'proj_astu_grad',
      };

      const nonMatchingEvent: TaskStatusChangedEvent = {
        type: 'task.status_changed',
        userId: 'user_123',
        taskId: 'task_02',
        previousStatus: TaskStatus.IN_PROGRESS,
        newStatus: TaskStatus.DONE,
        title: 'EDOT Marketing Plan',
        projectId: 'proj_edot',
      };

      expect(automationEngineService.evaluateCondition(condition, matchingEvent)).toBe(true);
      expect(automationEngineService.evaluateCondition(condition, nonMatchingEvent)).toBe(false);
    });

    it('should evaluate tag and minimum minutes conditions', () => {
      const tagCondition: AutomationConditionDef = {
        tagIncludes: 'graduation',
      };

      const taggedEvent: TaskStatusChangedEvent = {
        type: 'task.status_changed',
        userId: 'user_123',
        taskId: 'task_03',
        previousStatus: TaskStatus.READY,
        newStatus: TaskStatus.IN_PROGRESS,
        title: 'Chapter 2 Literature Review',
        tags: ['academic', 'graduation', 'thesis'],
      };

      expect(automationEngineService.evaluateCondition(tagCondition, taggedEvent)).toBe(true);

      const minutesCondition: AutomationConditionDef = {
        minMinutes: 60,
      };

      expect(
        automationEngineService.evaluateCondition(minutesCondition, {
          type: 'learning.recorded',
          userId: 'user_123',
          learningItemId: 'item_ai',
          minutes: 90,
          title: 'Transformer Architecture',
        })
      ).toBe(true);

      expect(
        automationEngineService.evaluateCondition(minutesCondition, {
          type: 'learning.recorded',
          userId: 'user_123',
          learningItemId: 'item_ai',
          minutes: 30,
          title: 'Transformer Architecture',
        })
      ).toBe(false);
    });
  });

  describe('WebhookService HMAC Verification', () => {
    const testSecret = 'astu_kenenisa_secret_key_2026';
    const testPayload = JSON.stringify({ event: 'push', repository: 'kenenisa-os' });

    it('should verify correct HMAC-SHA256 signature with sha256= prefix', () => {
      const validHmac = crypto.createHmac('sha256', testSecret).update(testPayload).digest('hex');
      const headerWithPrefix = `sha256=${validHmac}`;

      const isValid = webhookService.verifySignature(testPayload, headerWithPrefix, testSecret);
      expect(isValid).toBe(true);
    });

    it('should reject invalid or tampered HMAC signature', () => {
      const invalidHeader = 'sha256=0000000000000000000000000000000000000000000000000000000000000000';
      const isValid = webhookService.verifySignature(testPayload, invalidHeader, testSecret);
      expect(isValid).toBe(false);
    });

    it('should reject missing signature header or secret', () => {
      expect(webhookService.verifySignature(testPayload, undefined, testSecret)).toBe(false);
      expect(webhookService.verifySignature(testPayload, 'sha256=123', '')).toBe(false);
    });
  });
});

