# KENENISA OS — Production Deployment & Rollback Runbook

**Project**: KENENISA OS — Personal 5th-Year Engineering & Career Operating System  
**Document Identifier**: `v1.0.0-production-deployment-runbook`  
**Date**: `2026-09-17`  
**Status**: `APPROVED PRODUCTION RUNBOOK`  

---

## 1. Pre-Deployment Verification Protocol

Before initiating a production release:
1. **Working Tree Check**: Ensure `git status` is clean on `main` branch.
2. **Quality Gates Execution**:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   npm run build
   ```
3. **Database Migration Status**: Verify Prisma schema migrations are synced:
   ```bash
   npx prisma migrate status
   ```

---

## 2. Deployment Execution Sequence

1. **Environment Variable Injection**: Inject live production credentials (`DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`) into hosting dashboard.
2. **Database Migration Execution**:
   ```bash
   npx prisma migrate deploy
   ```
3. **Application Build & Launch**:
   ```bash
   npm run build
   npm run start --workspace=apps/api
   ```

---

## 3. Post-Deployment Smoke Verification

Verify core operational endpoints immediately after launch:

| Step | Target Endpoint / Workflow | Expected Result | Verification Command |
| :--- | :--- | :--- | :--- |
| 1 | `GET /api/v1/health` | HTTP 200 OK | `curl -f http://localhost:3000/api/v1/health` |
| 2 | `GET /api/v1/ready` | HTTP 200 OK (DB connected) | `curl -f http://localhost:3000/api/v1/ready` |
| 3 | `POST /api/v1/auth/login` | HTTP 200 OK & HttpOnly cookie | Automated integration test assertion |
| 4 | Command Center `/dashboard` | Next Best Action rendered | SPA Smoke Test |

---

## 4. Rollback & Incident Response SOP

If a critical production incident occurs post-deployment:
1. **Immediate Service Reversion**: Redeploy the previous verified release commit (`07d5a05`).
2. **Database State Protection**: Database schema changes use backward-compatible migrations; do not drop tables or execute destructive resets.
3. **Session Revocation**: Invalidate active sessions via database update if authentication compromise occurs.
4. **Pino Incident Tracing**: Filter logs using `X-Request-ID` to isolate root cause.
