# KENENISA OS — Production Rollback Strategy & SOP

This document outlines the operational procedures for rolling back application builds, database migrations, frontend static assets, authentication sessions, and AI provider configurations in **KENENISA OS**.

---

## 1. Rollback Overview & Strategy

When a critical production incident occurs post-deployment (P0 outage, broken authentication, data integrity flaw, severe API regression), operations engineers must execute a structured rollback.

```text
INCIDENT DETECTED
  ↓
IDENTIFY COMPONENT (API vs Frontend vs DB vs Auth)
  ↓
STOP DEPLOYMENT PIPELINE
  ↓
EXECUTE COMPONENT ROLLBACK PROCEDURE
  ↓
VERIFY HEALTH & READINESS (/health & /ready)
  ↓
POST-MORTEM & ROOT CAUSE FIX
```

---

## 2. Component-Specific Rollback SOPs

### 2.1 API Backend Application Rollback
1. **Revert Server Process**:
   Deploy the previous verified Git commit SHA artifact (e.g., `git checkout <PREVIOUS_SHA> && npm ci && npm run build`).
2. **Restart API Process**:
   ```bash
   pm2 restart kenenisa-os-api
   ```
3. **Verify API Operational Health**:
   ```bash
   curl https://api.yourdomain.com/ready
   ```

### 2.2 Database Schema & Migration Rollback Policy
> [!CAUTION]
> Never execute `prisma migrate reset` or drop database tables in a production environment. Destructive database rollbacks run the risk of unrecoverable data loss.

1. **Preferred Strategy — Non-Destructive Forward-Fix**:
   - Create a new backward-compatible migration using `npx prisma migrate dev --name fix_<issue_name>`.
   - Apply the migration in production via `npx prisma migrate deploy`.
2. **Emergency Restore from Binary Dump**:
   - If data corruption occurs, restore the PostgreSQL instance from the last verified `pg_dump` pre-migration snapshot:
     ```bash
     pg_restore -U postgres -h <PROD_DB_HOST> -d kenenisa_os -v --clean --if-exists /backups/kenenisa_os_pre_deploy.dump
     ```
   - Verify database table integrity and reconnect API processes.

### 2.3 Frontend SPA Static Bundle Rollback
1. **Revert Web Assets**:
   Point Nginx or Web Server root directory back to the previous static build output directory (`apps/web/dist_prev`).
2. **Purge CDN Cache**:
   Clear edge server cache (Vercel, Cloudflare, CloudFront) for `index.html`.

### 2.4 Emergency Security & Session Invalidation Rollback
If session secret leak, credential compromise, or IDOR vulnerability is detected:
1. **Rotate Session Secret**:
   Update `SESSION_SECRET` in environment variables with a new high-entropy string.
2. **Restart API Server**:
   ```bash
   pm2 restart kenenisa-os-api
   ```
   *Result*: Immediately invalidates all active user session cookies and forces re-authentication.

### 2.5 AI Intelligence Core Emergency Fallback
If the external LLM provider experiences latency spikes, rate limits, or outage:
1. **Toggle Provider Fallback**:
   Set `AI_PROVIDER=mock` in process environment variables.
2. **Reload API Service**:
   ```bash
   pm2 reload kenenisa-os-api
   ```
   *Result*: API automatically routes all `/api/v1/intelligence/*` queries to internal deterministic `MockAIProvider`, keeping core operating system domain features 100% operational.
