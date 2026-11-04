import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';
import { performanceProfiler, requestPerfStorage } from './performance-profiler.js';

function createPrismaClient() {
  const basePrisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          const maxRetries = 3;
          let attempt = 0;
          while (attempt < maxRetries) {
            const qStartNs = process.hrtime.bigint();
            try {
              const result = await query(args);
              const qDurNs = process.hrtime.bigint() - qStartNs;
              const qDurUs = Number(qDurNs) / 1000;
              const qDurMs = qDurUs / 1000;

              // Record global query metric
              performanceProfiler.recordDbQuery({
                model,
                operation,
                durationNs: qDurNs,
                durationUs: parseFloat(qDurUs.toFixed(1)),
                durationMs: parseFloat(qDurMs.toFixed(3)),
                timestamp: Date.now(),
                success: true,
              });

              // If running inside active HTTP request, aggregate on request context
              const reqStore = requestPerfStorage.getStore();
              if (reqStore) {
                reqStore.dbQueryCount++;
                reqStore.totalDbNs += qDurNs;
                reqStore.dbQueries.push({
                  model,
                  operation,
                  durationUs: parseFloat(qDurUs.toFixed(1)),
                  durationMs: parseFloat(qDurMs.toFixed(3)),
                });
              }

              // Slow query threshold logging (> 150ms)
              if (qDurMs > 150) {
                logger.warn(
                  { model, operation, durationMs: qDurMs.toFixed(1), durationUs: qDurUs.toFixed(0) },
                  `[Prisma Perf] Slow database query: ${model}.${operation} took ${qDurMs.toFixed(1)}ms (${qDurUs.toFixed(0)}µs)`,
                );
              }

              return result;
            } catch (error: any) {
              const qDurNs = process.hrtime.bigint() - qStartNs;
              performanceProfiler.recordDbQuery({
                model,
                operation,
                durationNs: qDurNs,
                durationUs: Number(qDurNs) / 1000,
                durationMs: Number(qDurNs) / 1_000_000,
                timestamp: Date.now(),
                success: false,
                error: error.message,
              });

              attempt++;
              const isTransient =
                error.code === 'P1001' || // Can't reach database server
                error.code === 'P1002' || // Database server timed out
                error.code === 'P1008' || // Operations timed out
                error.code === 'P1017' || // Server closed the connection
                error.message?.includes("Can't reach database server") ||
                error.message?.includes('connection pool') ||
                error.message?.includes('57P01') ||
                error.message?.includes('terminating connection') ||
                error.message?.includes('ETIMEDOUT') ||
                error.message?.includes('ECONNRESET');

              if (isTransient && attempt < maxRetries) {
                const delay = attempt * 1200;
                logger.warn(
                  { model, operation, attempt, delay, err: error.message },
                  `[Prisma] Transient DB connection error (e.g. Neon cold-start wake-up). Retrying in ${delay}ms...`,
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
              }
              throw error;
            }
          }
        },
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
