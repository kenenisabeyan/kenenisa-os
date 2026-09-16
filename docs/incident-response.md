# KENENISA OS — Incident Response Protocol & Runbook

This document defines the production incident classification, response procedures, escalation hierarchy, and post-incident investigation guidelines for **KENENISA OS**.

---

## 1. Incident Response Lifecycle

```text
1. DETECT       → Automated health probes (/ready), error rate alerts, or user report
2. TRIAGE       → Assess severity (P0-P3) and identify affected domain component
3. CONTAIN      → Stop harmful deployment, isolate issue, or activate provider fallback
4. INVESTIGATE  → Inspect Pino JSON logs using correlation ID (X-Request-ID)
5. MITIGATE     → Apply emergency workaround or hotfix without corrupting DB
6. FIX          → Implement root-cause code fix and add automated regression test
7. VERIFY       → Re-run quality gates (typecheck, lint, Vitest) and verify fix
8. CLOSE        → Update incident record and document lessons learned
```

---

## 2. Standard Operating Procedures (SOP) for Incident Scenarios

### SOP-01: Database Connection Failure (`P1001` / `503 Service Unavailable`)
1. **Detection**: `GET /ready` returns HTTP 503 `{"status":"error","database":"disconnected"}`.
2. **Containment & Mitigation**:
   - Check PostgreSQL daemon: `pg_isready -h <DB_HOST> -p 5432`.
   - Verify active DB connection count: `SELECT count(*) FROM pg_stat_activity;`.
   - Restart PostgreSQL daemon if unresponsive, then restart Express API process (`pm2 restart kenenisa-os-api`).

### SOP-02: Auth Secret Compromise or Session Vulnerability (`P0 Critical`)
1. **Detection**: Unauthorized session activity or session secret leak detected.
2. **Containment & Mitigation**:
   - Rotate `SESSION_SECRET` in server process environment configuration immediately.
   - Restart API server (`pm2 restart kenenisa-os-api`).
   - *Result*: Immediately invalidates all active session cookies across all users, forcing secure re-authentication.

### SOP-03: AI LLM Provider Outage or Rate Limit Spike (`P2 Medium`)
1. **Detection**: `/api/v1/intelligence/chat` logs provider timeout (> 15,000ms) or rate limit error.
2. **Containment & Mitigation**:
   - Set `AI_PROVIDER=mock` in process environment variables.
   - Reload API server (`pm2 reload kenenisa-os-api`).
   - *Result*: API delegates to internal `MockAIProvider`. All 11 core operating system domain modules remain 100% operational.

### SOP-04: Failed Database Migration During Production Deploy (`P0 Critical`)
1. **Detection**: API startup fails during deployment with Prisma migration exception.
2. **Containment & Mitigation**:
   - **DO NOT** execute `prisma migrate reset` in production.
   - Check migration status: `npx prisma migrate status --schema=apps/api/prisma/schema.prisma`.
   - Apply pending migrations safely: `npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma`.

---

## 3. Post-Incident Review Template

For any verified production incident, document:
* **Incident ID**: `INC-YYYYMMDD-XX`
* **Detection Source**: `Health Check Probe / Pino Log / User Report`
* **Root Cause**: `Technical analysis of underlying failure`
* **Mitigation Time**: `Duration to restore basic service`
* **Permanent Fix**: `Commit SHA & PR description`
* **Regression Test**: `Added unit/integration test file`
