# KENENISA OS — Observability, Logging & Health Guide

This document details logging standards, request context propagation, error tracking, health readiness endpoints, and system diagnostics for **KENENISA OS**.

---

## 1. Structured Logging Architecture

The API uses **Pino** for high-performance structured JSON logging ([`apps/api/src/lib/logger.ts`](file:///c:/Users/kenenisa/Desktop/about%20kenenisa/My%20pojects/kenenisa-os/apps/api/src/lib/logger.ts)).

### Log Field Format
```json
{
  "level": 30,
  "time": "2026-09-16T02:30:00.000Z",
  "pid": 1234,
  "hostname": "production-server-1",
  "requestId": "97ce134f-8a0f-41cd-a91e-932cb5725d4f",
  "method": "GET",
  "url": "/api/v1/dashboard",
  "status": 200,
  "durationMs": 4,
  "msg": "GET /api/v1/dashboard 200 - 4ms"
}
```

---

## 2. Request Correlation ID (`X-Request-ID`)

Every incoming HTTP request is assigned a unique UUID by [`requestIdMiddleware`](file:///c:/Users/kenenisa/Desktop/about%20kenenisa/My%20pojects/kenenisa-os/apps/api/src/middleware/requestId.ts).

* **Header Name**: `x-request-id`
* **Behavior**: Reuses existing client header if valid UUID, otherwise generates new `randomUUID()`.
* **Propagation**: Attached to `req.requestId`, logged in Pino request metadata, and returned in HTTP response headers (`res.setHeader('x-request-id', requestId)`).

---

## 3. Health & Readiness Endpoints

The system exposes operational status endpoints under `/api/v1/`:

### Liveness Endpoint (`GET /api/v1/live` or `/api/v1/health`)
* **Purpose**: Indicates if process is running and accepting HTTP connections.
* **HTTP Status**: `200 OK`
* **Response Payload**:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-16T02:30:00.000Z",
  "uptime": 3600
}
```

### Readiness Endpoint (`GET /api/v1/ready`)
* **Purpose**: Indicates if application dependencies (PostgreSQL database) are connected and ready to process transactions.
* **HTTP Status**: `200 OK` (when database responds) or `503 Service Unavailable`
* **Response Payload**:
```json
{
  "status": "ready",
  "checks": {
    "database": "UP"
  },
  "timestamp": "2026-09-16T02:30:00.000Z"
}
```

---

## 4. Standardized Error Response Contract

All API error responses implement a uniform JSON schema ([`apps/api/src/utils/response.ts`](file:///c:/Users/kenenisa/Desktop/about%20kenenisa/My%20pojects/kenenisa-os/apps/api/src/utils/response.ts)):

```json
{
  "success": false,
  "message": "Human readable error summary",
  "error": {
    "code": "TASK_HAS_UNRESOLVED_DEPENDENCIES",
    "details": []
  },
  "meta": {
    "requestId": "97ce134f-8a0f-41cd-a91e-932cb5725d4f",
    "timestamp": "2026-09-16T02:30:00.000Z",
    "path": "/api/v1/tasks/123/start"
  }
}
```

### Security Masking
In `production` mode (`NODE_ENV=production`), unhandled internal server errors return generic message `"Internal server error"` and omit stack traces or database internal messages.
