# KENENISA OS — Production Hotfix Runbook

This runbook defines the mandatory 15-step procedure for developing, testing, deploying, and verifying emergency hotfixes in **KENENISA OS**.

---

## 1. Hotfix Execution Protocol

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. DETECT       Identify production defect / failure log     │
│ 2. CLASSIFY     Assign severity (P0-P3) and create issue ticket│
│ 3. REPRODUCE    Reproduce bug in isolated local environment  │
│ 4. ROOT CAUSE   Determine exact underlying failure mechanism  │
│ 5. MINIMAL FIX  Code minimal, targeted fix without side effects│
│ 6. ADD TEST     Write automated regression test for bug scenario│
│ 7. TYPECHECK    Run `npm run typecheck` (0 errors required)  │
│ 8. LINT         Run `npm run lint` (0 warnings required)     │
│ 9. UNIT TEST    Run `npm test` (100% test pass required)     │
│ 10. DIFF AUDIT  Review `git diff` for unauthorized changes   │
│ 11. BUILD       Execute `npm run build` production build     │
│ 12. DEPLOY      Deploy compiled artifact to production target│
│ 13. SMOKE TEST  Verify `/health`, `/ready`, and domain routes│
│ 14. MONITOR     Observe Pino JSON logs for 15-30 minutes     │
│ 15. CLOSE       Document resolution evidence and close ticket│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Non-Negotiable Quality Rules During Hotfixes

1. **NO SKIPPING GATES**: Hotfixes must **never** bypass TypeScript typechecking, ESLint validation, or unit test execution.
2. **NO DESTRUCTIVE DB COMMANDS**: Never execute `prisma migrate reset` or drop database schema tables in production during a hotfix.
3. **NO HARDCODED SECRETS**: Never inject hardcoded credentials or debug tokens into hotfix source files.
4. **NO ARCHITECTURE REWRITES**: Hotfixes must be targeted and minimal. Do not attempt major refactoring during an emergency hotfix.

---

## 3. Hotfix Rollback Strategy

If a deployed hotfix fails post-deployment verification:
1. Immediately execute application rollback to previous known-good Git commit SHA artifact.
2. Restart API server (`pm2 restart kenenisa-os-api`).
3. Re-verify liveness (`/health`) and database readiness (`/ready`).
