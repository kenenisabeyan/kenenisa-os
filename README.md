# KENENISA OS

**Personal 5th-Year Engineering & Career Operating System**

---

KENENISA OS is a personal, production-grade operating system built to structurally manage all dimensions of a senior engineering year and the career that follows it — including academic work, engineering projects, learning tracks, freelancing, personal branding, goal systems, productivity analytics, opportunities, and an AI Intelligence Core.

This is not a generic task manager. It is purpose-built software designed for serious, long-term use.

---

## Product Architecture & Implemented Core Modules

Steps 0–13 are fully implemented as production-grade domain services, REST APIs, and workspace UI pages:

1. **Authentication & Security (Step 3)**: Argon2id password hashing, SHA-256 session token hashing, HttpOnly cookies, logout & revocation.
2. **Workstreams, Goals & Projects (Step 4)**: Strategic hierarchy model linking goals, projects, and milestones.
3. **Tasks & Subtasks & Dependencies (Step 5)**: DAG dependency resolution, status state machines, and blocking task resolution.
4. **Command Center & Next Best Action (Step 6)**: Deterministic scoring engine surfacing the single Next Best Action.
5. **Daily & Weekly Planning & Capacity (Step 7)**: Available vs. planned capacity tracking, time blocks, and conflict detection.
6. **Learning & Skill Graph (Step 8)**: Skill levels, target levels, learning items, and activity tracking logs.
7. **Evidence & Weekly Review Engine (Step 9)**: Artifact verification linkers, weekly retrospectives, wins, lessons, and action items.
8. **Analytics & Personal Operating Intelligence (Step 10)**: Deterministic completion rate metrics, capacity utilization, velocity, and weekly history.
9. **Opportunities & Career Execution Engine (Step 11)**: Opportunities pipeline, skill/project/evidence/task linkers, and follow-up/deadline tracking.
10. **Intelligence Core (Step 12)**: Context Engine, AIProvider abstraction (OpenAI + MockAIProvider fallback), prompt injection defense, and Action Confirmation protocol.
11. **Production Hardening & System QA (Steps 13–15)**: Centralized Zod environment validation, Prisma error mapping, request tracking (`X-Request-ID`), bounded 10-second graceful process shutdown, health/readiness endpoints (`/health`, `/ready`), rate limiting, 25 tracked UX improvements, and 129/129 passing system QA tests.
12. **Production Release Engineering (Step 16)**: Production deployment architecture, zero-downtime Prisma migration SOPs, database backup & restore SOPs, rollback readiness, release verification matrix (`REL-001`–`REL-035`), and production incident runbook.
13. **Post-Production Monitoring & Stabilization (Step 17)**: Production health matrix (`PH-001`–`PH-030`), observability architecture, continuous stabilization SOPs, incident response protocol, and 15-step hotfix runbook.
14. **Continuous Product Evolution (Step 18)**: Evidence-driven product evolution framework, issue/opportunity classification model, prioritization score algorithm, active product backlog matrix (`PE-001`–`PE-010`), and architectural decision records.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript, Pino, Helmet, Express-Rate-Limit |
| **Database** | PostgreSQL, Prisma ORM (v6.19.3) |
| **Validation** | Zod (Schemas & Environment Config) |
| **Testing** | Vitest, Supertest, Playwright E2E |
| **Monorepo** | npm workspaces |

---

## Quick Start & Installation

```bash
# Clone the repository
git clone https://github.com/kenenisabeyan/kenenisa-os.git
cd kenenisa-os

# Install workspace dependencies
npm install

# Copy environment configuration template
cp .env.example .env

# Generate Prisma Client
npm run db:generate --workspace=apps/api

# Run quality verification gates
npm run typecheck
npm run lint
npm test
npm run build
```

---

## Running Development Servers

```bash
# Start both frontend (http://localhost:5173) and backend (http://localhost:3000)
npm run dev
```

---

## Product Evolution, Release & Operational Documentation

* [`docs/product-evolution.md`](./docs/product-evolution.md) — Authoritative Product Evolution Framework & Roadmap.
* [`docs/product-evolution-matrix.md`](./docs/product-evolution-matrix.md) — Active Product Evolution Backlog Matrix (`PE-001`–`PE-010`).
* [`docs/decisions/0008-product-evolution-loop.md`](./docs/decisions/0008-product-evolution-loop.md) — Architectural Decision Record for Continuous Product Evolution Loop.
* [`docs/production-release.md`](./docs/production-release.md) — Authoritative Production Release Record & Verification Evidence.
* [`docs/production-health-matrix.md`](./docs/production-health-matrix.md) — Step 17 Production Health Verification Matrix (`PH-001`–`PH-030`).
* [`docs/production-monitoring.md`](./docs/production-monitoring.md) — Post-Production Observability Architecture & Telemetry.
* [`docs/production-stabilization.md`](./docs/production-stabilization.md) — Stabilization Plan, Defect Triage & Known Issues Record.
* [`docs/incident-response.md`](./docs/incident-response.md) — Production Incident Response Protocol & Escalation SOPs.
* [`docs/hotfix-runbook.md`](./docs/hotfix-runbook.md) — Mandatory 15-step Production Emergency Hotfix Runbook.
* [`docs/production-release-matrix.md`](./docs/production-release-matrix.md) — Step 16 Production Release Verification Matrix (`REL-001`–`REL-035`).
* [`docs/deployment.md`](./docs/deployment.md) — Production deployment procedure, environment variables, & Nginx/static serving setup.
* [`docs/rollback.md`](./docs/rollback.md) — Production rollback procedures for API, database forward-fix, web assets, and session secret rotation.
* [`docs/production-runbook.md`](./docs/production-runbook.md) — Production incident response SOPs, health check probes (`/health`, `/ready`), & logging correlation.
* [`docs/system-qa-matrix.md`](./docs/system-qa-matrix.md) — Step 15 System-Wide QA Matrix (`QA-001`–`QA-028`).
* [`docs/ux-audit-matrix.md`](./docs/ux-audit-matrix.md) — Step 14 Tracked UX Audit Matrix (`UX-001`–`UX-025`).
* [`docs/security.md`](./docs/security.md) — Argon2id, session tokens, IDOR isolation, rate limits & AI prompt-injection security.
* [`docs/observability.md`](./docs/observability.md) — Pino logging, `X-Request-ID` tracking, health & readiness endpoints.
* [`docs/intelligence-core.md`](./docs/intelligence-core.md) — AI reasoning layer & context engine.
* [`docs/api/`](./docs/api/) — Complete REST API reference documentation.



