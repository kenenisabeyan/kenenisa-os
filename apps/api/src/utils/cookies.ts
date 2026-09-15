import type { Response } from 'express';
import { config } from '../config/index.js';

export const AUTH_COOKIE_NAME = 'auth_session';

/**
 * Default session lifetime: 7 days in milliseconds.
 */
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function setAuthCookie(res: Response, token: string, maxAgeMs = SESSION_MAX_AGE_MS): void {
  const isProd = config.NODE_ENV === 'production';
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  });
}

export function clearAuthCookie(res: Response): void {
  const isProd = config.NODE_ENV === 'production';
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });
}
