import { describe, it, expect, beforeEach } from 'vitest';
import {
  performanceProfiler,
  requestPerfStorage,
  type RouteTimingMetric,
  type DbQueryMetric,
  type AiPhaseTiming,
} from '../lib/performance-profiler.js';

describe('KENENISA OS — Global Microsecond Performance Instrumentation & Regression Suite', () => {
  beforeEach(() => {
    performanceProfiler.clear();
  });

  describe('1. Microsecond Route Timing & Statistical Aggregation', () => {
    it('should accurately capture and aggregate route durations with microsecond precision', () => {
      // Simulate 5 requests with known timings
      const samples: number[] = [12.45, 15.2, 11.8, 14.1, 16.5]; // in ms

      samples.forEach((ms, idx) => {
        const ns = BigInt(Math.round(ms * 1_000_000));
        const us = ms * 1000;
        const dbMs = ms * 0.4;
        const dbNs = BigInt(Math.round(dbMs * 1_000_000));

        const metric: RouteTimingMetric = {
          method: 'GET',
          route: '/api/v1/projects',
          statusCode: 200,
          totalDurationNs: ns,
          totalDurationUs: us,
          totalDurationMs: ms,
          dbDurationNs: dbNs,
          dbDurationUs: dbMs * 1000,
          dbDurationMs: dbMs,
          dbQueryCount: 2,
          computeDurationUs: (ms - dbMs) * 1000,
          computeDurationMs: ms - dbMs,
          timestamp: Date.now() + idx,
        };

        performanceProfiler.recordRouteTiming(metric);
      });

      const stats = performanceProfiler.getAggregatedStats();
      expect(stats.length).toBe(1);

      const projectStat = stats[0];
      expect(projectStat.route).toBe('/api/v1/projects');
      expect(projectStat.requestCount).toBe(5);
      expect(projectStat.minTotalMs).toBe(11.8);
      expect(projectStat.maxTotalMs).toBe(16.5);
      expect(projectStat.avgTotalMs).toBeGreaterThan(13);
      expect(projectStat.avgTotalMs).toBeLessThan(15);
      expect(projectStat.avgTotalUs).toBeCloseTo(projectStat.avgTotalMs * 1000, -1);
      expect(projectStat.avgQueryCount).toBe(2);
    });

    it('should calculate 95th percentile (P95) accurately', () => {
      // Record 20 requests
      for (let i = 1; i <= 20; i++) {
        const ms = i * 5; // 5ms to 100ms
        const ns = BigInt(ms * 1_000_000);
        performanceProfiler.recordRouteTiming({
          method: 'GET',
          route: '/api/v1/dashboard',
          statusCode: 200,
          totalDurationNs: ns,
          totalDurationUs: ms * 1000,
          totalDurationMs: ms,
          dbDurationNs: ns / 2n,
          dbDurationUs: (ms * 1000) / 2,
          dbDurationMs: ms / 2,
          dbQueryCount: 5,
          computeDurationUs: (ms * 1000) / 2,
          computeDurationMs: ms / 2,
          timestamp: Date.now() + i,
        });
      }

      const stats = performanceProfiler.getAggregatedStats();
      const dashStat = stats.find((s) => s.route === '/api/v1/dashboard');
      expect(dashStat).toBeDefined();
      expect(dashStat?.requestCount).toBe(20);
      expect(dashStat?.p95TotalMs).toBe(95); // 19th element in 20 items (0.95 * 20 = 19)
    });
  });

  describe('2. Database Query Instrumentation & Microsecond Latencies', () => {
    it('should record individual Prisma queries with microsecond metrics', () => {
      const query1: DbQueryMetric = {
        model: 'Task',
        operation: 'findMany',
        durationNs: 4_250_000n, // 4.25ms
        durationUs: 4250.0,
        durationMs: 4.25,
        timestamp: Date.now(),
        success: true,
      };

      const query2: DbQueryMetric = {
        model: 'Project',
        operation: 'findUnique',
        durationNs: 1_850_000n, // 1.85ms
        durationUs: 1850.0,
        durationMs: 1.85,
        timestamp: Date.now(),
        success: true,
      };

      performanceProfiler.recordDbQuery(query1);
      performanceProfiler.recordDbQuery(query2);

      const summary = performanceProfiler.getDbSummary();
      expect(summary.totalRecorded).toBe(2);
      expect(summary.avgQueryDurationMs).toBeCloseTo(3.05, 1);
      expect(summary.avgQueryDurationUs).toBeCloseTo(3050, -1);
      expect(summary.byModel['Task'].count).toBe(1);
      expect(summary.byModel['Project'].count).toBe(1);
      expect(summary.slowQueriesCount).toBe(0);
    });

    it('should identify and flag slow database queries (> 100ms)', () => {
      const slowQuery: DbQueryMetric = {
        model: 'Analytics',
        operation: 'aggregate',
        durationNs: 165_000_000n, // 165ms
        durationUs: 165_000.0,
        durationMs: 165.0,
        timestamp: Date.now(),
        success: true,
      };

      performanceProfiler.recordDbQuery(slowQuery);

      const summary = performanceProfiler.getDbSummary();
      expect(summary.slowQueriesCount).toBe(1);
    });
  });

  describe('3. AsyncLocalStorage Request Context Isolation', () => {
    it('should accurately track queries executed within active request context without bleeding across requests', async () => {
      const contextA = {
        requestId: 'req-A',
        method: 'GET',
        path: '/api/v1/graduation/overview',
        startNs: process.hrtime.bigint(),
        dbQueryCount: 0,
        totalDbNs: 0n,
        dbQueries: [],
      };

      const contextB = {
        requestId: 'req-B',
        method: 'GET',
        path: '/api/v1/tasks',
        startNs: process.hrtime.bigint(),
        dbQueryCount: 0,
        totalDbNs: 0n,
        dbQueries: [],
      };

      await Promise.all([
        requestPerfStorage.run(contextA, async () => {
          // Simulate 3 queries in request A
          const store = requestPerfStorage.getStore();
          expect(store?.requestId).toBe('req-A');
          store!.dbQueryCount += 3;
          store!.totalDbNs += 9_000_000n; // 9ms
        }),
        requestPerfStorage.run(contextB, async () => {
          // Simulate 1 query in request B
          const store = requestPerfStorage.getStore();
          expect(store?.requestId).toBe('req-B');
          store!.dbQueryCount += 1;
          store!.totalDbNs += 2_500_000n; // 2.5ms
        }),
      ]);

      // Contexts must remain completely isolated
      expect(contextA.dbQueryCount).toBe(3);
      expect(contextA.totalDbNs).toBe(9_000_000n);

      expect(contextB.dbQueryCount).toBe(1);
      expect(contextB.totalDbNs).toBe(2_500_000n);
    });
  });

  describe('4. AI Pipeline Isolation & Phase Latency Breakdown', () => {
    it('should measure all 5 AI execution phases with discrete microsecond resolution', () => {
      const traceId = 'ai-test-trace-123';
      const phases: AiPhaseTiming[] = [
        {
          phase: '1. Request Initialization',
          durationUs: 450.2,
          durationMs: 0.45,
          description: 'Input sanitization and conversation resolution',
        },
        {
          phase: '2. Context Retrieval',
          durationUs: 3200.5,
          durationMs: 3.2,
          description: 'Live database metrics extraction',
        },
        {
          phase: '3. Model Inference',
          durationUs: 45000.0,
          durationMs: 45.0,
          description: 'Inference via GroundedReasoningEngine',
        },
        {
          phase: '4. Tool Execution',
          durationUs: 1200.0,
          durationMs: 1.2,
          description: 'Domain tool resolution',
        },
        {
          phase: '5. Response Persistence',
          durationUs: 1100.0,
          durationMs: 1.1,
          description: 'Message storage and proposal dispatch',
        },
      ];

      performanceProfiler.recordAiPhases(traceId, phases);

      const aiRecords = performanceProfiler.getLatestAiTimings();
      expect(aiRecords.length).toBe(1);

      const record = aiRecords[0];
      expect(record.traceId).toBe(traceId);
      expect(record.phases.length).toBe(5);
      expect(record.totalMs).toBeCloseTo(50.95, 1);
    });
  });

  describe('5. High-Resolution Performance Budgets & Regressions', () => {
    it('should assert that in-memory telemetry overhead is minimal (< 200 µs)', () => {
      const t0 = process.hrtime.bigint();

      // Execute 100 sample recordings
      for (let i = 0; i < 100; i++) {
        performanceProfiler.recordRouteTiming({
          method: 'GET',
          route: '/api/v1/analytics',
          statusCode: 200,
          totalDurationNs: 10_000_000n,
          totalDurationUs: 10000,
          totalDurationMs: 10,
          dbDurationNs: 4_000_000n,
          dbDurationUs: 4000,
          dbDurationMs: 4,
          dbQueryCount: 3,
          computeDurationUs: 6000,
          computeDurationMs: 6,
          timestamp: Date.now(),
        });
      }

      const totalOverheadNs = process.hrtime.bigint() - t0;
      const avgOverheadPerOpUs = Number(totalOverheadNs) / 100 / 1000;

      // Assert that our profiling registry executes with sub-200 microsecond overhead per request
      expect(avgOverheadPerOpUs).toBeLessThan(200);
    });
  });
});
