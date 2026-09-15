# Skills API Specification

The Skills API tracks explicit technical capabilities, current vs target mastery levels, linked learning items, and applied project evidence.

---

## Base Path

```text
/api/v1/skills
```

All routes require session authentication via the `auth_session` cookie.

---

## Endpoints

### 1. List Skills
```http
GET /api/v1/skills
```

Query Parameters:
- `status` (optional): `ACTIVE`, `PAUSED`, `MASTERED`, `ARCHIVED`
- `category` (optional): Search filter for category
- `search` (optional): Case-insensitive search on name/description

---

### 2. Get Skill Details
```http
GET /api/v1/skills/:id
```

Returns skill metadata along with linked learning items and derived applied projects.

---

### 3. Create Skill
```http
POST /api/v1/skills
```

Request Body:
```json
{
  "name": "Database Engineering",
  "category": "Backend",
  "currentLevel": "INTERMEDIATE",
  "targetLevel": "ADVANCED"
}
```

---

### 4. Update Skill & Level
```http
PATCH /api/v1/skills/:id
```

Request Body:
```json
{
  "currentLevel": "ADVANCED",
  "targetLevel": "EXPERT"
}
```
*(Triggers a `SKILL_LEVEL_CHANGED` audit log event).*

---

### 5. Archive Skill
```http
POST /api/v1/skills/:id/archive
```
