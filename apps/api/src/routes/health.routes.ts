import { Router } from 'express';
import type { Request, Response } from 'express';
import type { HealthResponse } from '@kenenisa-os/shared';

export const healthRouter = Router();

/**
 * GET /api/health
 *
 * Returns the operational status of the KENENISA OS API.
 * This endpoint should remain publicly accessible and unauthenticated
 * so it can be used by infrastructure health checks.
 */
healthRouter.get('/health', (_req: Request, res: Response) => {
  const response: HealthResponse = {
    success: true,
    message: 'KENENISA OS API is healthy',
    data: {
      status: 'healthy',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  };

  res.status(200).json(response);
});
