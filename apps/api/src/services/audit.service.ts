import { prisma } from '../lib/prisma.js';
import type { Prisma } from '@prisma/client';

export interface RecordAuditParams {
  userId: string;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export async function recordAuditLog(params: RecordAuditParams): Promise<void> {
  try {
    const safeMetadata = params.metadata ? sanitizeMetadata(params.metadata) : undefined;

    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        metadata: safeMetadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    console.error('⚠️ Failed to create audit log entry:', error);
  }
}

function sanitizeMetadata(meta: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const forbiddenKeys = [
    'password',
    'passwordHash',
    'token',
    'rawToken',
    'cookie',
    'authorization',
    'secret',
  ];

  for (const [key, value] of Object.entries(meta)) {
    if (forbiddenKeys.some((k) => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
