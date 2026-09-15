import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

const app = createApp();

const server = app.listen(config.PORT, () => {
  logger.info(`🚀 KENENISA OS API running on http://localhost:${config.PORT}`);
  logger.info(`   Health endpoint: http://localhost:${config.PORT}/api/v1/health`);
  logger.info(`   Environment: ${config.NODE_ENV}`);
});

// Bounded Graceful shutdown
let isShuttingDown = false;

const shutdown = (signal: string): void => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received — initiating graceful shutdown...`);

  // Force exit if graceful shutdown takes longer than 10s
  const timer = setTimeout(() => {
    logger.error('Graceful shutdown timed out (10s) — forcing process exit.');
    process.exit(1);
  }, 10000);

  server.close(() => {
    logger.info('HTTP server closed.');
    prisma
      .$disconnect()
      .then(() => {
        logger.info('Database connection closed cleanly.');
      })
      .catch((err: unknown) => {
        logger.error({ err }, 'Error disconnecting database during shutdown.');
      })
      .finally(() => {
        clearTimeout(timer);
        process.exit(0);
      });
  });
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception detected in process loop.');
  void shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled Rejection detected in promise chain.');
  void shutdown('UNHANDLED_REJECTION');
});
