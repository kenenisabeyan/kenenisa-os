import crypto from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { TaskStatus, EvidenceType } from '@prisma/client';
import { recordAuditLog } from '../../services/audit.service.js';
import { logger } from '../../lib/logger.js';
import { domainEventBus } from '../automation/domain-event-bus.js';
import { InternalCascadeService } from './internal-cascade.service.js';

export class WebhookService {
  private static instance: WebhookService;

  private constructor() {}

  public static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  /**
   * Verifies HMAC-SHA256 signature safely against timing attacks.
   */
  public verifySignature(
    rawBody: string | Buffer,
    signatureHeader: string | undefined,
    secret: string
  ): boolean {
    if (!signatureHeader || !secret) {
      return false;
    }

    try {
      // Signature header may be "sha256=abcdef..." (GitHub) or raw hex
      const cleanSignature = signatureHeader.startsWith('sha256=')
        ? signatureHeader.slice(7)
        : signatureHeader;

      const computedHmac = crypto
        .createHmac('sha256', secret)
        .update(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'))
        .digest('hex');

      const computedBuffer = Buffer.from(computedHmac, 'utf8');
      const signatureBuffer = Buffer.from(cleanSignature, 'utf8');

      if (computedBuffer.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(computedBuffer, signatureBuffer);
    } catch (err) {
      logger.error({ err }, '[WebhookService] Signature verification error');
      return false;
    }
  }

  /**
   * Handles incoming webhooks from external providers.
   */
  public async processWebhook(
    provider: string,
    headers: Record<string, any>,
    payload: any,
    rawBody?: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const normalizedProvider = provider.toUpperCase();

    // 1. Resolve integration account or fallback webhook secret
    const signatureHeader =
      headers['x-hub-signature-256'] ||
      headers['x-signature-256'] ||
      headers['x-webhook-signature'];

    // Find integration account matching provider or with webhook settings
    const account = await prisma.integrationAccount.findFirst({
      where: {
        provider: normalizedProvider === 'GITHUB' ? 'GITHUB' : 'CUSTOM_WEBHOOK',
        status: 'CONNECTED',
      },
    });

    const configuredSecret =
      (account?.settings as any)?.webhookSecret ||
      process.env.WEBHOOK_SECRET ||
      'kenenisa_os_secure_webhook_secret_fallback';

    // Verify HMAC signature
    const payloadString = rawBody || JSON.stringify(payload);
    const isValidSignature = this.verifySignature(payloadString, signatureHeader, configuredSecret);

    if (!isValidSignature && process.env.NODE_ENV === 'production') {
      logger.warn(`[WebhookService] Rejected webhook for ${provider}: Invalid HMAC signature`);
      return { success: false, message: 'Invalid HMAC signature' };
    }

    const userId = account?.userId || (await this.resolveDefaultUserId());
    if (!userId) {
      return { success: false, message: 'No target user resolved for webhook processing' };
    }

    let processedItems = 0;

    // 2. Process provider-specific events
    if (normalizedProvider === 'GITHUB') {
      const githubEvent = headers['x-github-event'] || 'push';

      if (githubEvent === 'push' && Array.isArray(payload?.commits)) {
        for (const commit of payload.commits) {
          try {
            // Find target project if available
            const project = await prisma.project.findFirst({
              where: { userId },
              orderBy: { updatedAt: 'desc' },
            });

            // Record as verifiable evidence
            const evidence = await prisma.evidence.create({
              data: {
                userId,
                title: commit.message?.split('\n')[0] || `Commit ${commit.id?.slice(0, 7)}`,
                description: `Author: ${commit.author?.name || 'Kenenisa Beyan'}\nURL: ${commit.url}`,
                type: EvidenceType.GIT_COMMIT,
                url: commit.url,
                date: new Date(commit.timestamp || Date.now()),
                projects: project
                  ? {
                      create: {
                        projectId: project.id,
                      },
                    }
                  : undefined,
              },
            });

            // Emit evidence.created event
            await domainEventBus.emit({
              type: 'evidence.created',
              userId,
              evidenceId: evidence.id,
              title: evidence.title,
              evidenceType: 'GIT_COMMIT',
              url: evidence.url || undefined,
              projectId: project?.id,
            });

            // Check if commit closes/fixes a task: "fixes #taskId" or "done #taskId"
            const match = commit.message?.match(/(?:fixes|closes|resolves|done)\s+#([a-zA-Z0-9_-]+)/i);
            if (match && match[1]) {
              const targetTaskId = match[1];
              const task = await prisma.task.findFirst({
                where: { id: targetTaskId, userId },
              });

              if (task && task.status !== TaskStatus.DONE) {
                await prisma.task.update({
                  where: { id: task.id },
                  data: { status: TaskStatus.DONE, completedAt: new Date() },
                });

                await InternalCascadeService.onTaskStatusChanged(
                  task.id,
                  userId,
                  task.status,
                  TaskStatus.DONE
                );
              }
            }

            processedItems++;
          } catch (err) {
            logger.error({ err }, '[WebhookService] Error saving commit evidence');
          }
        }
      }
    } else {
      // Custom / Academic webhook ingress
      if (payload?.type === 'ACADEMIC_DEADLINE' && payload?.title && payload?.dueDate) {
        await domainEventBus.emit({
          type: 'deadline.approaching',
          userId,
          entityType: payload.entityType || 'ACADEMIC_ASSIGNMENT',
          entityId: payload.id || 'ext_' + Date.now(),
          title: payload.title,
          dueDate: new Date(payload.dueDate),
          daysRemaining: Math.max(
            0,
            Math.ceil((new Date(payload.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          ),
        });
        processedItems++;
      }
    }

    await recordAuditLog({
      userId,
      entityType: 'INTEGRATION',
      entityId: account?.id || 'webhook_' + provider,
      action: 'WEBHOOK_RECEIVED',
      metadata: {
        provider: normalizedProvider,
        processedItems,
      },
    });

    return {
      success: true,
      message: `Successfully processed ${processedItems} items from ${provider} webhook`,
      data: { processedItems },
    };
  }

  private async resolveDefaultUserId(): Promise<string | null> {
    const user = await prisma.user.findFirst({
      select: { id: true },
    });
    return user?.id || null;
  }
}

export const webhookService = WebhookService.getInstance();
