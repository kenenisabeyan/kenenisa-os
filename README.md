<div align="center">

# ⚡ KENENISA OS
### *Autonomous Personal Engineering & Career Operating System*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-109%20Passing-22C55E?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Argon2id](https://img.shields.io/badge/Security-Argon2id%20%2B%20HttpOnly-8B5CF6?style=for-the-badge&logo=shield&logoColor=white)](#-security--authentication)

<br/>

**A mission-critical, production-grade personal operating system built to orchestrate all dimensions of high-velocity engineering, academic mastery, career progression, learning graphs, and AI intelligence.**

[Explore Architecture](#-system-architecture--executive-overview) • [Core Capabilities](#-core-capabilities--features) • [Quick Start](#-quick-start--installation) • [Security & Auth](#-security--authentication-architecture) • [Documentation](#-engineering-documentation)

---

</div>

<br/>

## 🏛️ System Architecture & Executive Overview

**KENENISA OS** is not a generic to-do list or lightweight hobby template. It is an **enterprise-architected, deterministic personal execution platform** tailored for senior engineers, academic researchers, and ambitious builders. 

It synthesizes strategic planning, capacity scheduling, directed acyclic graph (DAG) task dependencies, continuous evidence tracking, career opportunities, and an AI intelligence core into a single cohesive system.

```mermaid
graph TD
    User([👤 Engineer / Owner]) -->|Secured HttpOnly Session| WebUI["🖥️ Modern React 19 Frontend<br/>(Vite + Tailwind CSS)"]
    WebUI -->|RESTful APIs / X-Request-ID| APIGateway["⚙️ Express API Gateway<br/>(Rate Limiting + Zod Validation)"]
    
    subgraph "Core Domain Services"
        APIGateway --> AuthSvc["🔒 Auth & Session Service<br/>(Argon2id + SHA-256)"]
        APIGateway --> PlanSvc["📅 Planning & Capacity Engine<br/>(Daily / Weekly / Workblocks)"]
        APIGateway --> TaskSvc["⚡ Task & DAG Dependency Engine<br/>(Topological Resolution)"]
        APIGateway --> LearnSvc["🧠 Skill Graph & Evidence Engine<br/>(Retrospectives & Milestones)"]
        APIGateway --> AISvc["🤖 Intelligence Core Engine<br/>(Context Injection + Safety Guard)"]
    end
    
    AuthSvc & PlanSvc & TaskSvc & LearnSvc & AISvc --> PrismaORM["🔷 Prisma ORM Layer"]
    PrismaORM --> NeonDB[("🐘 PostgreSQL Database<br/>(High-Performance Cloud DB)")]
```

---

## 💎 The 7 Core Strategic Workstreams

KENENISA OS organizes life, code, and career execution into 7 primary structural workstreams:

| # | Workstream | Primary Scope & Focus | Priority Weight |
| :-: | :--- | :--- | :-: |
| 🎓 | **ASTU / Graduation** | 5th-year engineering coursework, assignments, capstones & exams | `10 / 10` |
| 💻 | **Full-Stack Engineering** | High-concurrency web architecture, distributed systems & cloud | `9 / 10` |
| 🤖 | **AI Engineering** | Autonomous agents, RAG pipelines, fine-tuning & ML research | `8 / 10` |
| 🚀 | **EDOT SaaS** | Commercial software platforms, educational tools & product scaling | `7 / 10` |
| 📊 | **Management & Leadership**| Agile frameworks, engineering management & executive roadmap execution | `6 / 10` |
| 💼 | **Freelancing** | High-value client consulting, contracts & enterprise delivery | `5 / 10` |
| 🌐 | **Personal Brand** | Technical writing, open-source impact & developer presence | `4 / 10` |

---

## ✨ Core Capabilities & Features

### 1. 🎯 Next Best Action (NBA) Engine
* **Deterministic Scoring Algorithm**: Evaluates priority weights, blocking dependencies, deadlines, and current capacity to determine the single highest-leverage task for right now.
* **DAG Dependency Resolution**: Enforces topological ordering (`BLOCKS` / `BLOCKED_BY`) so you never attempt a task with unfulfilled prerequisites.

### 2. 📅 Strategic Planning & Capacity Engine
* **Available vs. Planned Capacity**: Compares daily 480-minute (8h) and weekly 2,400-minute (40h) work capacities with planned time blocks.
* **Conflict & Over-Allocation Detection**: Automatic warning banners when tasks exceed available energy/time buffers.
* **Time Blocking**: Live visual calendar blocks with state machines (`PLANNED`, `IN_PROGRESS`, `COMPLETED`, `INTERRUPTED`).

### 3. 🧠 Skill Graph & Evidence Engine
* **Skill Matrix**: Dynamic proficiency tracker (`NOVICE` &rarr; `EXPERT`) with target mastery timelines.
* **Verified Evidence Linker**: Link GitHub PRs, live URLs, deployed prototypes, and research notes to skills and milestone completions.
* **Weekly Retrospectives**: Structured weekly reviews capturing wins, retrospective learnings, and auto-generated action plans.

### 4. 🤖 AI Intelligence Core
* **Context Engine**: Gathers active workstreams, daily plans, upcoming deadlines, and user memory into structured LLM system prompts.
* **Provider Abstraction**: Multi-provider support (OpenAI `gpt-4o-mini`, Anthropic, or zero-cost local `MockAIProvider`).
* **Prompt-Injection Defense**: Sanitizes user queries and implements the **Action Confirmation Protocol** before triggering destructive actions.

### 5. 📊 Real-Time Analytics & Excel Intelligence
* **Productivity Velocity**: Completion rate tracking across workstreams, time utilization curves, and longitudinal trend lines.
* **Spreadsheet Export**: Direct streaming export of comprehensive monthly and yearly reports in `.xlsx` binary format with auto-styled columns.

---

## 🔒 Security & Authentication Architecture

Security in KENENISA OS is engineered to strict OWASP standards:

```
[Client Request] ──> [20 req / 15 min Rate Limiter] ──> [Zod Schema Validation]
       │
       ├──> Session Token ──> SHA-256 Hash Lookup in Database ──> User ID Isolation
       │
       └──> Password Management ──> Argon2id (Memory: 64MB, Iterations: 3)
```

- **Argon2id Password Hashing**: State-of-the-art cryptographic password protection (`$argon2id$...`).
- **Cryptographic Session Tokens**: 256-bit random tokens transmitted via `HttpOnly`, `SameSite=Lax`, `Secure` cookies; only SHA-256 hashes stored in DB.
- **Strict Anti-IDOR Scoping**: All database queries are explicitly partitioned by the authenticated `req.user.id`.
- **Identity Self-Recovery**:
  - **Forgot Password**: 6-digit numeric recovery verification code with automatic 15-minute expiration and cross-device session invalidation.
  - **Forgot Email**: Name-based account discovery with instant 1-click clipboard copy and auto-fill sign-in.
- **Audit Logging**: Comprehensive, sanitized security audit logs recording every `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, and `PASSWORD_RESET`.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PostgreSQL**: Local instance or Cloud Neon DB

### 1. Clone & Install
```bash
git clone https://github.com/kenenisabeyan/kenenisa-os.git
cd kenenisa-os

# Install workspace dependencies across apps and shared packages
npm install
```

### 2. Environment Configuration
Copy the template and verify environment settings:
```bash
cp .env.example .env
```

Ensure your `DATABASE_URL` is configured in `apps/api/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/kenenisa_os?schema=public"
```

### 3. Generate Database Client & Seed Owner Account
```bash
# Generate Prisma Client
npm run db:generate --workspace=apps/api

# Provision / Migrate Owner Account
npm run db:create-owner --workspace=apps/api
```

### 4. Run Development Servers
```bash
# Starts both Backend API (http://localhost:3000) and Frontend Web (http://localhost:5173)
npm run dev
```

---

## 🔑 Default Sign-In Credentials

For local setup and initial access:

| Field | Default Value | Notes |
| :--- | :--- | :--- |
| **Email** | `beyankenenisa@gmail.com` | Recoverable anytime via `/forgot-email` |
| **Password** | `kenenisa@077215` | Resettable anytime via `/forgot-password` |
| **Role** | `OWNER` | Root system access & administration |

> [!TIP]
> You can also click the **"⚡ Autofill Owner Credentials"** button on the [Login Page](http://localhost:5173/login) for instant 1-click access during local development.

---

## 🧪 Testing & Quality Gates

KENENISA OS maintains zero-compromise code health standards:

```bash
# Run strict TypeScript typecheck across all workspaces
npm run typecheck

# Run automated unit & integration test suites (109+ tests)
npm test

# Run ESLint validation
npm run lint

# Compile production bundles
npm run build
```

---

## 📂 Project Structure

```text
kenenisa-os/
├── apps/
│   ├── api/                    # Express backend service
│   │   ├── prisma/             # Schema & database seed scripts
│   │   ├── src/
│   │   │   ├── domain/         # Domain-Driven services (Auth, Tasks, Goals, etc.)
│   │   │   ├── middleware/     # Rate limiter, auth guard, errorHandler
│   │   │   ├── services/       # AI core, Audit logs, Excel reporting
│   │   │   └── __tests__/      # 16 Vitest test suites (109 passing tests)
│   └── web/                    # React 19 SPA frontend
│       ├── src/
│       │   ├── app/            # Providers, router & layout configuration
│       │   ├── components/     # UI design system components & ProtectedRoute
│       │   ├── features/       # Feature hooks, contexts (Auth, Planning, Tasks)
│       │   └── pages/          # App pages (Dashboard, Login, Recovery, Kanban)
├── packages/
│   └── shared/                 # Shared TypeScript models, DTOs & Zod schemas
├── docs/                       # Complete engineering specs, runbooks & ADRs
└── docker/                     # Dockerfile & Docker Compose configurations
```

---

## 📚 Engineering Documentation

The repository includes comprehensive production documentation:

- 📋 [**Strategic Product Baseline**](./docs/strategic-product-baseline.md) — 28-Domain Implementation Matrix & System Map.
- 🗺️ [**Strategic Roadmap**](./docs/strategic-roadmap.md) — Execution priorities (`NOW`, `NEXT`, `LATER`).
- 🔐 [**Security Architecture**](./docs/security.md) — Cryptographic hashing, IDOR isolation & token models.
- 📡 [**REST API Reference**](./docs/api/README.md) — Full endpoint contracts, payloads & responses.
- 🛠️ [**Production Runbook**](./docs/production-runbook.md) — Health check probes, incident triage & log correlation.
- 🚀 [**Production Release Verification**](./docs/production-release.md) — Verification evidence & acceptance records.

---

<div align="center">

**Built with pride by [Kenenisa Beyan](https://github.com/kenenisabeyan)**  
*Crafted for high-velocity software engineering excellence.*

</div>
