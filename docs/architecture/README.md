# Architecture Overview

## KENENISA OS — System Architecture

This document describes the high-level architecture of KENENISA OS.

---

## Style

**Modular Monolith** with a strict REST API boundary between frontend and backend.

The application is NOT a microservices architecture. All backend logic lives within a single deployable unit (`apps/api`). Internal organisation follows domain-driven module boundaries to allow future extraction if required.

---

## High-Level Structure

```
Browser (React)
      │  HTTP (REST)
      ▼
Express API (Node.js)
      │
      ▼
PostgreSQL (Prisma ORM)
```

---

## Components

| Component         | Technology                | Role                       |
| ----------------- | ------------------------- | -------------------------- |
| `apps/web`        | React, Vite, Tailwind CSS | User interface             |
| `apps/api`        | Express, TypeScript       | REST API server            |
| `packages/shared` | TypeScript                | Shared types and constants |
| PostgreSQL        | PostgreSQL 15+            | Persistent data store      |
| Prisma            | Prisma ORM                | Database access layer      |

---

## Current Status

Foundation scaffolding only. No domain logic has been implemented.

See `docs/decisions/` for Architecture Decision Records.
