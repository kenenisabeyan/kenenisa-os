import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
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
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        if (
          origin === config.CORS_ORIGIN ||
          /^http:\/\/(localhost|127\.0\.0\.1):[0-9]+$/.test(origin)
        ) {
          return callback(null, true);
        }
        callback(null, false);
      },
      credentials: true,
    }),
  );

  // Global API Rate Limiter
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.RATE_LIMIT_MAX || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes.',
      error: { code: 'TOO_MANY_REQUESTS' },
    },
  });
  app.use('/api', globalLimiter);

  // Auth Endpoints Rate Limiter (Brute force protection)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 login attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many login attempts. Please try again after 15 minutes.',
      error: { code: 'TOO_MANY_REQUESTS' },
    },
  });
  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/forgot-password', authLimiter);
  app.use('/api/v1/auth/reset-password', authLimiter);

  // Intelligence Core Rate Limiter (LLM cost & token protection)
  const intelligenceLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 AI chat messages per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Intelligence rate limit exceeded. Please try again after 15 minutes.',
      error: { code: 'TOO_MANY_REQUESTS' },
    },
  });
  app.use('/api/v1/intelligence/chat', intelligenceLimiter);

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

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
