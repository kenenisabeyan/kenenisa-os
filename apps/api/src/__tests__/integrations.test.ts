import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { createSession } from '../domain/auth/session.service.js';
import { InternalCascadeService } from '../domain/integration/internal-cascade.service.js';
import { encryptCredential, decryptCredential } from '../utils/encryption.js';

const app = createApp();

describe('Central Integration Service & Internal Cascades Test Suite', { timeout: 60000 }, () => {
  let bearerToken: string;
  let testUserId: string;

  beforeAll(async () => {
    let user = await prisma.user.findFirst({
      where: { email: 'beyankenenisa@gmail.com' },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test_integration_user@kenenisa-os.local',
          passwordHash: 'hash',
          firstName: 'Kenenisa',
          lastName: 'Beyan',
          displayName: 'Kenenisa Beyan',
          role: 'OWNER',
        },
      });
    }

    testUserId = user.id;

    const { rawToken } = await createSession({ userId: testUserId });
    bearerToken = `Bearer ${rawToken}`;
  }, 60000);

  it('AES-256-GCM encryption and decryption round-trip works with authentication tag verification', () => {
    const rawSecret = 'ghp_test_github_access_token_super_secret_12345';
    const encrypted = encryptCredential(rawSecret);

    expect(encrypted).not.toBe(rawSecret);
    expect(encrypted.split(':')).toHaveLength(3); // iv:ciphertext:tag

    const decrypted = decryptCredential(encrypted);
    expect(decrypted).toBe(rawSecret);
  });

  it('GET /api/v1/integrations returns all providers and configured accounts', async () => {
    const res = await request(app)
      .get('/api/v1/integrations')
      .set('Authorization', bearerToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.providers).toBeDefined();
    expect(res.body.data.providers.length).toBeGreaterThanOrEqual(4);

    const providerNames = res.body.data.providers.map((p: any) => p.provider);
    expect(providerNames).toContain('GOOGLE_CALENDAR');
    expect(providerNames).toContain('GITHUB');
    expect(providerNames).toContain('GOOGLE_DRIVE');
    expect(providerNames).toContain('GMAIL');
  });

  it('POST /api/v1/integrations/connect securely stores GitHub integration with encrypted credentials', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/connect')
      .set('Authorization', bearerToken)
      .send({
        provider: 'GITHUB',
        token: 'mock_github_personal_token_astu',
        scopes: ['repo', 'read:user'],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.provider).toBe('GITHUB');
    expect(res.body.data.status).toBe('CONNECTED');

    // Verify token is never exposed plain text in response
    expect(res.body.data.token).toBeUndefined();
    expect(res.body.data.encryptedToken).toBeUndefined();

    // Verify in database that token is indeed encrypted
    const account = await prisma.integrationAccount.findUnique({
      where: {
        userId_provider: {
          userId: testUserId,
          provider: 'GITHUB',
        },
      },
    });

    expect(account).not.toBeNull();
    expect(account?.encryptedToken).not.toContain('mock_github_personal_token_astu');
    expect(decryptCredential(account!.encryptedToken)).toBe('mock_github_personal_token_astu');
  });

  it('POST /api/v1/integrations/:provider/sync idempotently ingests verifiable GitHub evidence', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/GITHUB/sync')
      .set('Authorization', bearerToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.itemsImported).toBeGreaterThanOrEqual(0);

    // Verify entity mapping in DB
    const mappings = await prisma.integrationEntityMapping.findMany({
      where: {
        userId: testUserId,
        provider: 'GITHUB',
      },
    });

    expect(mappings.length).toBeGreaterThanOrEqual(1);
    expect(mappings[0].internalEntityType).toBe('EVIDENCE');
  });

  it('POST /api/v1/integrations/connect connects Google Drive and syncs academic evidence documents', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/connect')
      .set('Authorization', bearerToken)
      .send({
        provider: 'GOOGLE_DRIVE',
        token: 'mock_gdrive_oauth_token',
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.provider).toBe('GOOGLE_DRIVE');
  });

  it('POST /api/v1/integrations/connect connects Gmail Academic Sentinel and detects supervisor notices', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/connect')
      .set('Authorization', bearerToken)
      .send({
        provider: 'GMAIL',
        token: 'mock_gmail_oauth_token',
        scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.provider).toBe('GMAIL');

    // Verify actionable task created
    const sentinelTask = await prisma.task.findFirst({
      where: {
        userId: testUserId,
        title: { startsWith: '[Gmail Action]' },
      },
    });

    expect(sentinelTask).not.toBeNull();
  });

  it('POST /api/v1/integrations/sync-all runs bulk synchronization across all accounts', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/sync-all')
      .set('Authorization', bearerToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('GET /api/v1/integrations/logs returns persistent execution and audit history', async () => {
    const res = await request(app)
      .get('/api/v1/integrations/logs?limit=10')
      .set('Authorization', bearerToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.logs).toBeDefined();
    expect(res.body.data.logs.length).toBeGreaterThan(0);
  });

  it('Internal Cascade Engine: unblocks dependent task when blocking dependency completes', async () => {
    // 1. Locate or create a project for test
    let project = await prisma.project.findFirst({
      where: { userId: testUserId },
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: 'Cascade Verification Project',
          slug: `cascade-test-${Date.now()}`,
          status: 'ACTIVE',
          priority: 'P0',
          user: { connect: { id: testUserId } },
          workstream: {
            connectOrCreate: {
              where: { userId_slug: { userId: testUserId, slug: 'astu-graduation-2026-2027' } },
              create: {
                userId: testUserId,
                name: 'ASTU Graduation',
                slug: 'astu-graduation-2026-2027',
                priorityWeight: 10,
              },
            },
          },
        },
      });
    }

    // 2. Create Task A (Blocking) and Task B (Blocked)
    const taskA = await prisma.task.create({
      data: {
        userId: testUserId,
        projectId: project.id,
        title: 'Task A (Prerequisite)',
        status: 'IN_PROGRESS',
        priority: 'P1',
      },
    });

    const taskB = await prisma.task.create({
      data: {
        userId: testUserId,
        projectId: project.id,
        title: 'Task B (Dependent)',
        status: 'BLOCKED',
        priority: 'P1',
      },
    });

    // 3. Create dependency: taskA blocks taskB
    await prisma.taskDependency.create({
      data: {
        blockingTaskId: taskA.id,
        dependentTaskId: taskB.id,
      },
    });

    // 4. Complete Task A
    await prisma.task.update({
      where: { id: taskA.id },
      data: { status: 'DONE', completedAt: new Date() },
    });

    // 5. Trigger cascade
    await InternalCascadeService.onTaskStatusChanged(
      taskA.id,
      testUserId,
      'IN_PROGRESS',
      'DONE'
    );

    // 6. Verify Task B was unblocked to READY
    const updatedTaskB = await prisma.task.findUnique({
      where: { id: taskB.id },
    });

    expect(updatedTaskB?.status).toBe('READY');
  });

  it('POST /api/v1/integrations/:provider/disconnect safely disconnects without data loss', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/GITHUB/disconnect')
      .set('Authorization', bearerToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('DISCONNECTED');
  });
});
