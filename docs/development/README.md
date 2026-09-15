# Developer Guide — KENENISA OS

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

# Database migrations & seeding
npm run db:migrate --workspace=apps/api
npm run db:seed --workspace=apps/api

# Provision owner account
npm run db:create-owner --workspace=apps/api
```

---

## Development Commands

```bash
# Start both frontend and backend
npm run dev

# Frontend only  (http://localhost:5173)
npm run dev:web

# Backend only   (http://localhost:3000)
npm run dev:api

# Provision / Update Owner Account
npm run db:create-owner --workspace=apps/api

# Purge Expired Sessions
npm run db:cleanup-sessions --workspace=apps/api
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

## Workspace Structure

This is an npm workspaces monorepo. Each workspace has its own `package.json`:

| Workspace    | Path              |
| ------------ | ----------------- |
| Frontend     | `apps/web`        |
| Backend API  | `apps/api`        |
| Shared types | `packages/shared` |
