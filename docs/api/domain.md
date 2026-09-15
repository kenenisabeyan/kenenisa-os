# Strategic Domain API Documentation

Covers the four connected strategic domain resources in KENENISA OS:

```text
User → Workstream → Goal → Project → Milestone
```

## 1. Workstreams API (`/api/v1/workstreams`)

Permanent strategic areas of responsibility.

### Endpoints
- `GET /api/v1/workstreams` — List workstreams (supports `page`, `pageSize`, `search`, `status`, `sortBy`, `sortOrder`).
- `GET /api/v1/workstreams/:id` — Retrieve a single workstream by ID.
- `POST /api/v1/workstreams` — Create a workstream.
- `PATCH /api/v1/workstreams/:id` — Update workstream fields.
- `POST /api/v1/workstreams/:id/archive` — Soft archive a workstream (`status = ARCHIVED`).

---

## 2. Goals API (`/api/v1/goals`)

Strategic outcomes belonging to a Workstream.

### Endpoints
- `GET /api/v1/goals` — List goals (filters: `workstreamId`, `status`, `priority`, `search`).
- `GET /api/v1/goals/:id` — Retrieve a single goal.
- `POST /api/v1/goals` — Create a goal under a workstream.
- `PATCH /api/v1/goals/:id` — Update goal parameters.
- `POST /api/v1/goals/:id/complete` — Complete goal (`status = ACHIEVED`, `completedAt = now()`).
- `POST /api/v1/goals/:id/reopen` — Reopen goal (`status = IN_PROGRESS`, `completedAt = null`).

---

## 3. Projects API (`/api/v1/projects`)

Bounded initiatives executed to fulfill goals/workstreams.

### Endpoints
- `GET /api/v1/projects` — List projects (filters: `workstreamId`, `goalId`, `status`, `priority`, `search`, `archived`).
- `GET /api/v1/projects/:id` — Retrieve project details.
- `POST /api/v1/projects` — Create a project. Validates that `goalId` (if provided) belongs to the specified `workstreamId`.
- `PATCH /api/v1/projects/:id` — Update project metadata.
- `POST /api/v1/projects/:id/archive` — Soft archive project (`status = ARCHIVED`, `archivedAt = now()`).
- `POST /api/v1/projects/:id/complete` — Complete project (`status = COMPLETED`, `completedAt = now()`).
- `POST /api/v1/projects/:id/reopen` — Reopen project (`status = ACTIVE`).

---

## 4. Milestones API (`/api/v1/milestones`)

Major stage checkpoints belonging to a Project.

### Endpoints
- `GET /api/v1/milestones` — List milestones (filters: `projectId`, `status`, `search`).
- `GET /api/v1/milestones/:id` — Retrieve milestone details.
- `POST /api/v1/milestones` — Create milestone.
- `PATCH /api/v1/milestones/:id` — Update milestone.
- `POST /api/v1/milestones/reorder` — Transactionally reorder milestone sequence (`items: [{ id, sortOrder }]`).
- `POST /api/v1/milestones/:id/complete` — Complete milestone (`status = REACHED`, `completedAt = now()`).
- `POST /api/v1/milestones/:id/reopen` — Reopen milestone (`status = IN_PROGRESS`, `completedAt = null`).

---

## 5. Security & Ownership Enforcement
- **IDOR Protection**: Every query mandates `userId: req.auth.userId`. Attempts to access another user's resource return `404 Not Found`.
- **Validation**: Strict server-side Zod validation envelopes for all request bodies and query parameters.
- **Audit Logging**: State transitions emit structured events to `AuditLog` (`WORKSTREAM_CREATED`, `GOAL_COMPLETED`, `PROJECT_ARCHIVED`, `MILESTONE_REORDERED`).
