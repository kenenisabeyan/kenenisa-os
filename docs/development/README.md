# Developer Guide

## KENENISA OS — Development Reference

---

## Prerequisites

- **Node.js** `>= 20.0.0`
- **npm** `>= 10.0.0`
- **Git**

---

## First-Time Setup

```bash
git clone <repo-url>
cd kenenisa-os
npm install
cp .env.example .env
# Edit .env with your local values
```

---

## Running in Development

```bash
# Both frontend and backend
npm run dev

# Frontend only  (http://localhost:5173)
npm run dev:web

# Backend only   (http://localhost:3000)
npm run dev:api
```

---

## Code Quality Commands

```bash
npm run lint           # ESLint (0 warnings policy)
npm run format         # Prettier — writes changes
npm run format:check   # Prettier — checks without writing
npm run typecheck      # TypeScript project references
npm run test           # All tests
```

---

## Conventions

| Convention      | Value          |
| --------------- | -------------- |
| Indentation     | 2 spaces       |
| Quotes          | Single         |
| Semicolons      | Required       |
| Trailing commas | All            |
| Line endings    | LF             |
| Max line length | 100 characters |

---

## Workspace Structure

This is an npm workspaces monorepo. Each workspace has its own `package.json`:

| Workspace    | Path              |
| ------------ | ----------------- |
| Frontend     | `apps/web`        |
| Backend API  | `apps/api`        |
| Shared types | `packages/shared` |

---

## Adding a Dependency

```bash
# To a specific workspace
npm install <package> --workspace=apps/api

# To root devDependencies
npm install <package> -D
```
