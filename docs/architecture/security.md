# Security Architecture — KENENISA OS

## 1. Authentication & Session Architecture

- **Single Owner Model:** KENENISA OS is a protected personal application. Public registration endpoints (`/register`) are disabled.
- **Password Hashing:** Uses `Argon2id` (memoryCost: 64 MB, timeCost: 3, parallelism: 1). Raw passwords and plaintext hashes are never stored or logged.
- **Password Policy:** Minimum length of 12 characters centralized in `@kenenisa-os/shared`.
- **Session Security:**
  - Raw session tokens are 256-bit cryptographically secure random values generated using `crypto.randomBytes(32)`.
  - Database stores strictly the SHA-256 hash of the token (`Session.tokenHash`).
  - Tokens are delivered to the browser exclusively through HTTP-Only cookies (`auth_session`).
  - LocalStorage, SessionStorage, and IndexedDB are forbidden from storing authentication tokens.
- **Cookie Configuration:**
  - `HttpOnly: true` (prevents XSS token extraction)
  - `Secure: true` (in production environment)
  - `SameSite: Lax`
  - `Path: /`

## 2. Authorization & Ownership Model

- **Role Hierarchy:** Supported initial role `OWNER`. System supports future role extensions without code refactoring.
- **Ownership Enforcement:** Business data queries scope records by `userId = req.user.id` from authenticated request context to prevent Insecure Direct Object Reference (IDOR) attacks.
- **Server Authority:** Frontend state is non-authoritative. Authorization decisions are strictly evaluated on the Express backend via `requireAuth` and `requireRole` middleware.

## 3. Threat Mitigations & Controls

- **CORS:** Restricts cross-origin requests strictly to `CORS_ORIGIN`. Credentials (`credentials: true`) are enabled with explicit origin checking; wildcard origins (`*`) are disallowed.
- **CSRF Strategy:** Protected via HTTP-Only `SameSite=Lax` cookies coupled with trusted-origin verification on state-changing API routes.
- **Rate Limiting:**
  - Global API Limiter: 100 requests / 15 minutes window on `/api`.
  - Auth Limiter: 10 requests / 15 minutes window on `/api/v1/auth/login`.
- **Security Logging:** Audit logs record `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, and `SESSION_REVOKED`. Metadata is automatically sanitized to purge passwords, secrets, headers, and tokens.

## 4. Owner Account Bootstrap

Provisioning the single owner account is performed via CLI CLI command:

```bash
npm run db:create-owner
```

Parameters are supplied via environment variables (`OWNER_EMAIL`, `OWNER_PASSWORD`) or command-line arguments. The script uses a database transaction (`$transaction`) to atomically create the `OWNER` user and initialize default `UserSettings`.
