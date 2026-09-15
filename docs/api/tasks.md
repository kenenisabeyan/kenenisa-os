# Task Execution Engine API Reference

The Task Execution Engine is the execution layer of **KENENISA OS**. It turns high-level projects and milestones into actionable, deterministic units of work (Tasks), nested items (Subtasks), and prerequisite chains (Dependencies).

---

## Data Models & Enums

### Enums
- **TaskStatus**: `BACKLOG` | `READY` | `IN_PROGRESS` | `BLOCKED` | `REVIEW` | `DONE` | `CANCELLED`
- **TaskPriority**: `P0` (Urgent) | `P1` (High) | `P2` (Medium) | `P3` (Low)
- **TaskDependencyType**: `BLOCKS` | `BLOCKED_BY`

---

## Endpoints

All endpoints require authentication (`requireAuth`) via session cookies.

### 1. List Tasks
`GET /api/v1/tasks`

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, max: 100, default: 20)
- `projectId` (string, UUID, optional)
- `milestoneId` (string, UUID, optional)
- `parentTaskId` (string, UUID, optional)
- `status` (`TaskStatus`, optional)
- `priority` (`TaskPriority`, optional)
- `search` (string, optional)
- `overdue` (boolean, optional)
- `ready` (boolean, optional)
- `blocked` (boolean, optional)
- `completed` (boolean, optional)
- `sortBy` (`sortOrder` | `createdAt` | `dueDate` | `priority` | `status` | `title` | `estimateMinutes`)
- `sortOrder` (`asc` | `desc`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "00000000-0000-0000-0000-000000000003",
      "userId": "user-uuid",
      "projectId": "proj-uuid",
      "milestoneId": "ms-uuid",
      "parentTaskId": null,
      "title": "Verify Prisma schema & migrations",
      "description": "Ensure referential integrity",
      "status": "IN_PROGRESS",
      "priority": "P0",
      "estimateMinutes": 120,
      "actualMinutes": 0,
      "startDate": null,
      "dueDate": null,
      "completedAt": null,
      "sortOrder": 0,
      "createdAt": "2026-09-16T00:00:00.000Z",
      "updatedAt": "2026-09-16T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 2. Get Task Details
`GET /api/v1/tasks/:id`

**Response:** Contains subtasks list, `blockingDependencies`, `dependentDependencies`, and relationship counts.

---

### 3. Create Task
`POST /api/v1/tasks`

**Request Body:**
```json
{
  "projectId": "proj-uuid",
  "milestoneId": "ms-uuid",
  "title": "Implement authentication middleware",
  "description": "Verify session tokens via cookie-parser",
  "priority": "P1",
  "estimateMinutes": 90,
  "dueDate": "2026-09-20T18:00:00.000Z"
}
```

---

### 4. Status State Machine Endpoints
- `POST /api/v1/tasks/:id/start` — Transitions task to `IN_PROGRESS` (fails if blocking dependencies are unresolved).
- `POST /api/v1/tasks/:id/block` — Transitions task to `BLOCKED`.
- `POST /api/v1/tasks/:id/complete` — Transitions task to `DONE`, sets `completedAt`, and automatically evaluates dependent tasks.
- `POST /api/v1/tasks/:id/reopen` — Transitions task to `READY`/`BLOCKED`, clears `completedAt`.
- `POST /api/v1/tasks/:id/cancel` — Transitions task to `CANCELLED`.

---

### 5. Subtasks & Dependencies
- `POST /api/v1/tasks/:id/subtasks` — Create subtask under parent (max depth: 5 levels).
- `POST /api/v1/tasks/:id/dependencies` — Add blocking dependency (`blockingTaskId`). Prevents cycles via graph traversal.
- `DELETE /api/v1/tasks/:id/dependencies/:dependencyId` — Remove dependency and unblock dependent task if all blockers cleared.
