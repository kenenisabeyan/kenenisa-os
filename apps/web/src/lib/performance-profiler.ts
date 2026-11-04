/**
 * KENENISA OS — Frontend Microsecond-Resolution Performance Instrumentation System
 *
 * Implements high-resolution timing using performance.now(), performance.mark(),
 * performance.measure(), React Profiler hooks, and Server-Timing header parser.
 */

export interface ApiCallMetric {
  endpoint: string;
  method: string;
  status: number;
  clientDurationUs: number;
  clientDurationMs: number;
  serverTotalMs?: number;
  serverDbMs?: number;
  serverDbUs?: number;
  dbQueryCount?: number;
  cached: boolean;
  timestamp: number;
}

export interface RoutePerformanceSample {
  route: string;
  phase: 'mount' | 'update' | 'nested-update';
  renderDurationUs: number;
  renderDurationMs: number;
  commitDurationUs: number;
  commitDurationMs: number;
  baseDurationUs: number;
  baseDurationMs: number;
  renderCount: number;
  navigationStartMs: number;
  fmcMs?: number; // First Meaningful Content
  totalReadinessMs?: number; // Total Required Content Readiness
  apiCalls: ApiCallMetric[];
  isColdLoad: boolean;
  timestamp: number;
}

export interface RouteAggregatedMetrics {
  route: string;
  samplesCount: number;
  avgRenderUs: number;
  avgRenderMs: number;
  minRenderUs: number;
  maxRenderUs: number;
  avgCommitUs: number;
  avgCommitMs: number;
  avgFmcMs: number;
  avgTotalReadinessMs: number;
  avgApiDurationMs: number;
  avgDbQueryDurationMs: number;
  avgDbQueryDurationUs: number;
  avgDbQueryCount: number;
  coldLoadMs?: number;
  warmNavMs?: number;
  lastUpdated: number;
}

type PerformanceListener = (sample: RoutePerformanceSample) => void;

class WebPerformanceProfilerRegistry {
  private static instance: WebPerformanceProfilerRegistry;
  private routeSamples: Map<string, RoutePerformanceSample[]> = new Map();
  private activeApiCalls: ApiCallMetric[] = [];
  private activeRoute: string = '/app/dashboard';
  private routeStartTimes: Map<string, number> = new Map();
  private routeRenderCounts: Map<string, number> = new Map();
  private visitedRoutes: Set<string> = new Set();
  private listeners: Set<PerformanceListener> = new Set();

  private constructor() {
    this.setupPerformanceObserver();
  }

