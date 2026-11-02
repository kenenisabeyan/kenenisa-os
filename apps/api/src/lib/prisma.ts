import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

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
            try {
              return await query(args);
            } catch (error: any) {
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
