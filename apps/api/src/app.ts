import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';

/**
 * Creates and configures the Express application.
 * Kept separate from server.ts so the app can be imported in tests
 * without starting a real server.
 */
export function createApp(): express.Application {
  const app = express();

  // ── Security & Standard Middleware ───────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
    }),
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes',
      error: { code: 'TOO_MANY_REQUESTS' },
    },
  });
  app.use('/api', limiter);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Request Context & Logging ─────────────────────────────────────────────
  app.use(requestIdMiddleware);
  app.use(requestLogger);

  // ── API Routes ────────────────────────────────────────────────────────────
  app.use('/api', apiRouter);

  // ── Fallback 404 & Centralized Error Handler ──────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
