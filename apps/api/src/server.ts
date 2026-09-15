import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './lib/logger.js';

const app = createApp();

const server = app.listen(config.PORT, () => {
  logger.info(`🚀 KENENISA OS API running on http://localhost:${config.PORT}`);
  logger.info(`   Health endpoint: http://localhost:${config.PORT}/api/v1/health`);
  logger.info(`   Environment: ${config.NODE_ENV}`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
