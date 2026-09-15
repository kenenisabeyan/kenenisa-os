import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { ERROR_CODES } from '@kenenisa-os/shared';

/**
 * Dedicated Rate Limiter for Authentication Endpoints (`/api/v1/auth/login`)
 * Prevents brute-force credential stuffing attacks while allowing smooth development.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.NODE_ENV === 'test' ? 1000 : 10, // 10 attempts per 15 min in dev/prod, relaxed in test
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    error: {
      code: ERROR_CODES.TOO_MANY_REQUESTS,
    },
  },
});
