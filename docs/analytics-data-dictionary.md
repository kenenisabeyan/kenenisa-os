# KENENISA OS — Analytics Data Dictionary

This document maps PostgreSQL source entities and attributes to derived analytics metrics.

---

## 1. Source Entity Mapping

### `Task`
- `status` → `totalTasks`, `completedTasks`, `blockedTasks`, `readyTasks`, `inProgressTasks`, `reviewTasks`, `cancelledTasks`.
- `estimateMinutes` → `estimatedMinutes`, `completedEstimatedMinutes`.
- `actualMinutes` → `actualMinutes`.
- `dueDate` → `currentOverdueTasks`, `overdueCreatedDuringPeriod`.
- `createdAt` / `completedAt` → `executionTrend`, `overdueCompletedDuringPeriod`.

### `DailyPlan` & `TimeBlock`
- `DailyPlan.date` → `daysPlanned`, `daysWithCompletedPlans`.
- `DailyPlan.capacityMinutes` → `overCapacityDays`.
- `TimeBlock.durationMinutes` → `plannedMinutes`, `scheduledMinutes`.
- `TimeBlock.taskId` → `plannedTaskMinutes` vs `tasklessPlannedMinutes`.

### `Project`
- `Project.status` → `activeProjects`, `completedProjects`, `totalProjects`.
- `Project.workstreamId` → `workstreamAnalytics`.
- `Project.goalId` → `goalAnalytics`.

### `Goal`
- `Goal.status` → `inProgressGoals`, `achievedGoals`.
- `Goal.targetDate` → `goalAnalytics`.

### `Workstream`
- `Workstream.priorityWeight` → `workstreamAnalytics` (planning priority attribute).

### `LearningItem` & `LearningActivity`
- `LearningItem.status` → `learningItemsTotal`, `learningItemsCompleted`, `learningItemsInProgress`, `learningItemsPaused`.
- `LearningActivity.minutes` → `learningMinutes`.
- `LearningActivity.date` → `learningActivityDays`, `learningTrend`.

### `Skill`
- `Skill.currentLevel` / `targetLevel` → `skillAnalytics`.
- `Skill.learningItems` / `Skill.projects` / `Skill.evidenceLinks` → `linkedLearningItems`, `linkedProjects`, `linkedEvidence`.

### `Evidence`
- `Evidence.type` → `evidenceByType`.
- `Evidence.verified` → `evidenceVerified`, `evidenceUnverified`.
- `Evidence.date` → `evidenceCreated`, `evidenceTrend`.

### `WeeklyReview`
- `WeeklyReview.status` → `reviewsCreated`, `reviewsCompleted`, `reviewsDraft`.
