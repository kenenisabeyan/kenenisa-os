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
11. **Production Hardening (Step 13)**: Centralized Zod environment validation, Prisma error mapping, request tracking (`X-Request-ID`), bounded 10-second graceful process shutdown, health/readiness endpoints (`/health`, `/ready`), rate limiting, and operational runbooks.

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

## Operational Documentation

* [`docs/production.md`](./docs/production.md) — Production operations, environment configuration, startup sequence & migrations.
* [`docs/observability.md`](./docs/observability.md) — Pino logging, `X-Request-ID` tracking, health & readiness endpoints.
* [`docs/security.md`](./docs/security.md) — Argon2id, session tokens, IDOR isolation, rate limits & AI prompt-injection security.
* [`docs/runbook.md`](./docs/runbook.md) — Incident response runbook for database, migration, and AI provider failures.
* [`docs/intelligence-core.md`](./docs/intelligence-core.md) — AI reasoning layer & context engine.
* [`docs/intelligence-tools.md`](./docs/intelligence-tools.md) — AI tool registry & action proposal protocol.
* [`docs/ai-safety.md`](./docs/ai-safety.md) — AI security boundaries & user confirmation rules.
* [`docs/api/`](./docs/api/) — Complete REST API reference documentation.
