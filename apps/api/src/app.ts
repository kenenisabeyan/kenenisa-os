import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.routes.js';

/**
 * Creates and configures the Express application.
 * Kept separate from server.ts so the app can be imported in tests
 * without starting a real server.
 */
export function createApp(): express.Application {
  const app = express();

  // ── Middleware ────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: process.env['WEB_URL'] ?? 'http://localhost:5173',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Routes ────────────────────────────────────────────────────────────────
  app.use('/api', healthRouter);

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  });

  return app;
}
