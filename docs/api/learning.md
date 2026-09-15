# Learning API Specification

The Learning API manages intentional learning items, study activities, progress tracking, and skill linkages.

---

## Base Path

```text
/api/v1/learning
```

All routes require session authentication via the `auth_session` cookie.

---

## Endpoints

### 1. List Learning Items
```http
GET /api/v1/learning/items
```

Query Parameters:
- `status` (optional): `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `PAUSED`, `CANCELLED`
- `type` (optional): `COURSE`, `BOOK`, `TUTORIAL`, `DOCUMENTATION`, `LECTURE`, `PROJECT`, `PRACTICE`, `ARTICLE`, `OTHER`
- `projectId` (optional): UUID of linked project
- `search` (optional): Case-insensitive search on title/description/source
- `page` (optional): Page number (default: `1`)
- `pageSize` (optional): Items per page (default: `20`)

---

### 2. Get Learning Metrics
```http
GET /api/v1/learning/metrics
```

Response Data:
```json
{
  "totalItems": 12,
  "inProgressItems": 4,
  "completedItems": 5,
  "totalLoggedMinutes": 720,
  "activeSkillsCount": 6,
  "linkedProjectsCount": 3
}
```

---

### 3. Create Learning Item
```http
POST /api/v1/learning/items
```

Request Body:
```json
{
  "title": "PostgreSQL Performance & Query Optimization",
  "type": "COURSE",
  "source": "PostgreSQL Official Docs",
  "estimatedMinutes": 360,
  "projectId": "uuid-optional"
}
```

---

### 4. Record Learning Activity
```http
POST /api/v1/learning/items/:id/activities
```

Request Body:
```json
{
  "minutes": 90,
  "notes": "Studied index scan vs bitmap scan execution plans.",
  "date": "2026-09-16"
}
```

---

### 5. Link Skill to Learning Item
```http
POST /api/v1/learning/items/:id/skills
```

Request Body:
```json
{
  "skillId": "uuid",
  "relevance": "PRIMARY"
}
```

---

### 6. Lifecycle Transitions
```http
POST /api/v1/learning/items/:id/start
POST /api/v1/learning/items/:id/pause
POST /api/v1/learning/items/:id/complete
POST /api/v1/learning/items/:id/reopen
```
