import { apiClient } from '../../lib/api-client.js';

export type IntegrationProvider = 'GOOGLE_CALENDAR' | 'GITHUB' | 'GOOGLE_DRIVE' | 'GMAIL' | 'CUSTOM_WEBHOOK';
export type IntegrationStatus = 'CONNECTED' | 'DISCONNECTED' | 'SYNCING' | 'ERROR';

export interface IntegrationAccountDto {
  id: string;
  userId: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  accountEmail?: string | null;
  accountName?: string | null;
  scopes: string[];
  settings?: Record<string, any> | null;
  lastSyncAt?: string | null;
  lastSyncStatus?: string | null;
  lastErrorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderSummaryDto {
  provider: IntegrationProvider;
  connected: boolean;
  account: IntegrationAccountDto | null;
}

export interface IntegrationSyncLogDto {
  id: string;
  integrationAccountId: string;
  userId: string;
  provider: IntegrationProvider;
  triggerType: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  itemsImported: number;
  itemsExported: number;
  itemsFailed: number;
  durationMs: number;
  errorDetails?: string | null;
  startedAt: string;
  completedAt?: string | null;
  integrationAccount?: {
    accountEmail?: string | null;
    accountName?: string | null;
  };
}

export interface GetIntegrationsResponse {
  accounts: IntegrationAccountDto[];
  providers: ProviderSummaryDto[];
}

export interface ConnectIntegrationInput {
  provider: IntegrationProvider;
  token: string;
  refreshToken?: string;
  scopes?: string[];
  settings?: Record<string, any>;
}

export async function fetchIntegrations(): Promise<GetIntegrationsResponse> {
  return apiClient<GetIntegrationsResponse>('/api/v1/integrations');
}

export async function connectIntegration(input: ConnectIntegrationInput): Promise<any> {
  return apiClient('/api/v1/integrations/connect', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function disconnectIntegration(provider: IntegrationProvider): Promise<any> {
  return apiClient(`/api/v1/integrations/${provider}/disconnect`, {
    method: 'POST',
  });
}

export async function syncIntegration(provider: IntegrationProvider): Promise<any> {
  return apiClient(`/api/v1/integrations/${provider}/sync`, {
    method: 'POST',
  });
}

export async function syncAllIntegrations(): Promise<any> {
  return apiClient('/api/v1/integrations/sync-all', {
    method: 'POST',
  });
}

export async function fetchIntegrationLogs(limit = 30): Promise<{ logs: IntegrationSyncLogDto[] }> {
  return apiClient<{ logs: IntegrationSyncLogDto[] }>(`/api/v1/integrations/logs?limit=${limit}`);
}

