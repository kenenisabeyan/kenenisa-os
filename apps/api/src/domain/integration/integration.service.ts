import { prisma } from '../../lib/prisma.js';
import type { IntegrationProvider, IntegrationStatus } from '@prisma/client';
import { encryptCredential } from '../../utils/encryption.js';
import type { IntegrationAdapter, SyncResult } from './adapters/integration-adapter.interface.js';
import { GoogleCalendarAdapter } from './adapters/google-calendar.adapter.js';
import { GitHubAdapter } from './adapters/github.adapter.js';
import { GoogleDriveAdapter } from './adapters/google-drive.adapter.js';
import { GmailAdapter } from './adapters/gmail.adapter.js';

export interface ConnectIntegrationInput {
  provider: IntegrationProvider;
  token: string;
  refreshToken?: string;
  scopes?: string[];
  settings?: Record<string, any>;
}

export class IntegrationService {
  private adapters: Map<IntegrationProvider, IntegrationAdapter> = new Map();

  constructor() {
    this.adapters.set('GOOGLE_CALENDAR', new GoogleCalendarAdapter());
    this.adapters.set('GITHUB', new GitHubAdapter());
    this.adapters.set('GOOGLE_DRIVE', new GoogleDriveAdapter());
    this.adapters.set('GMAIL', new GmailAdapter());
  }

