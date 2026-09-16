# KENENISA OS — Production Operations & Incident Runbook

This document provides operational guidance for monitoring, diagnosing, and resolving production incidents in **KENENISA OS**.

---

## 1. Primary Operational Endpoints

| Endpoint | Method | Expected Output | Purpose |
| :--- | :--- | :--- | :--- |
| `/health` | GET | `HTTP 200` `{"status":"ok"}` | Liveness probe (process active) |
| `/ready` | GET | `HTTP 200` `{"status":"ok","database":"connected"}` | Readiness probe (database active) |

---

## 2. Observability & Log Correlation

All Express API request logs are structured as JSON via Pino and tagged with a unique correlation identifier:

```json
{
  "level": 30,
  "time": 1789550597511,
  "pid": 25492,
  "hostname": "prod-api-1",
  "requestId": "1e0373cd-a108-46b1-b70e-2f577ff0a858",
  "method": "GET",
  "url": "/api/v1/auth/me",
  "status": 200,
  "durationMs": 3,
  "msg": "GET /api/v1/auth/me 200 - 3ms"
}
```

### Log Investigation Guidelines
- Inspect `requestId` in response header (`X-Request-ID`) to correlate client errors with backend log entries.
- Search logs for `level >= 40` (warnings and errors).
- Confirm secrets (`SESSION_SECRET`, `DATABASE_URL`, `passwordHash`) do **not** appear in log streams.

---

## 3. Incident Scenarios & Standard Operating Procedures (SOP)

### Incident 3.1: PostgreSQL Connection Disconnection (`P1001` / `503`)
* **Symptom**: `/ready` returns HTTP 503; logs report `PrismaClientInitializationError` or `Connection refused`.
* **Action Steps**:
  1. Test PostgreSQL process status: `pg_isready -h <DB_HOST> -p 5432`.
  2. Verify connection string format and credentials in `DATABASE_URL`.
  3. Inspect PostgreSQL active connection count: `SELECT count(*) FROM pg_stat_activity;`.
  4. Restart PostgreSQL daemon if unresponsive, then restart Express API server.

### Incident 3.2: Database Migration Failure During Release
* **Symptom**: API startup fails during deployment with migration application error.
* **Action Steps**:
  1. Inspect migration status:
     ```bash
     npx prisma migrate status --schema=apps/api/prisma/schema.prisma
     ```
  2. Do **NOT** run `prisma migrate reset` in production.
  3. Deploy pending migrations safely:
     ```bash
     npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
     ```

### Incident 3.3: High Rate of Rate Limit Failures (`429 Too Many Requests`)
* **Symptom**: Clients receive HTTP 429 status code on `/api/v1/auth/*` or `/api/v1/intelligence/*`.
* **Action Steps**:
  1. Check logs to see if a single IP address is performing aggressive automated calls.
  2. If legitimate traffic is throttled, increase `RATE_LIMIT_MAX` environment variable in deployment settings.
  3. Restart API server to apply updated threshold.

### Incident 3.4: LLM Provider Timeout or Outage
* **Symptom**: `/api/v1/intelligence/chat` returns fallback responses or logs provider timeout.
* **Action Steps**:
  1. Verify `AI_API_KEY` and `AI_BASE_URL` settings.
  2. Confirm automatic fallback is active: `KENENISA OS` delegates to internal `MockAIProvider` when external LLM requests exceed `15000` ms timeout.
  3. Core modules (Command Center, Tasks, Planning, Analytics) remain 100% operational during LLM outages.

---

## 4. Graceful Shutdown & Emergency Termination

The Express API process implements a bounded 10-second graceful shutdown mechanism:

```text
SIGTERM / SIGINT Signal Received
  ↓
1. Express HTTP Server stops accepting new connections (server.close())
  ↓
2. Active requests complete naturally
  ↓
3. Prisma Client disconnects from PostgreSQL (prisma.$disconnect())
  ↓
4. Process exits cleanly with exit code 0
  ↓
(If execution exceeds 10s -> Force termination with exit code 1)
```

To trigger manual graceful shutdown:
```bash
kill -SIGTERM <API_PID>
```
