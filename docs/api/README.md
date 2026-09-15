# API Reference

## KENENISA OS REST API

**Base URL:** `http://localhost:3000` (development)

All responses follow the standard envelope:

```json
{
  "success": true | false,
  "message": "Human-readable description",
  "data": { ... }
}
```

---

## Endpoints

### Health

#### `GET /api/health`

Returns the operational status of the API.

**Authentication:** None required

**Response — 200 OK**

```json
{
  "success": true,
  "message": "KENENISA OS API is healthy",
  "data": {
    "status": "healthy",
    "version": "0.1.0",
    "timestamp": "2026-09-15T16:47:50.000Z",
    "uptime": 42.3
  }
}
```

---

## Current Status

Only the `/api/health` endpoint exists. All domain endpoints will be documented here as they are implemented.
