/**
 * KENENISA OS — Backend High-Resolution Microsecond Performance Profiler
 *
 * Implements microsecond-precision timing using process.hrtime.bigint(),
 * query-level database instrumentation, and Server-Timing header generation.
 */

import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestPerfContext {
  requestId: string;
  method: string;
  path: string;
  startNs: bigint;
  dbQueryCount: number;
  totalDbNs: bigint;
  dbQueries: { model?: string; operation: string; durationUs: number; durationMs: number }[];
}

export const requestPerfStorage = new AsyncLocalStorage<RequestPerfContext>();

export interface DbQueryMetric {
  model?: string;
  operation: string;
  durationNs: bigint;
  durationUs: number;
  durationMs: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

export interface RouteTimingMetric {
  method: string;
  route: string;
  statusCode: number;
  totalDurationNs: bigint;
  totalDurationUs: number;
  totalDurationMs: number;
  dbDurationNs: bigint;
  dbDurationUs: number;
  dbDurationMs: number;
  dbQueryCount: number;
  computeDurationUs: number;
  computeDurationMs: number;
  timestamp: number;
}

export interface AggregatedRouteStats {
  route: string;
  method: string;
  requestCount: number;
  avgTotalMs: number;
  avgTotalUs: number;
  minTotalMs: number;
  maxTotalMs: number;
  p95TotalMs: number;
  avgDbMs: number;
  avgDbUs: number;
  avgQueryCount: number;
  lastUpdated: string;
}

export interface AiPhaseTiming {
  phase: string;
  durationUs: number;
  durationMs: number;
  description: string;
}

class PerformanceProfilerRegistry {
  private static instance: PerformanceProfilerRegistry;
  private readonly maxSamplesPerRoute = 200;
  private readonly maxDbQuerySamples = 500;

  private routeTimings: Map<string, RouteTimingMetric[]> = new Map();
  private dbQueries: DbQueryMetric[] = [];
  private aiTimings: Map<string, AiPhaseTiming[]> = new Map();

  private constructor() {}

  public static getInstance(): PerformanceProfilerRegistry {
    if (!PerformanceProfilerRegistry.instance) {
      PerformanceProfilerRegistry.instance = new PerformanceProfilerRegistry();
    }
    return PerformanceProfilerRegistry.instance;
  }

  /**
   * Records a completed route request timing
   */
  public recordRouteTiming(timing: RouteTimingMetric): void {
    const key = `${timing.method} ${timing.route}`;
    let samples = this.routeTimings.get(key);
    if (!samples) {
      samples = [];
      this.routeTimings.set(key, samples);
    }

    samples.push(timing);
    if (samples.length > this.maxSamplesPerRoute) {
      samples.shift(); // Keep bounded sliding window
    }
  }

  /**
   * Records a database query executed through Prisma
   */
  public recordDbQuery(query: DbQueryMetric): void {
    this.dbQueries.push(query);
    if (this.dbQueries.length > this.maxDbQuerySamples) {
      this.dbQueries.shift();
    }
  }

  /**
   * Records AI execution phase breakdown
   */
  public recordAiPhases(traceId: string, phases: AiPhaseTiming[]): void {
    this.aiTimings.set(traceId, phases);
    // Keep max 50 traces
    if (this.aiTimings.size > 50) {
      const oldestKey = this.aiTimings.keys().next().value;
      if (oldestKey) this.aiTimings.delete(oldestKey);
    }
  }