  private getAdapter(provider: IntegrationProvider): IntegrationAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`Integration provider '${provider}' is not supported.`);
    }
    return adapter;
  }

  async getAccounts(userId: string) {
    const configuredAccounts = await prisma.integrationAccount.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        provider: true,
        status: true,
        accountEmail: true,
        accountName: true,
        scopes: true,
        settings: true,
        lastSyncAt: true,
        lastSyncStatus: true,
        lastErrorMessage: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const allProviders: IntegrationProvider[] = ['GOOGLE_CALENDAR', 'GITHUB', 'GOOGLE_DRIVE', 'GMAIL'];

    const providerSummaries = allProviders.map(p => {
      const existing = configuredAccounts.find(acc => acc.provider === p);
      return {
        provider: p,
        connected: !!existing && existing.status !== 'DISCONNECTED',
        account: existing || null,
      };
    });

    return {
      accounts: configuredAccounts,
      providers: providerSummaries,
    };
  }

  async connectAccount(userId: string, input: ConnectIntegrationInput) {
    const adapter = this.getAdapter(input.provider);

    // Test connection first
    const testResult = await adapter.testConnection(input.token);
    if (!testResult.ok) {
      throw new Error(testResult.errorMessage || `Authentication failed for provider ${input.provider}`);
    }

    const encryptedToken = encryptCredential(input.token);
    const encryptedRefresh = input.refreshToken ? encryptCredential(input.refreshToken) : null;

    const account = await prisma.integrationAccount.upsert({
      where: {
        userId_provider: {
          userId,
          provider: input.provider,
        },
      },
      create: {
        userId,
        provider: input.provider,
        status: 'CONNECTED',
        encryptedToken,
        encryptedRefresh,
        accountEmail: testResult.accountEmail,
        accountName: testResult.accountName,
        scopes: input.scopes || [],
        settings: input.settings || {},
      },
      update: {
        status: 'CONNECTED',
        encryptedToken,
        encryptedRefresh: encryptedRefresh ?? undefined,
        accountEmail: testResult.accountEmail ?? undefined,
        accountName: testResult.accountName ?? undefined,
        scopes: input.scopes || [],
        settings: input.settings || undefined,
        lastErrorMessage: null,
      },
    });

    // Record initial connection log
    await prisma.integrationSyncLog.create({
      data: {
        integrationAccountId: account.id,
        userId,
        provider: input.provider,
        triggerType: 'MANUAL',
        status: 'SUCCESS',
        itemsImported: 0,
        itemsExported: 0,
        itemsFailed: 0,
        durationMs: 0,
        errorDetails: 'Initial connection verified successfully.',
      },
    });

    // Run initial sync asynchronously or synchronously
    try {
      await this.syncAccount(userId, input.provider);
    } catch {
      // Don't fail connection if initial sync had non-fatal warnings
    }

    return {
      success: true,
      provider: account.provider,
      status: account.status,
      accountEmail: account.accountEmail,
      accountName: account.accountName,
    };
  }

  async disconnectAccount(userId: string, provider: IntegrationProvider) {
    const account = await prisma.integrationAccount.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });

    if (!account) {
      throw new Error(`Integration for ${provider} not found.`);
    }

    await prisma.integrationAccount.update({
      where: { id: account.id },
      data: {
        status: 'DISCONNECTED',
        lastErrorMessage: null,
      },
    });

    await prisma.integrationSyncLog.create({
      data: {
        integrationAccountId: account.id,
        userId,
        provider,
        triggerType: 'MANUAL',
        status: 'SUCCESS',
        itemsImported: 0,
        itemsExported: 0,
        itemsFailed: 0,
        durationMs: 0,
        errorDetails: `Provider ${provider} successfully disconnected by operator.`,
      },
    });

    return { success: true, provider, status: 'DISCONNECTED' };
  }

  async syncAccount(userId: string, provider: IntegrationProvider): Promise<SyncResult> {
    const account = await prisma.integrationAccount.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });

    if (!account) {
      throw new Error(`Integration for ${provider} not found.`);
    }

    if (account.status === 'DISCONNECTED') {
      throw new Error(`Cannot synchronize disconnected integration ${provider}. Please reconnect.`);
    }

    const adapter = this.getAdapter(provider);
    const startedAt = new Date();

    // Mark as SYNCING
    await prisma.integrationAccount.update({
      where: { id: account.id },
      data: { status: 'SYNCING' },
    });

    let syncResult: SyncResult;
    try {
      syncResult = await adapter.sync(account, userId);
    } catch (err: any) {
      const durationMs = Date.now() - startedAt.getTime();
      await prisma.integrationAccount.update({
        where: { id: account.id },
        data: {
          status: 'ERROR',
          lastSyncAt: new Date(),
          lastSyncStatus: 'ERROR',
          lastErrorMessage: err.message,
        },
      });

      await prisma.integrationSyncLog.create({
        data: {
          integrationAccountId: account.id,
          userId,
          provider,
          triggerType: 'MANUAL',
          status: 'FAILED',
          itemsImported: 0,
          itemsExported: 0,
          itemsFailed: 1,
          durationMs,
          errorDetails: err.message,
          completedAt: new Date(),
        },
      });

      throw err;
    }

    const durationMs = Date.now() - startedAt.getTime();
    const isPartial = syncResult.errors.length > 0 && syncResult.itemsImported > 0;
    const isError = syncResult.errors.length > 0 && syncResult.itemsImported === 0 && syncResult.itemsExported === 0;

    const finalStatus: IntegrationStatus = isError ? 'ERROR' : 'CONNECTED';
    const lastSyncStatus = isError ? 'ERROR' : isPartial ? 'PARTIAL' : 'SUCCESS';
    const lastErrorMessage = syncResult.errors.length > 0 ? syncResult.errors.join('; ') : null;

    await prisma.integrationAccount.update({
      where: { id: account.id },
      data: {
        status: finalStatus,
        lastSyncAt: new Date(),
        lastSyncStatus,
        lastErrorMessage,
      },
    });

    await prisma.integrationSyncLog.create({
      data: {
        integrationAccountId: account.id,
        userId,
        provider,
        triggerType: 'MANUAL',
        status: isError ? 'FAILED' : 'SUCCESS',
        itemsImported: syncResult.itemsImported,
        itemsExported: syncResult.itemsExported,
        itemsFailed: syncResult.itemsFailed,
        durationMs,
        errorDetails: lastErrorMessage,
        completedAt: new Date(),
      },
    });

    return syncResult;
  }

  async syncAll(userId: string) {
    const activeAccounts = await prisma.integrationAccount.findMany({
      where: {
        userId,
        status: { in: ['CONNECTED', 'ERROR'] },
      },
    });

    const results: Record<string, SyncResult> = {};
    for (const acc of activeAccounts) {
      try {
        results[acc.provider] = await this.syncAccount(userId, acc.provider);
      } catch (err: any) {
        results[acc.provider] = {
          itemsImported: 0,
          itemsExported: 0,
          itemsFailed: 1,
          errors: [err.message],
        };
      }
    }

    return results;
  }

  async getSyncLogs(userId: string, limit = 50) {
    return prisma.integrationSyncLog.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: limit,
      include: {
        integrationAccount: {
          select: {
            accountEmail: true,
            accountName: true,
          },
        },
      },
    });
  }
}

export const integrationService = new IntegrationService();
