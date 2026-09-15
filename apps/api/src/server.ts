import 'dotenv/config';
import { createApp } from './app.js';

const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

const app = createApp();

const server = app.listen(PORT, () => {
  console.info(`🚀 KENENISA OS API running on http://localhost:${PORT}`);
  console.info(`   Health: http://localhost:${PORT}/api/health`);
  console.info(`   Environment: ${process.env['NODE_ENV'] ?? 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM received — shutting down gracefully');
  server.close(() => {
    console.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.info('SIGINT received — shutting down gracefully');
  server.close(() => {
    console.info('Server closed');
    process.exit(0);
  });
});
