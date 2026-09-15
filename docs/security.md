# KENENISA OS — Security, Authentication & Data Protection Architecture

This document specifies the security controls, authentication mechanisms, authorization boundaries, rate limits, and threat mitigations implemented across **KENENISA OS**.

---

## 1. Authentication Security

* **Password Hashing**: Implemented using **Argon2id** (`argon2` package) with salt and cryptographic parameters satisfying OWASP guidelines.
* **Session Management**: Session tokens are cryptographically random 32-byte strings generated using `crypto.randomBytes(32)`.
* **Token Storage**: Only the **SHA-256 hash** of the session token is stored in the database (`Session.tokenHash`). Raw session tokens are never stored or logged.
* **Cookie Security**: Auth session cookies use strict security flags:
  * `HttpOnly`: `true` (prevents XSS access)
  * `Secure`: `true` in production (`process.env.NODE_ENV === 'production'`)
  * `SameSite`: `Lax`
  * `Path`: `/`
* **Session Revocation**: API supports single session revocation (`POST /api/v1/auth/logout`) and global revocation across all devices (`POST /api/v1/auth/logout-all`).

---

## 2. Authorization & Single-Owner Scope Enforcement

* **Single-Owner Scope**: `KENENISA OS` is engineered as a single-owner operating system.
* **IDOR Prevention**: Every protected database query filters explicitly by `userId: req.auth!.userId`.
* **Zero Arbitrary Scoping**: User IDs passed in request bodies, query parameters, or URL paths are strictly ignored or validated against `req.auth!.userId`.

---

## 3. Rate Limiting & Brute Force Defense

Three-tier rate limiters are configured using `express-rate-limit`:

1. **Global API Rate Limiter**: `100 requests / 15 min per IP` on `/api/*`.
2. **Auth Rate Limiter**: `20 requests / 15 min per IP` on `/api/v1/auth/login`. Prevents password brute-force guessing attacks.
3. **Intelligence Rate Limiter**: `30 requests / 15 min per IP` on `/api/v1/intelligence/chat`. Protects against excessive LLM usage & cost spikes.

---

## 4. Prompt Injection & AI Safety Controls

* **Untrusted Content Wrapping**: All user-controlled text inputs (task titles, notes, evidence descriptions, review text) are treated strictly as content payloads rather than executable system instructions.
* **Sanitization**: System filters instruction override patterns (`ignore previous instructions`, `system prompt:`) before building AI context prompts.
* **Action Confirmation Protocol**: AI cannot mutate state directly. AI proposes structured tool actions (`CREATE_TASK`, `CREATE_TIME_BLOCK`) which require explicit user click confirmation before executing domain services.
* **Secret Isolation**: Server secrets (`AI_API_KEY`, `DATABASE_URL`, `SESSION_SECRET`) are never exposed to LLM contexts, prompt payloads, or client bundles.

---

## 5. Security Headers & CORS Controls

* **Security Headers**: Managed via `helmet()` middleware (enforcing `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, Content Security Policy defaults).
* **CORS Policy**: Configured with strict allowed origin (`CORS_ORIGIN`) and `credentials: true`. Wildcards (`*`) are disallowed.
