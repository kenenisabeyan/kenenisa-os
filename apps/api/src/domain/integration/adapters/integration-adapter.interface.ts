import type { IntegrationAccount, IntegrationProvider } from '@prisma/client';

export interface ConnectionTestResult {
  ok: boolean;
  accountEmail?: string;
  accountName?: string;
  errorMessage?: string;
}

export interface SyncResult {
  itemsImported: number;
  itemsExported: number;
  itemsFailed: number;
  errors: string[];
}

export interface IntegrationAdapter {
  readonly provider: IntegrationProvider;
  testConnection(token: string): Promise<ConnectionTestResult>;
  sync(account: IntegrationAccount, userId: string): Promise<SyncResult>;
}

