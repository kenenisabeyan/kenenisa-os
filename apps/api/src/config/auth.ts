import type { CookieOptions } from 'express';
import { config } from './index.js';

export const AUTH_CONFIG = {
  SESSION_COOKIE_NAME: 'kenenisa_session',
  SESSION_LIFETIME_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  PASSWORD_MIN_LENGTH: 12,
} as const;

export function getSessionCookieOptions(): CookieOptions {
  const isProd = config.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_CONFIG.SESSION_LIFETIME_MS,
  };
}

export function getClearCookieOptions(): CookieOptions {
  const isProd = config.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  };
}
