# API Reference — KENENISA OS

**Base URL:** `http://localhost:3000` (development)

All API responses follow standard JSON envelopes:

```json
{
  "success": true,
  "message": "Human-readable description",
  "data": { ... }
}
```

---

## Endpoint Specifications

- [Authentication API](authentication.md) (`/api/v1/auth/*`)
- [Health Checks](health.md) (`/api/v1/health`, `/api/v1/ready`, `/api/v1/live`)

---

## Endpoint Summary

| Path                      | Method | Auth     | Description                                           |
| ------------------------- | ------ | -------- | ----------------------------------------------------- |
| `/api/v1/health`          | GET    | None     | Base API health check                                 |
| `/api/v1/ready`           | GET    | None     | Database and system readiness check                   |
| `/api/v1/live`            | GET    | None     | Liveness check                                        |
| `/api/v1/auth/login`      | POST   | None     | Login with owner credentials & receive session cookie |
| `/api/v1/auth/logout`     | POST   | Optional | Revoke current session & clear cookie                 |
| `/api/v1/auth/me`         | GET    | Session  | Retrieve current authenticated user profile           |
| `/api/v1/auth/logout-all` | POST   | Session  | Revoke all active sessions for authenticated user     |
