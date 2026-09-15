import type { HealthData, ReadinessData } from '@kenenisa-os/shared';
import { config } from '../config/index.js';

export class HealthService {
  public getHealth(): HealthData {
    return {
      status: 'healthy',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
    };
  }

  public getReadiness(): ReadinessData {
    const health = this.getHealth();
    return {
      ...health,
      checks: {
        database: 'disabled', // Will update when Prisma module is integrated
        memory: process.memoryUsage().heapUsed < 1024 * 1024 * 1024 ? 'ok' : 'warning',
      },
    };
  }
}

export const healthService = new HealthService();