  /**
   * Returns aggregated statistics for all recorded routes
   */
  public getAggregatedStats(): AggregatedRouteStats[] {
    const stats: AggregatedRouteStats[] = [];

    for (const [key, samples] of this.routeTimings.entries()) {
      if (samples.length === 0) continue;

      const [method, ...routeParts] = key.split(' ');
      const route = routeParts.join(' ');

      const totalMsArr = samples.map((s) => s.totalDurationMs).sort((a, b) => a - b);
      const totalUsArr = samples.map((s) => s.totalDurationUs);
      const dbMsArr = samples.map((s) => s.dbDurationMs);
      const dbUsArr = samples.map((s) => s.dbDurationUs);
      const countArr = samples.map((s) => s.dbQueryCount);

      const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
      const n = samples.length;

      const p95Index = Math.max(0, Math.min(Math.ceil(n * 0.95) - 1, n - 1));

      stats.push({
        route,
        method,
        requestCount: n,
        avgTotalMs: parseFloat((sum(totalMsArr) / n).toFixed(2)),
        avgTotalUs: parseFloat((sum(totalUsArr) / n).toFixed(1)),
        minTotalMs: parseFloat(totalMsArr[0].toFixed(2)),
        maxTotalMs: parseFloat(totalMsArr[n - 1].toFixed(2)),
        p95TotalMs: parseFloat(totalMsArr[p95Index].toFixed(2)),
        avgDbMs: parseFloat((sum(dbMsArr) / n).toFixed(2)),
        avgDbUs: parseFloat((sum(dbUsArr) / n).toFixed(1)),
        avgQueryCount: parseFloat((sum(countArr) / n).toFixed(1)),
        lastUpdated: new Date().toISOString(),
      });
    }

    return stats.sort((a, b) => b.avgTotalMs - a.avgTotalMs);
  }

  /**
   * Returns recent database query metrics (JSON-safe without BigInt)
   */
  public getRecentDbQueries(limit = 50): Array<{
    model?: string;
    operation: string;
    durationUs: number;
    durationMs: number;
    timestamp: number;
    success: boolean;
    error?: string;
  }> {
    return this.dbQueries.slice(-limit).map((q) => ({
      model: q.model,
      operation: q.operation,
      durationUs: q.durationUs,
      durationMs: q.durationMs,
      timestamp: q.timestamp,
      success: q.success,
      error: q.error,
    }));
  }

  /**
   * Returns the database performance overview
   */
  public getDbSummary(): {
    totalRecorded: number;
    avgQueryDurationMs: number;
    avgQueryDurationUs: number;
    slowQueriesCount: number;
    byModel: Record<string, { count: number; avgMs: number }>;
  } {
    const n = this.dbQueries.length;
    if (n === 0) {
      return {
        totalRecorded: 0,
        avgQueryDurationMs: 0,
        avgQueryDurationUs: 0,
        slowQueriesCount: 0,
        byModel: {},
      };
    }

    let totalMs = 0;
    let slowCount = 0;
    const byModel: Record<string, { count: number; totalMs: number }> = {};

    for (const q of this.dbQueries) {
      totalMs += q.durationMs;
      if (q.durationMs > 100) slowCount++;

      const modelKey = q.model || 'raw';
      if (!byModel[modelKey]) {
        byModel[modelKey] = { count: 0, totalMs: 0 };
      }
      byModel[modelKey].count++;
      byModel[modelKey].totalMs += q.durationMs;
    }

    const byModelSummary: Record<string, { count: number; avgMs: number }> = {};
    for (const [m, data] of Object.entries(byModel)) {
      byModelSummary[m] = {
        count: data.count,
        avgMs: parseFloat((data.totalMs / data.count).toFixed(2)),
      };
    }

    return {
      totalRecorded: n,
      avgQueryDurationMs: parseFloat((totalMs / n).toFixed(2)),
      avgQueryDurationUs: parseFloat(((totalMs * 1000) / n).toFixed(1)),
      slowQueriesCount: slowCount,
      byModel: byModelSummary,
    };
  }

  /**
   * Returns latest AI phase execution timings
   */
  public getLatestAiTimings(): { traceId: string; phases: AiPhaseTiming[]; totalMs: number }[] {
    const entries: { traceId: string; phases: AiPhaseTiming[]; totalMs: number }[] = [];
    for (const [traceId, phases] of this.aiTimings.entries()) {
      const totalMs = phases.reduce((acc, p) => acc + p.durationMs, 0);
      entries.push({ traceId, phases, totalMs: parseFloat(totalMs.toFixed(2)) });
    }
    return entries.slice(-10);
  }

  /**
   * Clears in-memory metrics for testing benchmarks
   */
  public clear(): void {
    this.routeTimings.clear();
    this.dbQueries = [];
    this.aiTimings.clear();
  }
}

export const performanceProfiler = PerformanceProfilerRegistry.getInstance();
