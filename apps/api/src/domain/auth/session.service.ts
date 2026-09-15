import crypto from 'crypto';
import { prisma } from '../../lib/prisma.js';
import { SESSION_MAX_AGE_MS } from '../../utils/cookies.js';
import type { Session, User } from '@prisma/client';

export interface ValidatedSessionResult {
  session: Session;
  user: User;
}

/**
 * Generates a 256-bit cryptographically random token and its SHA-256 hash.
 */
export function generateSessionToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(rawToken);
  return { rawToken, tokenHash };
}

/**
 * Hashes a raw session token using SHA-256.
 */
export function hashSessionToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Creates a fresh session for a user and returns the unhashed raw token (for cookie issuance)
 * along with the persisted session database record.
 */
export async function createSession(params: {
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  ttlMs?: number;
}): Promise<{ rawToken: string; session: Session }> {
  const { rawToken, tokenHash } = generateSessionToken();
  const ttlMs = params.ttlMs ?? SESSION_MAX_AGE_MS;
  const expiresAt = new Date(Date.now() + ttlMs);

  const session = await prisma.session.create({
    data: {
      userId: params.userId,
      tokenHash,
      expiresAt,
      userAgent: params.userAgent ?? null,
      ipAddress: params.ipAddress ?? null,
    },
  });

  return { rawToken, session };
}

/**
 * Validates an incoming raw session token.
 * 1. Hashes raw token.
 * 2. Finds matching session in DB.
 * 3. Verifies session is not expired.
 * 4. Verifies session is not revoked.
 * 5. Loads user and verifies user is active.
 */
export async function validateSession(rawToken: string): Promise<ValidatedSessionResult | null> {
  if (!rawToken || typeof rawToken !== 'string') {
    return null;
  }

  const tokenHash = hashSessionToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  // Check if session is revoked
  if (session.revokedAt !== null) {
    return null;
  }

  // Check if session is expired
  if (session.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  // Check if user exists and is active
  if (!session.user || !session.user.isActive) {
    return null;
  }

  // Touch lastUsedAt if older than 5 minutes to avoid excessive DB writes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (session.lastUsedAt < fiveMinutesAgo) {
    prisma.session
      .update({
        where: { id: session.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {
        // Non-blocking background touch
      });
  }

  return {
    session,
    user: session.user,
  };
}

/**
 * Revokes a specific session by ID.
 */
export async function revokeSession(sessionId: string): Promise<void> {
  await prisma.session
    .update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    })
    .catch(() => {
      // Safe ignore if already deleted or non-existent
    });
}

/**
 * Revokes all active sessions for a user (e.g. logout all devices).
 */
export async function revokeAllSessionsForUser(userId: string): Promise<number> {
  const result = await prisma.session.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
  return result.count;
}

/**
 * Purges expired or revoked session records from the database.
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const now = new Date();
  const result = await prisma.session.deleteMany({
    where: {
      OR: [{ expiresAt: { lte: now } }, { revokedAt: { not: null } }],
    },
  });
  return result.count;
}
