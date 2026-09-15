# KENENISA OS — Analytics REST API Reference

All analytics endpoints require authentication (`Cookie` session token) and are mounted under `/api/v1/analytics`. Query parameters accept optional `from` (YYYY-MM-DD), `to` (YYYY-MM-DD), `period` (`day`, `week`, `month`, `quarter`, `custom`), and `granularity` (`day`, `week`, `month`).

---

## Endpoints Summary

### 1. `GET /api/v1/analytics/overview`
Returns bounded analytical overview of execution, planning, capacity, learning, projects, goals, evidence, and reviews.

### 2. `GET /api/v1/analytics/execution/trend`
Returns time-series array: `[{ date, completedTasks, createdTasks, blockedTasks, overdueTasks }]`.

### 3. `GET /api/v1/analytics/projects`
Returns project progress array with task breakdown, milestone completion, and progress percentage.

### 4. `GET /api/v1/analytics/goals`
Returns goal progress array with child project and task counts.

### 5. `GET /api/v1/analytics/workstreams`
Returns 7 workstreams breakdown with goals, projects, tasks, learning minutes, and evidence count.

### 6. `GET /api/v1/analytics/planning`
Returns planning and time block stats: `daysPlanned`, `plannedMinutes`, `plannedTaskMinutes`, `tasklessPlannedMinutes`.

### 7. `GET /api/v1/analytics/capacity`
Returns capacity stats: `totalAvailableMinutes`, `totalPlannedMinutes`, `remainingMinutes`, `utilizationPercentage`, `overCapacityDays`.

### 8. `GET /api/v1/analytics/overdue`
Returns overdue task stats and breakdown by workstream & project.

### 9. `GET /api/v1/analytics/blocked`
Returns blocked task stats: `currentlyBlocked`, `blockedDuringPeriod`, `unblockedDuringPeriod`, `dependencyBlocked`, `manuallyBlocked`.

### 10. `GET /api/v1/analytics/learning`
Returns learning item status totals and aggregate logged minutes.

### 11. `GET /api/v1/analytics/learning/trend`
Returns time-series array: `[{ date, minutes, activities, itemsCompleted }]`.

### 12. `GET /api/v1/analytics/skills`
Returns skill progress list with linked learning items, projects, and evidence counts.

### 13. `GET /api/v1/analytics/evidence`
Returns evidence count, verification state, and type distribution.

### 14. `GET /api/v1/analytics/evidence/trend`
Returns time-series array: `[{ date, evidenceCreated }]`.

### 15. `GET /api/v1/analytics/reviews`
Returns review status counts (`reviewsCreated`, `reviewsCompleted`, `reviewsDraft`).

### 16. `GET /api/v1/analytics/weekly-history`
Returns historical weekly operating snapshots for past 12 weeks.
