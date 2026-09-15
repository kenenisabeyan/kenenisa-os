# KENENISA OS — Opportunities REST API Specification

All endpoints require authentication (`Cookie` session token) and are mounted under `/api/v1/opportunities`.

---

## 1. Opportunities Endpoints

### `GET /api/v1/opportunities`
List opportunities with filtering and pagination.
- **Query Params**: `status`, `type`, `priority`, `source`, `remote`, `search`, `page`, `pageSize`.

### `POST /api/v1/opportunities`
Create a new opportunity.

### `GET /api/v1/opportunities/follow-ups`
Retrieve grouped follow-up lists (`overdue`, `today`, `upcoming`).

### `GET /api/v1/opportunities/deadlines`
Retrieve grouped deadline lists (`overdue`, `today`, `next7Days`, `next30Days`).

### `GET /api/v1/analytics/opportunities`
Retrieve factual career execution metrics and status/type funnel counts.

### `GET /api/v1/opportunities/:id`
Get full opportunity details with linked skills, projects, evidence, tasks, and activity timeline.

### `PATCH /api/v1/opportunities/:id`
Update opportunity details.

---

## 2. Status Transition Endpoints

- `POST /api/v1/opportunities/:id/evaluate` $\rightarrow$ `EVALUATING`
- `POST /api/v1/opportunities/:id/prepare` $\rightarrow$ `PREPARING`
- `POST /api/v1/opportunities/:id/apply` $\rightarrow$ `APPLIED`
- `POST /api/v1/opportunities/:id/discuss` $\rightarrow$ `IN_DISCUSSION`
- `POST /api/v1/opportunities/:id/interview` $\rightarrow$ `INTERVIEW`
- `POST /api/v1/opportunities/:id/offer` $\rightarrow$ `OFFERED`
- `POST /api/v1/opportunities/:id/accept` $\rightarrow$ `ACCEPTED`
- `POST /api/v1/opportunities/:id/start` $\rightarrow$ `ACTIVE`
- `POST /api/v1/opportunities/:id/complete` $\rightarrow$ `COMPLETED`
- `POST /api/v1/opportunities/:id/reject` $\rightarrow$ `REJECTED`
- `POST /api/v1/opportunities/:id/withdraw` $\rightarrow$ `WITHDRAWN`
- `POST /api/v1/opportunities/:id/archive` $\rightarrow$ `ARCHIVED`

---

## 3. Relationship Linkers

- `POST /api/v1/opportunities/:id/skills` & `DELETE /api/v1/opportunities/:id/skills/:skillId`
- `POST /api/v1/opportunities/:id/projects` & `DELETE /api/v1/opportunities/:id/projects/:projectId`
- `POST /api/v1/opportunities/:id/evidence` & `DELETE /api/v1/opportunities/:id/evidence/:evidenceId`
- `POST /api/v1/opportunities/:id/tasks` & `DELETE /api/v1/opportunities/:id/tasks/:taskId`

---

## 4. Professional Timeline Logs

- `POST /api/v1/opportunities/:id/activities`: Log notes, contacts, interview dates, follow-up notes, or offer details.
