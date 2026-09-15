# Developer Guide: Authentication & Session Infrastructure — KENENISA OS

## 1. Overview

KENENISA OS is a protected personal application. It implements server-side session authentication with HTTP-Only cookies.

- **Public Registration:** Disabled. There is no `/register` route.
- **Owner Account:** Initialized via CLI (`npm run db:create-owner`).
- **Initial Role:** `OWNER`.

---

## 2. Authentication Architecture

```
Browser                          Express API                          PostgreSQL DB
  │                                   │                                    │
  │── POST /api/v1/auth/login ───────>│                                    │
  │    { email, password }            │── Verify Argon2id hash ───────────>│
  │                                   │── Generate 256-bit token           │
  │                                   │── Hash token with SHA-256          │
  │                                   │── Store tokenHash ────────────────>│
  │<── Set-Cookie: auth_session=raw ──│                                    │
  │                                   │                                    │
  │── GET /api/v1/auth/me ───────────>│                                    │
  │    Cookie: auth_session=raw       │── Hash presented cookie            │
  │                                   │── Find session by tokenHash ──────>│
  │                                   │── Verify not expired/revoked       │
  │<── 200 OK { user } ───────────────│                                    │
```

---

## 3. Key Services & Utilities

| Component         | Path                                                                                                                                                                     | Description                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Password Security | [`apps/api/src/utils/password.ts`](file:///c:/Users/kenenisa/Desktop/about%20kenenisa/My%20pojects/kenenisa-os/apps/api/src/utils/password.ts)                           | Encapsulates Argon2id hashing & verification                        |
| Session Service   | [`apps/api/src/domain/auth/session.service.ts`](file:///c:/Users/kenenisa/Desktop/about%20kenenisa/My%20pojects/kenenisa-os/apps/api/src/domain/auth/session.service.ts) | Handles token generation, SHA-256 hashing, lookup, revocation       |
| Cookie Utility    | [`apps/api/src/utils/cookies.ts`](file:///c:/Users/kenenisa/Desktop/about%20kenenisa/My%20pojects/kenenisa-os/apps/api/src/utils/cookies.ts)                             | Centralized cookie set/clear (`HttpOnly`, `SameSite=Lax`, `Path=/`) |
| Auth Middleware   | [`apps/api/src/middleware/auth.ts`](file:///c:/Users/kenenisa/Desktop/about%20kenenisa/My%20pojects/kenenisa-os/apps/api/src/middleware/auth.ts)                         | `requireAuth` and `requireRole` route guards                        |
| Rate Limiter      | [`apps/api/src/middleware/rateLimit.ts`](file:///c:/Users/kenenisa/Desktop/about%20kenenisa/My%20pojects/kenenisa-os/apps/api/src/middleware/rateLimit.ts)               | Protects `/api/v1/auth/login` from brute-force attempts             |

---

## 4. Development Commands

### Bootstrap Owner Account

```bash
# Provision owner with environment variables or default values
npm run db:create-owner --workspace=apps/api

# Or pass custom email & password
OWNER_EMAIL="owner@domain.com" OWNER_PASSWORD="SuperSecretPass123!" npm run db:create-owner --workspace=apps/api
```

### Clean Up Expired Sessions

```bash
npm run db:cleanup-sessions --workspace=apps/api
```

---

## 5. Security & Ownership Guidelines

1. **IDOR Protection:** Never trust a `userId` supplied in request query/body. Always retrieve `req.user.id` from the authenticated request context.
2. **Password Secrecy:** Never return `passwordHash` or internal secrets in API DTOs. `toPublicUser` explicitly selects only public fields.
3. **Audit Logging:** Record security actions (`LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `SESSION_REVOKED`) using `recordAuditLog`. Metadata is sanitized automatically.
