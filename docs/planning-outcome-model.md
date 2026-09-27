# KENENISA OS — Planning Outcome Model & Factual State Architecture

ID: `OUT-001`  
Status: `APPROVED`

## Overview

The Planning Outcome Model defines how expected results across all four planning horizons (**Yearly**, **Monthly**, **Weekly**, **Daily**) map to factual, evidence-backed outcome states.

---

## 1. Outcome States Specification (`OUT-002`)

The system rejects simplistic binary (`DONE` / `NOT DONE`) flags. Instead, outcomes exist in one of nine explicit, objective states:

| Outcome State | Description | Derivation Rule |
| :--- | :--- | :--- |
| `PLANNED` | Activity scheduled/committed for future execution. | Default state upon outcome creation. |
| `IN_PROGRESS` | Activity has actively linked execution underway. | Associated tasks/timeblocks actively marked `IN_PROGRESS`. |
| `COMPLETED` | Objective fully achieved with verifiable backing. | 100% linked tasks marked `DONE` OR user confirmed. |
| `PARTIALLY_COMPLETED` | Objective partially achieved. | >0% and <100% linked tasks completed. |
| `MISSED` | Schedule window expired without completion evidence. | End timestamp passed, tasks unfulfilled, no user override. |
| `CANCELLED` | User explicitly dropped or withdrew the objective. | Explicit user action with auditable reason. |
| `RESCHEDULED` | Activity moved to a future planning window. | Scheduled window updated with historic snapshot retained. |
| `BLOCKED` | Dependent task or external blocker prevents execution. | Open `TaskDependency` remains unresolved. |
| `UNKNOWN` | System lacks sufficient telemetry to evaluate status. | No linked tasks or timeblocks available for evaluation. |

---

## 2. Verification States (`OUT-003`)

Every outcome is paired with an explicit `OutcomeVerificationState`:

- `PLANNED`: Claimed expected result before execution window.
- `OBSERVED`: Automatically derived from authoritative task/timeblock telemetries.
- `VERIFIED`: User-confirmed or evidence-linked result (e.g., Git commit, document, submitted work).

---

## 3. Data Model Schema

```prisma
enum PlanOutcomeState {
  PLANNED
  IN_PROGRESS
  COMPLETED
  PARTIALLY_COMPLETED
  MISSED
  CANCELLED
  RESCHEDULED
  BLOCKED
  UNKNOWN
}

enum OutcomeVerificationState {
  PLANNED
  OBSERVED
  VERIFIED
}

model PlanOutcome {
  id                String                   @id @default(uuid())
  userId            String
  horizon           PlanHorizon
  title             String
  description       String?
  expectedResult    String
  actualResult      String?
  state             PlanOutcomeState         @default(PLANNED)
  verificationState OutcomeVerificationState @default(PLANNED)
  yearPlanId        String?
  monthPlanId       String?
  weeklyPlanId      String?
  dailyPlanId       String?
  taskId            String?
  timeBlockId       String?
  userOverride      Boolean                  @default(false)
  userNotes         String?
  createdAt         DateTime                 @default(now())
  updatedAt         DateTime                 @updatedAt
}
```

---

## 4. Immutable Historical Snapshots

When a planning window closes (e.g. at midnight for a DailyPlan or end of week for a WeeklyPlan), an immutable `PlanResultSnapshot` record is created. Subsequent changes to future tasks or rescheduled plans do NOT mutate past outcome snapshots.
