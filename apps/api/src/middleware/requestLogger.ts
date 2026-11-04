import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';
import {
  performanceProfiler,
  requestPerfStorage,
  type RequestPerfContext,
} from '../lib/performance-profiler.js';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startNs = process.hrtime.bigint();

  const context: RequestPerfContext = {
    requestId: req.requestId || 'req-unknown',
    method: req.method,
    path: req.baseUrl + req.path,
    startNs,
    dbQueryCount: 0,
    totalDbNs: 0n,
    dbQueries: [],
  };

  requestPerfStorage.run(context, () => {
    // Intercept writeHead to set Server-Timing before headers flush
    const originalWriteHead = res.writeHead;
    res.writeHead = function (statusCode: number, ...args: any[]) {
      if (!res.headersSent) {
        const totalDurationNs = process.hrtime.bigint() - context.startNs;
        const totalDurationUs = Number(totalDurationNs) / 1000;
        const totalDurationMs = totalDurationUs / 1000;

        const dbDurationUs = Number(context.totalDbNs) / 1000;
        const dbDurationMs = dbDurationUs / 1000;

        const computeDurationUs = Math.max(0, totalDurationUs - dbDurationUs);
        const computeDurationMs = computeDurationUs / 1000;

        // Structured multi-part Server-Timing header
        const serverTiming = [
          `db;dur=${dbDurationMs.toFixed(2)};desc="DB (${context.dbQueryCount} queries)"`,
          `compute;dur=${computeDurationMs.toFixed(2)};desc="Compute"`,
          `total;dur=${totalDurationMs.toFixed(2)};desc="Total"`,
        ].join(', ');

        res.setHeader('Server-Timing', serverTiming);
        res.setHeader('X-Response-Time', `${totalDurationMs.toFixed(2)}ms`);
        res.setHeader('X-Response-Time-Us', `${totalDurationUs.toFixed(0)}`);
      }
      return originalWriteHead.apply(this, [statusCode, ...args] as any);
    };

    res.on('finish', () => {
      const totalDurationNs = process.hrtime.bigint() - context.startNs;
      const totalDurationUs = Number(totalDurationNs) / 1000;
      const totalDurationMs = totalDurationUs / 1000;

      const dbDurationUs = Number(context.totalDbNs) / 1000;
      const dbDurationMs = dbDurationUs / 1000;

      const computeDurationUs = Math.max(0, totalDurationUs - dbDurationUs);
      const computeDurationMs = computeDurationUs / 1000;

      // Record to in-memory PerformanceProfiler
      performanceProfiler.recordRouteTiming({
        method: req.method,
        route: req.baseUrl + req.path,
        statusCode: res.statusCode,
        totalDurationNs,
        totalDurationUs: parseFloat(totalDurationUs.toFixed(1)),
        totalDurationMs: parseFloat(totalDurationMs.toFixed(3)),
        dbDurationNs: context.totalDbNs,
        dbDurationUs: parseFloat(dbDurationUs.toFixed(1)),
        dbDurationMs: parseFloat(dbDurationMs.toFixed(3)),
        dbQueryCount: context.dbQueryCount,
        computeDurationUs: parseFloat(computeDurationUs.toFixed(1)),
        computeDurationMs: parseFloat(computeDurationMs.toFixed(3)),
        timestamp: Date.now(),
      });

      const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

      logger[logLevel](
        {
          requestId: req.requestId,
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          durationMs: parseFloat(totalDurationMs.toFixed(2)),
          durationUs: parseFloat(totalDurationUs.toFixed(0)),
          dbMs: parseFloat(dbDurationMs.toFixed(2)),
          dbQueries: context.dbQueryCount,
          userAgent: req.get('user-agent'),
        },
        `${req.method} ${req.originalUrl} ${res.statusCode} - ${totalDurationMs.toFixed(2)}ms (DB: ${dbDurationMs.toFixed(2)}ms / ${context.dbQueryCount} queries)`,
      );
    });

    next();
  });
}
