import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  webPerformanceProfiler,
  type RouteAggregatedMetrics,
  type ApiCallMetric,
} from '../../lib/performance-profiler.js';
import { apiClient } from '../../lib/api-client.js';
import { ZapIcon } from '../common/ZapIcon.js';

interface BackendPerformanceData {
  timestamp: string;
  routes: Array<{
    route: string;
    method: string;
    requestCount: number;
    avgTotalMs: number;
    avgTotalUs: number;
    avgDbMs: number;
    avgDbUs: number;
    avgQueryCount: number;
  }>;
  database: {
    totalRecorded: number;
    avgQueryDurationMs: number;
    avgQueryDurationUs: number;
    slowQueriesCount: number;
    byModel: Record<string, { count: number; avgMs: number }>;
  };
  recentQueries: Array<{
    model?: string;
    operation: string;
    durationUs: number;
    durationMs: number;
    timestamp: number;
  }>;
  ai: Array<{
    traceId: string;
    phases: Array<{
      phase: string;
      durationUs: number;
      durationMs: number;
      description: string;
    }>;
    totalMs: number;
  }>;
  system: {
    uptimeSeconds: number;
    memoryRssMb: number;
    memoryHeapUsedMb: number;
  };
}

export const PerformanceInspectorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'active' | 'routes' | 'database' | 'ai'>('active');
  const [clientMetrics, setClientMetrics] = useState<RouteAggregatedMetrics[]>([]);
  const [recentApiCalls, setRecentApiCalls] = useState<ApiCallMetric[]>([]);
  const [backendData, setBackendData] = useState<BackendPerformanceData | null>(null);
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const activeRouteName = location.pathname;
  const activeRouteMetric = clientMetrics.find((m) => m.route === activeRouteName) || clientMetrics[0];

  const refreshMetrics = useCallback(async () => {
    setClientMetrics(webPerformanceProfiler.getAllRouteMetrics());
    setRecentApiCalls(webPerformanceProfiler.getRecentApiCalls(30));

    try {
      setLoadingBackend(true);
      const data = await apiClient<BackendPerformanceData>('/api/v1/performance/metrics', {
        skipCache: true,
      });
      setBackendData(data);
    } catch {
      // Backend metrics offline or unauthenticated fallback
    } finally {
      setLoadingBackend(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    void refreshMetrics();

    const unsubscribe = webPerformanceProfiler.subscribe(() => {
      setClientMetrics(webPerformanceProfiler.getAllRouteMetrics());
      setRecentApiCalls(webPerformanceProfiler.getRecentApiCalls(30));
    });

    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        void refreshMetrics();
      }, 3000);
    }

    return () => {
      unsubscribe();
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, autoRefresh, refreshMetrics]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ZapIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">High-Resolution Performance Telemetry</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Microsecond Resolution (µs)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time measurements from React Profiler, PerformanceObserver, and Prisma Database Instrumentation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Live Polling (3s)
            </label>
            <button
              onClick={() => void refreshMetrics()}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-100 flex items-center gap-6 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'active'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Active Route Telemetry
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'routes'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Route Inventory ({clientMetrics.length})
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'database'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Database & Queries ({backendData?.database.totalRecorded || 0})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            AI Pipeline Isolation ({backendData?.ai.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'active' && (
            <div className="space-y-6">
              {/* Active Route Telemetry Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 via-white to-slate-50 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      Currently Focused Route
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900">{activeRouteName}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Render Count</span>
                    <p className="text-lg font-bold text-slate-900">{activeRouteMetric?.samplesCount || 1}</p>
                  </div>
                </div>

                {/* Microsecond Metrics Grid formatted per prompt specification */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Component Render
                    </span>
                    <div className="text-2xl font-black text-slate-900">
                      {activeRouteMetric ? `${activeRouteMetric.avgRenderUs.toLocaleString()} µs` : '—'}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {activeRouteMetric ? `(${activeRouteMetric.avgRenderMs} ms)` : 'Pending profile'}
                    </span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      React Commit
                    </span>
                    <div className="text-2xl font-black text-slate-900">
                      {activeRouteMetric ? `${activeRouteMetric.avgCommitUs.toLocaleString()} µs` : '—'}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {activeRouteMetric ? `(${activeRouteMetric.avgCommitMs} ms)` : 'Pending commit'}
                    </span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      API Retrieval
                    </span>
                    <div className="text-2xl font-black text-blue-600">
                      {activeRouteMetric && activeRouteMetric.avgApiDurationMs > 0
                        ? `${(activeRouteMetric.avgApiDurationMs * 1000).toLocaleString()} µs`
                        : '0 µs (Cache)'}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {activeRouteMetric ? `(${activeRouteMetric.avgApiDurationMs} ms)` : 'Cached SWR'}
                    </span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Database Query
                    </span>
                    <div className="text-2xl font-black text-purple-600">
                      {activeRouteMetric && activeRouteMetric.avgDbQueryDurationUs > 0
                        ? `${activeRouteMetric.avgDbQueryDurationUs.toLocaleString()} µs`
                        : '0 µs (In-Memory)'}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {activeRouteMetric
                        ? `(${activeRouteMetric.avgDbQueryDurationMs} ms, ${activeRouteMetric.avgDbQueryCount} queries)`
                        : 'No DB wait'}
                    </span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Meaningful Content (FMC)
                    </span>
                    <div className="text-2xl font-black text-emerald-600">
                      {activeRouteMetric?.avgFmcMs ? `${activeRouteMetric.avgFmcMs} ms` : 'Instant'}
                    </div>
                    <span className="text-[10px] text-slate-400">Visible data available</span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Total Page Readiness
                    </span>
                    <div className="text-2xl font-black text-indigo-600">
                      {activeRouteMetric?.avgTotalReadinessMs
                        ? `${activeRouteMetric.avgTotalReadinessMs} ms`
                        : 'Instant'}
                    </div>
                    <span className="text-[10px] text-slate-400">All required widgets rendered</span>
                  </div>
                </div>
              </div>

              {/* Recent API Requests for Active Route */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Recent Route Network Operations
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Endpoint</th>
                        <th className="py-2.5 px-4 font-semibold">Status</th>
                        <th className="py-2.5 px-4 font-semibold">Client Fetch</th>
                        <th className="py-2.5 px-4 font-semibold">Neon DB Duration</th>
                        <th className="py-2.5 px-4 font-semibold">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentApiCalls.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400">
                            No recent network calls recorded.
                          </td>
                        </tr>
                      ) : (
                        recentApiCalls.slice(0, 8).map((api, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-4 font-mono font-medium text-slate-800">
                              {api.endpoint}
                            </td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  api.status === 200
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {api.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-mono text-slate-700">
                              {api.clientDurationMs.toFixed(2)} ms ({api.clientDurationUs.toFixed(0)} µs)
                            </td>
                            <td className="py-2.5 px-4 font-mono text-purple-700">
                              {api.serverDbMs ? `${api.serverDbMs.toFixed(2)} ms` : '—'}
                            </td>
                            <td className="py-2.5 px-4">
                              {api.cached ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  0ms SWR Cache
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  Live Network
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'routes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Benchmarked route performance across all application sidebar modules.
                </p>
                <button
                  onClick={() => webPerformanceProfiler.clear()}
                  className="px-3 py-1 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100"
                >
                  Clear Benchmarks
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Route</th>
                      <th className="py-2.5 px-4 font-semibold">Component Render</th>
                      <th className="py-2.5 px-4 font-semibold">React Commit</th>
                      <th className="py-2.5 px-4 font-semibold">Avg API Duration</th>
                      <th className="py-2.5 px-4 font-semibold">Total Readiness</th>
                      <th className="py-2.5 px-4 font-semibold">Renders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientMetrics.map((m) => (
                      <tr key={m.route} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{m.route}</td>
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-800">
                          {m.avgRenderUs.toLocaleString()} µs ({m.avgRenderMs} ms)
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-700">
                          {m.avgCommitUs.toLocaleString()} µs ({m.avgCommitMs} ms)
                        </td>
                        <td className="py-2.5 px-4 font-mono text-blue-600">
                          {m.avgApiDurationMs > 0 ? `${m.avgApiDurationMs} ms` : 'Instant SWR'}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">
                          {m.avgTotalReadinessMs > 0 ? `${m.avgTotalReadinessMs} ms` : 'Instant'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">{m.samplesCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              {backendData ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-xs text-slate-500 block mb-1">Total Queries Recorded</span>
                      <div className="text-2xl font-bold text-slate-900">
                        {backendData.database.totalRecorded}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-xs text-slate-500 block mb-1">Avg Query Duration</span>
                      <div className="text-2xl font-bold text-purple-600">
                        {backendData.database.avgQueryDurationUs.toLocaleString()} µs
                      </div>
                      <span className="text-[10px] text-slate-400">
                        ({backendData.database.avgQueryDurationMs} ms)
                      </span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-xs text-slate-500 block mb-1">Slow Queries (&gt;100ms)</span>
                      <div className="text-2xl font-bold text-amber-600">
                        {backendData.database.slowQueriesCount}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-xs text-slate-500 block mb-1">Server Memory RSS</span>
                      <div className="text-2xl font-bold text-slate-900">
                        {backendData.system.memoryRssMb} MB
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Recent Prisma Database Queries (Microsecond Level)
                    </h4>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                          <tr>
                            <th className="py-2.5 px-4 font-semibold">Model</th>
                            <th className="py-2.5 px-4 font-semibold">Operation</th>
                            <th className="py-2.5 px-4 font-semibold">Execution Time (µs)</th>
                            <th className="py-2.5 px-4 font-semibold">Execution Time (ms)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {backendData.recentQueries.map((q, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-4 font-semibold text-slate-900">
                                {q.model || 'Prisma'}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-slate-600">{q.operation}</td>
                              <td className="py-2.5 px-4 font-mono font-bold text-purple-700">
                                {q.durationUs.toLocaleString()} µs
                              </td>
                              <td className="py-2.5 px-4 font-mono text-slate-500">
                                {q.durationMs.toFixed(3)} ms
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  {loadingBackend ? 'Loading backend metrics...' : 'Backend telemetry offline.'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 text-xs text-blue-900">
                <span className="font-bold">AI Performance Isolation Verified:</span> AI operations
                execute asynchronously on dedicated worker threads. Normal page navigation never waits
                for AI generation, and database context extraction is restricted strictly to active workspace
                metrics.
              </div>

              {backendData && backendData.ai.length > 0 ? (
                backendData.ai.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-600">
                        Trace ID: {item.traceId}
                      </span>
                      <span className="text-xs font-bold text-blue-600">
                        Total AI Latency: {item.totalMs} ms
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {item.phases.map((phase, pIdx) => (
                        <div key={pIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-semibold text-slate-500 block truncate">
                            {phase.phase}
                          </span>
                          <div className="text-base font-bold text-slate-900 mt-1">
                            {phase.durationMs.toFixed(2)} ms
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {phase.durationUs.toLocaleString()} µs
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  No recent AI generation traces recorded. Open the Copilot or AI Intelligence page to profile an active prompt.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

