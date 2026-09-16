# KENENISA OS — Post-Production Observability & Monitoring Architecture

This document describes the observability, log correlation, process telemetry, and monitoring architecture for **KENENISA OS**.

---

## 1. Monitoring Architecture Overview

The production monitoring architecture relies on lightweight, low-overhead process telemetry integrated directly into the Express REST API server and React single-page application.

```text
┌─────────────────────────────────────────────────────────────┐
│                 Client Request (Frontend SPA)               │
└──────────────────────────────┬──────────────────────────────┘
                               │ X-Request-ID Header (or Generated)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express REST API Server                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Pino Structured JSON Logger (lib/logger.ts)           │  │
│  │ - Timestamp, Level, Request ID, Status, Duration      │  │
│  │ - Redacts passwords, cookies, tokens, DB URLs, Keys   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Operational Health Probes (app.ts)                    │  │
│  │ - GET /health (Process Liveness)                      │  │
│  │ - GET /ready  (PostgreSQL Database Connectivity)      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Telemetry Classification & Status

| Observability Component | Implemented Technology | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Structured Logging** | Pino (JSON lines) | `EXISTS` | Configured in `apps/api/src/lib/logger.ts` |
| **Request Traceability** | `X-Request-ID` middleware | `EXISTS` | Generates or propagates request IDs in response headers |
| **Process Liveness** | `GET /health` | `EXISTS` | Returns HTTP 200 `{ status: "ok" }` |
| **Database Readiness** | `GET /ready` | `EXISTS` | Probes PostgreSQL via Prisma `$queryRaw` |
| **Error Handling** | Centralized `errorHandler.ts` | `EXISTS` | Catches exceptions, redacts internal stack traces in prod |
| **Rate Limit Telemetry** | Express Rate Limit middleware | `EXISTS` | Throttles excessive requests with HTTP 429 |
| **LLM Provider Telemetry**| OpenAI Timeout/Fallback Handler | `EXISTS` | Fallbacks to `MockAIProvider` after 15,000ms |
| **Remote APM Telemetry** | Datadog / New Relic / Sentry | `NOT CONFIGURED` | Requires user cloud subscription |
| **Frontend Error Reporting**| React ErrorBoundary | `EXISTS` | Catches component render errors gracefully |

---

## 3. Data Minimization & Privacy Rules

To protect user privacy and prevent security leaks:

1. **PROHIBITED IN LOGS**:
   - User passwords and Argon2id hash strings
   - Session tokens and cookie strings
   - Database connection strings (`DATABASE_URL`)
   - AI provider secret keys (`AI_API_KEY`)
   - Private user review entries, personal notes, or confidential text

2. **ALLOWED IN LOGS**:
   - Standard ISO-8601 timestamps
   - Log level (`fatal`, `error`, `warn`, `info`, `debug`)
   - Correlation ID (`requestId`)
   - HTTP method, URL path, status code, and duration (`ms`)
   - Operational error code (e.g., `AUTHENTICATION_ERROR`, `NOT_FOUND`, `VALIDATION_ERROR`)

---

## 4. Request ID Traceability Protocol

Every incoming HTTP request to `/api/v1/*` flows through the request context middleware:

1. Checks for incoming `X-Request-ID` header. If absent, generates a cryptographically random UUIDv4.
2. Attaches `requestId` to `req.id` and Pino logger context.
3. Sets `X-Request-ID` header on HTTP response payload.
4. Error logs include `requestId` to enable single-click log correlation without revealing sensitive user payload contents.

---

## 5. Operational Telemetry Limitations

> [!NOTE]
> `OBSERVABILITY LIMITED`: Remote cloud telemetry services (e.g., Datadog, Prometheus/Grafana, Sentry) are not installed by default to avoid unnecessary infrastructure bloat. Production telemetry relies on process standard output (stdout/stderr) structured JSON logs and HTTP health probes.
