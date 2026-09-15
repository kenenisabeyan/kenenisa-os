# KENENISA OS — Planning & Capacity Engine API Reference

The Planning API provides endpoints for Daily Plans, Time Blocks, Weekly Plans, Capacity calculations, and Schedule Conflict detection.

---

## Base Path
`/api/v1/planning`

Authentication required: **Cookie Session (`session_id`)** or **Bearer Header**. Single-tenant owner isolation is strictly enforced on all queries and mutations.

---

## 1. Daily Plans & Overview

### GET `/api/v1/planning/daily`
### GET `/api/v1/planning/daily/:date`

Retrieves the Daily Plan, Must-Win Task, Time Blocks, Capacity Metrics, Conflicts, and Unscheduled Ready Tasks for a target date.

#### Query Parameters
* `date`: Optional ISO date (`YYYY-MM-DD`). Defaults to current date in user's timezone.
* `timezone`: Optional IANA timezone string.

#### Response (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Daily plan overview retrieved successfully",
  "data": {
    "date": "2026-09-16",
    "plan": {
      "id": "dp_123",
      "date": "2026-09-16",
      "mustWinTaskId": "task_1",
      "notes": "Focus on Step 7 implementation",
      "status": "active"
    },
    "mustWinTask": {
      "id": "task_1",
      "title": "Build Capacity Engine",
      "status": "READY",
      "priority": "P0"
    },
    "timeBlocks": [],
    "capacity": {
      "date": "2026-09-16",
      "capacityMinutes": 480,
      "plannedMinutes": 360,
      "remainingMinutes": 120,
      "utilizationPercent": 75,
      "overCapacity": false
    },
    "conflicts": [],
    "unscheduledReadyTasks": []
  }
}
```

### POST `/api/v1/planning/daily`
Creates a Daily Plan for a unique `(userId, date)` pair.

### PATCH `/api/v1/planning/daily/:date`
Updates `mustWinTaskId`, `notes`, or `status` of an existing Daily Plan.

---

## 2. Time Blocks & Conflict Detection

### GET `/api/v1/planning/time-blocks`
Filters time blocks by `date`, `from`, `to`, `taskId`, `dailyPlanId`, or `status`.

### POST `/api/v1/planning/time-blocks`
Creates a TimeBlock. Enforces $startAt < endAt$ and rejects overlaps with HTTP 400 (`TIME_BLOCK_CONFLICT`).

#### Request Body
```json
{
  "dailyPlanId": "dp_123",
  "taskId": "task_1",
  "title": "Implement Time Block Service",
  "startAt": "2026-09-16T09:00:00.000Z",
  "endAt": "2026-09-16T11:00:00.000Z",
  "notes": "Deep work session"
}
```

### PATCH `/api/v1/planning/time-blocks/:id`
Updates an existing TimeBlock. Re-evaluates overlap conflict detection if start/end times change.

### DELETE `/api/v1/planning/time-blocks/:id`
Deletes a TimeBlock owned by the authenticated user.

---

## 3. Capacity Engine

### GET `/api/v1/planning/capacity/daily`
Returns factual planned time vs configured daily capacity (`dailyWorkCapacityMinutes`).

### GET `/api/v1/planning/capacity/weekly`
Returns weekly planned time vs configured weekly capacity (`weeklyWorkCapacityMinutes`) along with day-by-day capacity breakdown.

---

## 4. Weekly Plans

### GET `/api/v1/planning/weekly`
### GET `/api/v1/planning/weekly/:weekStart`
Returns Weekly Plan, Weekly Capacity, Daily Plans summary, and Unscheduled Ready Tasks for a planning week.

### POST `/api/v1/planning/weekly`
Creates a Weekly Plan for a unique `(userId, weekStart)` pair.

### PATCH `/api/v1/planning/weekly/:weekStart`
Updates `theme`, `notes`, or `status` of a Weekly Plan.
