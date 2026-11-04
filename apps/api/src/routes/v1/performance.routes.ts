import { Router } from 'express';
import { performanceProfiler } from '../../lib/performance-profiler.js';
import { sendSuccess } from '../../utils/response.js';

export const performanceRouter = Router();

/**
 * GET /api/v1/performance/metrics
 * Returns comprehensive high-resolution performance metrics for routes, DB queries, and AI
 */
performanceRouter.get('/metrics', (req, res) => {
  const aggregatedRoutes = performanceProfiler.getAggregatedStats();
  const dbSummary = performanceProfiler.getDbSummary();
  const recentQueries = performanceProfiler.getRecentDbQueries(30);
  const aiTimings = performanceProfiler.getLatestAiTimings();

  const mem = process.memoryUsage();

  return sendSuccess({
    res,
    req,
    statusCode: 200,
    message: 'High-resolution performance metrics retrieved',
    data: {
      timestamp: new Date().toISOString(),
      routes: aggregatedRoutes,
      database: dbSummary,
      recentQueries,
      ai: aiTimings,
      system: {
        uptimeSeconds: Math.floor(process.uptime()),
        memoryRssMb: parseFloat((mem.rss / 1024 / 1024).toFixed(1)),
        memoryHeapUsedMb: parseFloat((mem.heapUsed / 1024 / 1024).toFixed(1)),
        memoryHeapTotalMb: parseFloat((mem.heapTotal / 1024 / 1024).toFixed(1)),
      },
    },
  });
});

/**
 * POST /api/v1/performance/reset
 * Resets recorded in-memory benchmarks for clean A/B runs
 */
performanceRouter.post('/reset', (req, res) => {
  performanceProfiler.clear();
  return sendSuccess({
    res,
    req,
    statusCode: 200,
    message: 'Performance metrics registry cleared successfully',
    data: { cleared: true, timestamp: new Date().toISOString() },
  });
});

