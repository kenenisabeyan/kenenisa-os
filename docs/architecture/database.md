# Database Architecture & Infrastructure — KENENISA OS

## Overview

KENENISA OS utilizes PostgreSQL 16 as its primary relational data store, managed through Prisma ORM v6 with source-controlled Prisma migrations.

```
┌────────────────────────────────────────────────────────┐
│                   Express API (apps/api)                │
└───────────────────────────┬────────────────────────────┘
                            │ Prisma Client Singleton
                            ▼
┌────────────────────────────────────────────────────────┐
│               PostgreSQL 16 (docker / local)            │
├────────────────────────────────────────────────────────┤
│ Core Entities: User, Workstream, Goal, Project, Task,  │
│ Milestone, TaskDependency, Tag, DailyPlan, TimeBlock,  │
│ WeeklyPlan, WeeklyReview, AuditLog                     │
└────────────────────────────────────────────────────────┘
```

---

## Technical Specifications

### 1. ID Strategy

- **Format:** UUID v4 string (`@id @default(uuid())`).
- **Rationale:** Exposing sequential integer IDs in public APIs reveals database record counts and enables enumeration attacks. UUIDs provide globally unique, non-enumerable, stable identifiers.

### 2. Timestamp Strategy

- **Fields:** `createdAt` (`@default(now())`) and `updatedAt` (`@updatedAt`) on all core models.
- **Timezone Storage:** Timestamps are persisted in UTC. Application services format timestamps to user-configured timezones (e.g. `Africa/Addis_Ababa`).

### 3. User Ownership Model

- Every user-owned entity links directly or transitively to `User.id`.
- Foreign key constraints enforce user boundaries (`onDelete: Cascade`), preparing the database for secure authorization checks in Step 3.

### 4. Delete & Archival Strategy

- **Hard Delete with Cascade:** Used only for child records that have no independent existence without their parent (e.g. `UserSettings`, `Milestone`, `TaskTag`).
- **Soft Archival / Status Flags:** Used for top-level strategic entities (`WorkstreamStatus.ARCHIVED`, `ProjectStatus.ARCHIVED`) to preserve historical progress and audit logs.

### 5. Indexing Principles

Indexes are placed on frequently queried access patterns:

- Compound uniqueness: `[userId, slug]`, `[userId, date]`, `[userId, weekStart]`, `[blockingTaskId, dependentTaskId]`, `[taskId, tagId]`.
- Filtering & Sorting: `[projectId, status]`, `[projectId, dueDate]`, `[projectId, priority]`, `[userId, status]`, `[userId, targetDate]`.

### 6. Transaction Policy

Multi-entity write operations (e.g. creating a project with initial milestones, updating task status alongside an audit log) use Prisma interactive transactions (`prisma.$transaction`).

### 7. Seed Strategy

The database seed script (`apps/api/prisma/seed.ts`) is fully **idempotent** using Prisma `upsert`. It initializes:

- Default admin user (`kenenisa@kenenisa-os.internal`)
- User preferences in `UserSettings`
- 7 Core Workstreams (_ASTU / Graduation_, _Full-Stack Engineering_, _AI Engineering_, _EDOT_, _Management_, _Freelancing_, _Personal Brand_)
