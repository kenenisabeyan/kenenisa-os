import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const startPerf = performance.now();

  // Set Server-Timing and X-Response-Time headers before headers are flushed
  const originalWriteHead = res.writeHead;
  res.writeHead = function (statusCode: number, ...args: any[]) {
    if (!res.headersSent) {
      const dur = (performance.now() - startPerf).toFixed(1);
      res.setHeader('Server-Timing', `total;dur=${dur}`);
      res.setHeader('X-Response-Time', `${dur}ms`);
    }
    return originalWriteHead.apply(this, [statusCode, ...args] as any);
  };

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel](
      {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs,
        userAgent: req.get('user-agent'),
      },
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs}ms`,
    );
  });

  next();
}
