# KENENISA OS — Production Incident Response Runbook

This runbook provides step-by-step troubleshooting procedures for operating and diagnosing failures in **KENENISA OS**.

---

## Incident 1: Database Connection Failure (`P1001` / `ECONNREFUSED`)

### Symptoms
* API responses return `500 Internal Server Error` or `503 Service Unavailable` on `/api/v1/ready`.
* Logs contain `PrismaClientInitializationError` or `Connection refused`.

### Recovery Steps
1. Verify PostgreSQL container or service is running:
   ```bash
   pg_isready -h localhost -p 5432 -U postgres
   ```
2. Verify `DATABASE_URL` credentials and host in `.env`.
3. Check PostgreSQL connection limit and active sessions:
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```
4. Restart PostgreSQL daemon if unresponsive, then restart Express API server.

---

## Incident 2: Database Migration Failure on Deployment

### Symptoms
* Server fails to start during deployment with migration error.

### Recovery Steps
1. Verify pending migrations status:
   ```bash
   npx prisma migrate status --schema=apps/api/prisma/schema.prisma
   ```
2. **DO NOT** run `prisma migrate reset` in production.
3. Deploy pending migrations safely:
   ```bash
   npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
   ```

---

## Incident 3: High Rate of `429 Too Many Requests`

### Symptoms
* Clients receive `429 Too Many Requests` status code.
* Logs show rate limiter threshold exceeded.

### Recovery Steps
1. Check if single IP is performing aggressive polling or automated script calls.
2. If legitimate traffic is throttled, adjust `RATE_LIMIT_MAX` environment variable in `.env`.
3. Restart API server to apply updated rate limit settings.

---

## Incident 4: AI Provider Timeout or Outage

### Symptoms
* `/api/v1/intelligence/chat` returns fallback responses or logs `OpenAIProvider error`.

### Recovery Steps
1. Verify `AI_API_KEY` and `AI_BASE_URL` in `.env`.
2. Verify system fallback mode: `KENENISA OS` automatically delegates to `MockAIProvider` if AI provider fails or times out (15s).
3. Confirm core features (Command Center, Tasks, Planning, Analytics) remain 100% operational during AI outages.
