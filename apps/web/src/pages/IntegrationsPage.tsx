import React, { useState, useEffect } from 'react';
import {
  fetchIntegrations,
  connectIntegration,
  disconnectIntegration,
  syncIntegration,
  syncAllIntegrations,
  fetchIntegrationLogs,
  IntegrationAccountDto,
  ProviderSummaryDto,
  IntegrationSyncLogDto,
  IntegrationProvider,
} from '../features/integrations/api.js';
import { PageAiCopilot } from '../components/ai/PageAiCopilot.js';
import { getCachedApiData } from '../lib/api-client.js';

interface ProviderMeta {
  name: string;
  category: string;
  description: string;
  badge: string;
  iconBg: string;
  iconColor: string;
  svgPath: string;
  defaultScopes: string[];
  mockToken: string;
}

const PROVIDER_METADATA: Record<IntegrationProvider, ProviderMeta> = {
  GOOGLE_CALENDAR: {
    name: 'Google Calendar',
    category: 'Productivity & Planning',
    description:
      'Bidirectional calendar synchronization. Maps advisor meetings, ASTU academic schedule, and exams into Daily Focus TimeBlocks with capacity protection.',
    badge: 'Calendar',
    iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
    iconColor: 'text-blue-600',
    svgPath:
      'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    defaultScopes: ['https://www.googleapis.com/auth/calendar.events.readonly'],
    mockToken: 'mock_gcal_oauth_token',
  },
  GITHUB: {
    name: 'GitHub',
    category: 'Engineering & Code',
    description:
      'Indexes commits, merges, and pull requests from graduation repositories into verifiable engineering evidence linked to Individual & Group graduation projects and technical skills.',
    badge: 'Code Evidence',
    iconBg: 'bg-slate-100 text-slate-800 border-slate-300',
    iconColor: 'text-slate-800',
    svgPath:
      'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    defaultScopes: ['repo', 'read:user'],
    mockToken: 'mock_github_personal_token_astu',
  },
  GOOGLE_DRIVE: {
    name: 'Google Drive',
    category: 'Academic Documents',
    description:
      'Indexes thesis drafts, project architecture reports, and ASTU 5th-year semester syllabi as verified evidence documents for defense readiness.',
    badge: 'Documents',
    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconColor: 'text-emerald-700',
    svgPath:
      'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    defaultScopes: ['https://www.googleapis.com/auth/drive.readonly'],
    mockToken: 'mock_gdrive_oauth_token',
  },
  GMAIL: {
    name: 'Gmail Academic Sentinel',
    category: 'Communication Sentinel',
    description:
      'Strictly read-only monitoring of advisor notifications and department announcements. Automatically proposes actionable tasks without ever sending emails.',
    badge: 'Sentinel (Read-Only)',
    iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
    iconColor: 'text-rose-700',
    svgPath:
      'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    defaultScopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    mockToken: 'mock_gmail_oauth_token',
  },
  CUSTOM_WEBHOOK: {
    name: 'Custom Webhooks',
    category: 'Automation Triggers',
    description:
      'Incoming automation webhooks for external test runners, local scripts, and CI/CD status updates.',
    badge: 'Webhook',
    iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconColor: 'text-indigo-700',
    svgPath:
      'M13 10V3L4 14h7v7l9-11h-7z',
    defaultScopes: ['webhook:incoming'],
    mockToken: 'mock_webhook_secret_key',
  },
};

