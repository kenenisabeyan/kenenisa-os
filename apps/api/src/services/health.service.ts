import type { HealthData, ReadinessData } from '@kenenisa-os/shared';
import { config } from '../config/index.js';
import { prisma } from '../lib/prisma.js';

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

  public async getReadiness(): Promise<ReadinessData> {
    const health = this.getHealth();
    let dbStatus: 'connected' | 'disconnected' | 'disabled' = 'disconnected';

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      ...health,
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      checks: {
        database: dbStatus,
        memory: process.memoryUsage().heapUsed < 1024 * 1024 * 1024 ? 'ok' : 'warning',
      },
    };
  }
}

export const healthService = new HealthService();
