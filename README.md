# KENENISA OS

**Personal 5th-Year Engineering & Career Operating System**

---

KENENISA OS is a personal, production-grade operating system built to structurally manage all dimensions of a senior engineering year and the career that follows it — including academic work, engineering projects, learning tracks, freelancing, personal branding, goal systems, and productivity analytics.

This is not a generic task manager. It is purpose-built software designed for serious, long-term use.

---

## Product Vision

A single, unified system that replaces scattered tools (Notion pages, spreadsheets, calendar apps, sticky notes) with one reliable, structured application that understands the full complexity of what it is managing:

- ASTU academic obligations
- Individual and group final-year engineering projects
- Full-stack and AI engineering learning tracks
- EDOT product development lifecycle
- Management studies
- Freelancing pipeline
- Personal brand strategy
- Goals, milestones, projects, tasks, subtasks, and dependencies
- Time planning, evidence tracking, retrospectives, and productivity analytics
- (Planned) AI-assisted planning and intelligent recommendations

---

## Technology Stack

| Layer          | Technology                                   |
| -------------- | -------------------------------------------- |
| Frontend       | React 19, TypeScript, Vite, Tailwind CSS     |
| Backend        | Node.js, Express, TypeScript                 |
| Database       | PostgreSQL, Prisma ORM                       |
| Validation     | Zod                                          |
| Testing        | Vitest, Supertest, Playwright                |
| Code Quality   | ESLint (flat config), Prettier, EditorConfig |
| Monorepo       | npm workspaces                               |
| Infrastructure | Docker, Docker Compose, GitHub Actions CI/CD |

---

## Repository Structure

```
kenenisa-os/
│
├── apps/
│   ├── web/              # React + Vite frontend
│   └── api/              # Express + TypeScript REST API
│
├── packages/
│   └── shared/           # Shared TypeScript types and constants
│
├── docs/
│   ├── architecture/     # System architecture documentation
│   ├── requirements/     # Product requirements
│   ├── development/      # Developer guides and conventions
│   ├── api/              # API reference documentation
│   └── decisions/        # Architecture Decision Records (ADRs)
│
├── tests/                # Integration and E2E tests (Playwright)
├── docker/               # Docker and Docker Compose configuration
├── .github/
│   └── workflows/        # GitHub Actions CI/CD pipelines
│
├── .env.example          # Environment variable template
├── eslint.config.js      # ESLint flat configuration
├── .prettierrc           # Prettier configuration
├── .editorconfig         # Editor formatting conventions
├── tsconfig.json         # Root TypeScript project references
└── package.json          # npm workspaces root
```

---

## Prerequisites

- **Node.js** `>= 20.0.0`
- **npm** `>= 10.0.0`
- **Git**

For database functionality (not yet active):

- **PostgreSQL** `>= 15`
- **Docker** + **Docker Compose** (optional, for containerised database)

---

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd kenenisa-os

# Install all workspace dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your values
```

---

## Running the Frontend

```bash
# From the repository root
npm run dev:web

# Or from the web workspace directly
cd apps/web
npm run dev
```

The frontend will be available at **http://localhost:5173**

---

## Running the Backend

```bash
# From the repository root
npm run dev:api

# Or from the api workspace directly
cd apps/api
npm run dev
```

The API will be available at **http://localhost:3000**

Health check: `GET http://localhost:3000/api/health`

---

## Running Both Simultaneously

```bash
# From the repository root
npm run dev
```

---

## Available Scripts

Run these from the repository root:

| Script                 | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start both frontend and backend in development mode |
| `npm run dev:web`      | Start frontend only                                 |
| `npm run dev:api`      | Start backend only                                  |
| `npm run build`        | Build all packages for production                   |
| `npm run lint`         | Run ESLint across all packages                      |
| `npm run format`       | Format all files with Prettier                      |
| `npm run format:check` | Check formatting without writing                    |
| `npm run typecheck`    | Run TypeScript type checking across all packages    |
| `npm run test`         | Run all tests                                       |

---

## Current Development Status

**Phase: Foundation — Repository Setup**

This repository is in its initial scaffolding phase. The following has been completed:

- [x] Monorepo structure with npm workspaces
- [x] Strict TypeScript configuration with project references
- [x] ESLint (flat config) + Prettier + EditorConfig
- [x] Frontend scaffold (React + Vite + Tailwind CSS — placeholder screen)
- [x] Backend scaffold (Express — `/api/health` endpoint only)
- [x] Shared package with base types and constants
- [x] Documentation structure
- [x] Architecture Decision Records started

The following is **not yet implemented**:

- [ ] Authentication
- [ ] Database schema (Prisma)
- [ ] Any business domain (tasks, projects, goals, etc.)
- [ ] Dashboard UI
- [ ] Docker application services
- [ ] CI/CD pipelines
- [ ] AI-assisted features

---

## Documentation

All documentation lives in the [`docs/`](./docs/) directory:

- [`docs/architecture/`](./docs/architecture/) — System architecture
- [`docs/requirements/`](./docs/requirements/) — Product requirements
- [`docs/development/`](./docs/development/) — Developer guides
- [`docs/api/`](./docs/api/) — API reference
- [`docs/decisions/`](./docs/decisions/) — Architecture Decision Records

---

_KENENISA OS is an actively developed personal system. It is designed to grow in capability and complexity as the product vision is implemented._
