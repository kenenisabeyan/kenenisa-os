# KENENISA OS — Analytics Engine Metric Definitions

This document defines the formulas, input parameters, and exact status inclusion/exclusion boundaries for every metric calculated by the **KENENISA OS Analytics Engine**.

---

## 1. Execution Metrics

### Completion Rate
- **Definition**: Percentage of eligible tasks completed within the requested period.
- **Formula**: `(completedTasks / (totalTasks - cancelledTasks)) * 100`
- **Included Statuses**: `DONE` (numerator & denominator); `BACKLOG`, `READY`, `IN_PROGRESS`, `BLOCKED`, `REVIEW` (denominator).
- **Excluded Statuses**: `CANCELLED` (excluded from denominator to avoid penalizing intentionally dropped tasks).
- **Null Behavior**: Returns `null` when eligible tasks equal `0`.

### Estimated vs Actual Task Minutes
- **Definition**: Comparison of task effort estimates against logged actual minutes.
- **Formulas**:
  - `estimatedMinutes` = `SUM(Task.estimateMinutes)`
  - `actualMinutes` = `SUM(Task.actualMinutes)`
  - `completedEstimatedMinutes` = `SUM(Task.estimateMinutes)` where `Task.status == 'DONE'`

---

## 2. Planning & Capacity Metrics

### Scheduled vs Planned Task Minutes
- **Task Estimate**: Pre-execution estimated time required to complete a task.
- **Scheduled Time Block Minutes**: Sum of `TimeBlock.durationMinutes` scheduled on daily plans.
- **Taskless Planned Minutes**: Time blocks scheduled without an associated task (e.g. routine work, overhead).
- **Formula**: `tasklessPlannedMinutes = totalScheduledMinutes - taskPlannedMinutes`

### Capacity Utilization Percentage
- **Definition**: Percentage of available capacity consumed by planned time blocks.
- **Formula**: `(totalPlannedMinutes / totalAvailableMinutes) * 100`
- **Total Available Minutes**: `daysPlanned * UserSettings.dailyCapacityMinutes` (default 480 mins / 8 hrs per day).
- **Null Behavior**: Returns `null` when available capacity is 0.
- **Over-Capacity Days**: Days where `SUM(TimeBlock.durationMinutes) > DailyPlan.capacityMinutes`.

---

## 3. Project & Goal Metrics

### Project Completion Percentage
- **Formula**: `(completedTasks / (totalTasks - cancelledTasks)) * 100`
- **Null Behavior**: Returns `null` when project has no eligible tasks.

### Goal Progress Percentage
- **Formula**: `(completedChildTasks / totalChildTasks) * 100`
- **Aggregated Across**: All child projects linked to the goal.

---

## 4. Timezone & Boundary Handling
- All timestamps in PostgreSQL are stored in UTC (`ISO-8601`).
- Date ranges (`from`, `to`) are converted to `00:00:00.000Z` and `23:59:59.999Z` boundaries.
- Week start defaults to `UserSettings.weekStartsOn` (Monday by default).