  public static getInstance(): WebPerformanceProfilerRegistry {
    if (!WebPerformanceProfilerRegistry.instance) {
      WebPerformanceProfilerRegistry.instance = new WebPerformanceProfilerRegistry();
    }
    return WebPerformanceProfilerRegistry.instance;
  }

  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'longtask') {
            console.warn(
              `[Perf Warn] Long Task detected: ${entry.duration.toFixed(2)}ms on route ${this.activeRoute}`,
            );
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch {
      // Longtask observer not supported on all browsers; ignore safely
    }
  }

  /**
   * Called when a route begins navigation
   */
  public startRouteNavigation(route: string): void {
    this.activeRoute = route;
    const now = performance.now();
    this.routeStartTimes.set(route, now);

    if (typeof performance.mark === 'function') {
      try {
        performance.mark(`nav-start:${route}`);
      } catch {
        // Safe mark ignore
      }
    }
  }

  /**
   * Records an API call with microsecond client duration and parsed Server-Timing metrics
   */
  public recordApiCall(metric: ApiCallMetric): void {
    this.activeApiCalls.push(metric);
    // Keep max 200 recent API calls
    if (this.activeApiCalls.length > 200) {
      this.activeApiCalls.shift();
    }
  }

  /**
   * Called by React Profiler's onRender callback
   */
  public recordReactRender(
    route: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
  ): void {
    const isCold = !this.visitedRoutes.has(route);
    if (phase === 'mount') {
      this.visitedRoutes.add(route);
    }

    const currentCount = (this.routeRenderCounts.get(route) || 0) + 1;
    this.routeRenderCounts.set(route, currentCount);

    const renderDurationUs = actualDuration * 1000;
    const commitDurationMs = Math.max(0, commitTime - startTime);
    const commitDurationUs = commitDurationMs * 1000;
    const baseDurationUs = baseDuration * 1000;

    const navStart = this.routeStartTimes.get(route) || startTime;
    const readinessMs = Math.max(0, commitTime - navStart);

    // Get API calls associated with this route transition
    const relevantApi = this.activeApiCalls.filter((a) => a.timestamp >= navStart - 50);

    const sample: RoutePerformanceSample = {
      route,
      phase,
      renderDurationUs: parseFloat(renderDurationUs.toFixed(1)),
      renderDurationMs: parseFloat(actualDuration.toFixed(3)),
      commitDurationUs: parseFloat(commitDurationUs.toFixed(1)),
      commitDurationMs: parseFloat(commitDurationMs.toFixed(3)),
      baseDurationUs: parseFloat(baseDurationUs.toFixed(1)),
      baseDurationMs: parseFloat(baseDuration.toFixed(3)),
      renderCount: currentCount,
      navigationStartMs: navStart,
      fmcMs: parseFloat(readinessMs.toFixed(2)),
      totalReadinessMs: parseFloat(readinessMs.toFixed(2)),
      apiCalls: [...relevantApi],
      isColdLoad: isCold,
      timestamp: Date.now(),
    };

    let list = this.routeSamples.get(route);
    if (!list) {
      list = [];
      this.routeSamples.set(route, list);
    }
    list.push(sample);
    if (list.length > 100) list.shift();

    // Notify registered listeners (e.g. Performance Inspector)
    this.notifyListeners(sample);
  }

  /**
   * Marks First Meaningful Content (FMC) when data loads
   */
  public markMeaningfulContent(route: string): void {
    const navStart = this.routeStartTimes.get(route);
    if (!navStart) return;

    const fmc = performance.now() - navStart;
    const list = this.routeSamples.get(route);
    if (list && list.length > 0) {
      const last = list[list.length - 1];
      last.fmcMs = parseFloat(fmc.toFixed(2));
    }

    if (typeof performance.measure === 'function') {
      try {
        performance.measure(`fmc:${route}`, `nav-start:${route}`);
      } catch {
        // Safe measure ignore
      }
    }
  }

  /**
   * Returns aggregated microsecond and millisecond metrics for a route
   */
  public getRouteMetrics(route: string): RouteAggregatedMetrics | null {
    const samples = this.routeSamples.get(route);
    if (!samples || samples.length === 0) return null;

    const n = samples.length;
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

    const renderUsArr = samples.map((s) => s.renderDurationUs);
    const renderMsArr = samples.map((s) => s.renderDurationMs);
    const commitUsArr = samples.map((s) => s.commitDurationUs);
    const commitMsArr = samples.map((s) => s.commitDurationMs);
    const fmcArr = samples.map((s) => s.fmcMs || 0).filter((v) => v > 0);
    const ttiArr = samples.map((s) => s.totalReadinessMs || 0).filter((v) => v > 0);

    // API metrics
    const allApi = samples.flatMap((s) => s.apiCalls);
    const apiDurations = allApi.map((a) => a.clientDurationMs);
    const dbDurationsMs = allApi.map((a) => a.serverDbMs || 0).filter((v) => v > 0);
    const dbCounts = allApi.map((a) => a.dbQueryCount || 0);

    const coldSamples = samples.filter((s) => s.isColdLoad);
    const warmSamples = samples.filter((s) => !s.isColdLoad);

    return {
      route,
      samplesCount: n,
      avgRenderUs: parseFloat((sum(renderUsArr) / n).toFixed(1)),
      avgRenderMs: parseFloat((sum(renderMsArr) / n).toFixed(3)),
      minRenderUs: Math.min(...renderUsArr),
      maxRenderUs: Math.max(...renderUsArr),
      avgCommitUs: parseFloat((sum(commitUsArr) / n).toFixed(1)),
      avgCommitMs: parseFloat((sum(commitMsArr) / n).toFixed(3)),
      avgFmcMs: fmcArr.length ? parseFloat((sum(fmcArr) / fmcArr.length).toFixed(2)) : 0,
      avgTotalReadinessMs: ttiArr.length ? parseFloat((sum(ttiArr) / ttiArr.length).toFixed(2)) : 0,
      avgApiDurationMs: apiDurations.length ? parseFloat((sum(apiDurations) / apiDurations.length).toFixed(2)) : 0,
      avgDbQueryDurationMs: dbDurationsMs.length ? parseFloat((sum(dbDurationsMs) / dbDurationsMs.length).toFixed(2)) : 0,
      avgDbQueryDurationUs: dbDurationsMs.length ? parseFloat(((sum(dbDurationsMs) * 1000) / dbDurationsMs.length).toFixed(1)) : 0,
      avgDbQueryCount: dbCounts.length ? parseFloat((sum(dbCounts) / dbCounts.length).toFixed(1)) : 0,
      coldLoadMs: coldSamples.length ? coldSamples[0].totalReadinessMs : undefined,
      warmNavMs: warmSamples.length ? parseFloat((sum(warmSamples.map((s) => s.totalReadinessMs || 0)) / warmSamples.length).toFixed(2)) : undefined,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Returns aggregated metrics across all recorded routes
   */
  public getAllRouteMetrics(): RouteAggregatedMetrics[] {
    const result: RouteAggregatedMetrics[] = [];
    for (const route of this.routeSamples.keys()) {
      const metric = this.getRouteMetrics(route);
      if (metric) result.push(metric);
    }
    return result.sort((a, b) => b.avgTotalReadinessMs - a.avgTotalReadinessMs);
  }

  /**
   * Returns recent API calls
   */
  public getRecentApiCalls(limit = 30): ApiCallMetric[] {
    return this.activeApiCalls.slice(-limit);
  }

  /**
   * Subscribe to live performance events
   */
  public subscribe(listener: PerformanceListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(sample: RoutePerformanceSample): void {
    for (const listener of this.listeners) {
      try {
        listener(sample);
      } catch {
        // Ignore subscriber error
      }
    }
  }

  /**
   * Clears metrics for clean benchmarking
   */
  public clear(): void {
    this.routeSamples.clear();
    this.activeApiCalls = [];
    this.routeStartTimes.clear();
    this.routeRenderCounts.clear();
    this.visitedRoutes.clear();
  }
}

export const webPerformanceProfiler = WebPerformanceProfilerRegistry.getInstance();
