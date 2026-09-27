# KENENISA OS — Automatic Outcome Tracking & Aggregation Architecture

ID: `TRK-001`  
Status: `APPROVED`

## Overview

Automatic Outcome Tracking enables KENENISA OS to evaluate planned items objectively using authoritative domain records (Tasks, TimeBlocks, TaskDependencies, and Evidence) without manual status toggling or subjective productivity scoring.

---

## 1. Automatic Outcome Evaluation Engine (`TRK-002`)

The `OutcomeTrackingService` enforces deterministic rules when evaluating a `PlanOutcome`:

### Rule 1: User Override Priority
- If `userOverride === true`, the system respects the user-confirmed `state`, `actualResult`, and `verificationState`.
- Automatic evaluation will NOT overwrite user-confirmed entries.

### Rule 2: Single Linked Task Evaluation
- If linked to `taskId`:
  - `Task.status === 'DONE'` $\rightarrow$ `COMPLETED`
  - `Task.status === 'IN_PROGRESS'` $\rightarrow$ `IN_PROGRESS`
  - `Task.status === 'CANCELLED'` $\rightarrow$ `CANCELLED`
  - `Task.status === 'BLOCKED'` or unresolved dependencies present $\rightarrow$ `BLOCKED`

### Rule 3: Multi-Task / Subtask Evaluation
- If linked to multiple tasks or subtasks:
  - $100\%$ completed $\rightarrow$ `COMPLETED`
  - $>0\%$ and $<100\%$ completed $\rightarrow$ `PARTIALLY_COMPLETED`
  - $0\%$ completed and scheduled window active $\rightarrow$ `PLANNED` / `IN_PROGRESS`

### Rule 4: Expiration & Missed Detection
- If scheduled end date/time has passed AND state remains unresolved (`PLANNED` / `IN_PROGRESS`) AND no tasks completed:
  - Derived State $\rightarrow$ `MISSED`
  - Derived Verification $\rightarrow$ `OBSERVED` (System observed schedule expiration; non-judgmental).

### Rule 5: Missing Telemetry
- If no linked task, time block, or subtask exists:
  - Derived State $\rightarrow$ `UNKNOWN`
  - Prevents system guessing or inventing progress.

---

## 2. Multi-Horizon Aggregation Rules (`TRK-003`)

Aggregation flows upward through planning horizons deterministically:

$$\text{Daily Execution} \longrightarrow \text{Weekly Commitments} \longrightarrow \text{Monthly Outcomes} \longrightarrow \text{Yearly Direction}$$

### Aggregation Pipeline
1. **Daily Aggregation**: Summarizes completed vs missed/partial daily outcomes and actual vs scheduled time block minutes into `DailyPlan.summary`.
2. **Weekly Aggregation**: Aggregates daily plan snapshots into `WeeklyPlan` results and seeds `WeeklyReview` factual context.
3. **Monthly Aggregation**: Aggregates weekly plan outcomes into `MonthPlan.actualOutcomes`.
4. **Yearly Aggregation**: Summarizes monthly outcomes into `YearPlan.actualOutcomes` grouped by Workstreams and Goals.

---

## 3. Evidence Connection & Auditing

Outcomes link to artifacts in the KENENISA OS `Evidence` table via `PlanOutcomeEvidence`:
- Link types: `TASK`, `PROJECT`, `COMMIT`, `TEST_RESULT`, `DOCUMENT`, `MILESTONE`, `DEPLOYMENT`, `MANUAL`.
- Verification transition: Attaching verified evidence upgrades `verificationState` from `OBSERVED` to `VERIFIED`.

---

## 4. Timezone & Boundary Handling

- All timestamps stored in **UTC** (`ISO-8601`).
- Date boundaries (`weekStart`, `date`, `startDate`, `endDate`) calculated using configured user timezone offset.
- Midnight boundaries trigger non-destructive daily period snapshots.