export const IntegrationsPage: React.FC = () => {
  const cachedIntegrations = getCachedApiData<{ providers: ProviderSummaryDto[]; accounts: IntegrationAccountDto[] }>('/api/v1/integrations');
  const [providers, setProviders] = useState<ProviderSummaryDto[]>(() => cachedIntegrations?.providers || []);
  const [accounts, setAccounts] = useState<IntegrationAccountDto[]>(() => cachedIntegrations?.accounts || []);
  const [logs, setLogs] = useState<IntegrationSyncLogDto[]>([]);
  const [loading, setLoading] = useState(() => providers.length === 0);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedProviderForConnect, setSelectedProviderForConnect] = useState<IntegrationProvider | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      if (providers.length === 0) {
        setLoading(true);
      }
      const res = await fetchIntegrations();
      setProviders(res.providers);
      setAccounts(res.accounts);
    } catch (err: any) {
      console.error('Failed to load integrations', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetchIntegrationLogs(30);
      setLogs(res.logs);
    } catch (err: any) {
      console.error('Failed to load logs', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncAll = async () => {
    try {
      setSyncingAll(true);
      await syncAllIntegrations();
      await loadData();
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncSingle = async (provider: IntegrationProvider) => {
    try {
      setSyncingProvider(provider);
      await syncIntegration(provider);
      await loadData();
    } catch (err: any) {
      alert(`Sync error: ${err.message}`);
    } finally {
      setSyncingProvider(null);
    }
  };

  const handleDisconnect = async (provider: IntegrationProvider) => {
    if (!window.confirm(`Are you sure you want to disconnect ${provider}? Imported evidence and tasks remain preserved.`)) {
      return;
    }
    try {
      await disconnectIntegration(provider);
      await loadData();
    } catch (err: any) {
      alert(`Disconnect error: ${err.message}`);
    }
  };

  const handleOpenConnect = (provider: IntegrationProvider) => {
    setSelectedProviderForConnect(provider);
    setTokenInput(PROVIDER_METADATA[provider]?.mockToken || '');
    setConnectError(null);
  };

  const handleSubmitConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProviderForConnect || !tokenInput.trim()) return;

    try {
      setConnecting(true);
      setConnectError(null);
      await connectIntegration({
        provider: selectedProviderForConnect,
        token: tokenInput.trim(),
        scopes: PROVIDER_METADATA[selectedProviderForConnect]?.defaultScopes,
      });
      setSelectedProviderForConnect(null);
      setTokenInput('');
      await loadData();
    } catch (err: any) {
      setConnectError(err.message || 'Failed to authenticate and connect.');
    } finally {
      setConnecting(false);
    }
  };

  const connectedCount = providers.filter((p) => p.connected).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              System Layer
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              AES-256-GCM Vault
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Integrations & Automation Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Centralized data feeds and cascading sync across Google Calendar, GitHub, Google Drive, and Gmail.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadLogs();
              setShowLogsModal(true);
            }}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            Audit Logs
          </button>
          <button
            onClick={handleSyncAll}
            disabled={syncingAll || connectedCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncingAll ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Syncing All...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync All Integrations
              </>
            )}
          </button>
        </div>
      </div>

      <PageAiCopilot pageType="integrations" />

      {/* Metric Cards */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm font-medium">Loading integration channels & status...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Feeds</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{connectedCount}</span>
            <span className="text-xs text-slate-500 font-medium">of {providers.length} configured</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            Operational & Healthy
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cross-Module Cascades</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">Active</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Auto-unblocking • Milestones • Skills
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security Architecture</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">Encrypted</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            AES-256-GCM authenticated cipher
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Sync Activity</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">
              {accounts.some((a) => a.lastSyncAt)
                ? 'Recent'
                : 'Pending'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium truncate">
            {accounts.find((a) => a.lastSyncAt)?.lastSyncAt
              ? new Date(accounts.find((a) => a.lastSyncAt)!.lastSyncAt!).toLocaleTimeString()
              : 'Trigger a manual sync'}
          </div>
        </div>
      </div>
      )}

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(Object.keys(PROVIDER_METADATA) as IntegrationProvider[]).map((providerKey) => {
          const meta = PROVIDER_METADATA[providerKey];
          const summary = providers.find((p) => p.provider === providerKey);
          const account = summary?.account || accounts.find((a) => a.provider === providerKey);
          const isConnected = !!account && account.status !== 'DISCONNECTED';
          const isSyncing = syncingProvider === providerKey || account?.status === 'SYNCING';

          return (
            <div
              key={providerKey}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-lg border flex items-center justify-center ${meta.iconBg}`}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={meta.svgPath} />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{meta.name}</h3>
                      <div className="text-xs text-slate-500">{meta.category}</div>
                    </div>
                  </div>

                  <div>
                    {isConnected ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Available
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-600 mt-4 leading-relaxed">{meta.description}</p>

                {isConnected && account && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">Identity:</span>
                      <span className="font-medium text-slate-900">{account.accountEmail || account.accountName || 'Authenticated'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">Last Synced:</span>
                      <span className="font-medium text-slate-900">
                        {account.lastSyncAt ? new Date(account.lastSyncAt).toLocaleString() : 'Not yet synced'}
                      </span>
                    </div>
                    {account.lastErrorMessage && (
                      <div className="text-rose-600 font-medium pt-1">
                        Warning: {account.lastErrorMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                {isConnected ? (
                  <>
                    <button
                      onClick={() => handleDisconnect(providerKey)}
                      className="text-xs font-medium text-rose-600 hover:text-rose-800 transition-colors"
                    >
                      Disconnect
                    </button>
                    <button
                      onClick={() => handleSyncSingle(providerKey)}
                      disabled={isSyncing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
                    >
                      {isSyncing ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-blue-600" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Syncing...
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Sync Now
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-slate-400 font-medium">Ready to authorize</span>
                    <button
                      onClick={() => handleOpenConnect(providerKey)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                    >
                      Connect Feed
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Internal Cascades & Data Flow Map */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-2">Internal Cascading Architecture</h3>
        <p className="text-sm text-slate-500 mb-6">
          Verified external signals trigger automated cross-layer state synchronizations:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">GitHub Commits</div>
            <div className="text-sm font-semibold text-slate-900 mt-1">Verifiable Evidence</div>
            <p className="text-xs text-slate-600 mt-1">
              Commits automatically create verified Evidence records linked to Individual and Group Graduation projects and Software/AI Engineering skills.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Google Drive</div>
            <div className="text-sm font-semibold text-slate-900 mt-1">Academic Deliverables</div>
            <p className="text-xs text-slate-600 mt-1">
              Indexes project reports, thesis drafts, and ASTU semester syllabi, directly feeding into Graduation Defense Readiness milestones.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">Gmail Sentinel</div>
            <div className="text-sm font-semibold text-slate-900 mt-1">Advisor Notice Tasks</div>
            <p className="text-xs text-slate-600 mt-1">
              Detects supervisor review invitations and department notices, auto-proposing high-priority tasks without ever sending emails.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">Task Completion</div>
            <div className="text-sm font-semibold text-slate-900 mt-1">Dependency Unblocking</div>
            <p className="text-xs text-slate-600 mt-1">
              Marking a task as DONE automatically evaluates dependent tasks from BLOCKED to READY and advances milestones when all tasks finish.
            </p>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      {selectedProviderForConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Connect {PROVIDER_METADATA[selectedProviderForConnect]?.name}
              </h3>
              <button
                onClick={() => setSelectedProviderForConnect(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitConnect} className="mt-4 space-y-4">
              <p className="text-xs text-slate-600">
                Credentials are encrypted using AES-256-GCM and stored securely. For local dev or offline validation, you can use the test mode token.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  API Token / Personal Access Token / OAuth Key
                </label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Enter API token or mock_test_token"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setTokenInput(PROVIDER_METADATA[selectedProviderForConnect]?.mockToken)}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Use Deterministic Test Token
                </button>
              </div>

              {connectError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {connectError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedProviderForConnect(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connecting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {connecting ? 'Verifying & Encrypting...' : 'Authorize & Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-3xl w-full p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Integration Audit & Sync Logs</h3>
                <p className="text-xs text-slate-500">Persistent execution timestamps, duration, and synced item counts</p>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-3">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500">No sync logs recorded yet.</div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.provider}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="text-slate-400">{log.triggerType}</span>
                      </div>
                      <div className="text-slate-600 mt-1">
                        Imported: <span className="font-semibold text-slate-900">{log.itemsImported}</span> | Exported:{' '}
                        <span className="font-semibold text-slate-900">{log.itemsExported}</span> | Failed:{' '}
                        <span className="font-semibold text-slate-900">{log.itemsFailed}</span>
                      </div>
                      {log.errorDetails && (
                        <div className="text-slate-500 mt-1 font-mono text-[11px] truncate max-w-md">
                          {log.errorDetails}
                        </div>
                      )}
                    </div>

                    <div className="text-right text-slate-500 whitespace-nowrap">
                      <div>{log.durationMs}ms</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(log.startedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowLogsModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
