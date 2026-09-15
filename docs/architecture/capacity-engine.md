# KENENISA OS — Capacity Engine & Planning Architecture

## Overview
The Planning & Capacity Engine converts strategic goals and executable tasks into time-bound execution allocations. It manages Daily Plans, Time Blocks, Weekly Plans, Capacity calculations, and Overlap Conflict Detection.

---

## 1. Schedule Conflict Detection Algorithm

Two time blocks $A$ and $B$ belong to the same user overlap if and only if:

$$A.\text{startAt} < B.\text{endAt} \quad \land \quad A.\text{endAt} > B.\text{startAt}$$

### Adjacent Blocks
If Block A ends exactly when Block B starts ($A.\text{endAt} = B.\text{startAt}$), they do **NOT** overlap and are allowed.

### Server-Side Conflict Rejection
When a client submits an overlapping TimeBlock via `POST` or `PATCH`, the backend rejects the mutation with an HTTP 400 response and error code `TIME_BLOCK_CONFLICT`. Overlapping blocks are never silently created or auto-shifted.

---

## 2. Capacity Calculation Formulas

The Capacity Engine derives factual utilization from user configuration (`UserSettings`) and persisted `TimeBlock` durations.

$$\text{plannedMinutes} = \sum_{\text{block} \in \text{TimeBlocks}} \max\left(0, \frac{\text{block.endAt} - \text{block.startAt}}{60,000}\right)$$

$$\text{remainingMinutes} = \text{capacityMinutes} - \text{plannedMinutes}$$

$$\text{utilizationPercent} = \begin{cases} 
\text{Math.round}\left(\frac{\text{plannedMinutes}}{\text{capacityMinutes}} \times 100\right) & \text{if } \text{capacityMinutes} > 0 \\ 
\text{null} & \text{if } \text{capacityMinutes} = 0 
\end{cases}$$

$$\text{overCapacity} = \text{plannedMinutes} > \text{capacityMinutes}$$

---

## 3. Planning vs Execution Separation

- **Task Estimate** ($\text{estimateMinutes}$): Expected effort defined on the Task.
- **Time Block** ($\text{durationMinutes}$): Intentionally scheduled time allocation.
- **Task Actual** ($\text{actualMinutes}$): Recorded actual execution effort.

Creating, updating, or deleting a `TimeBlock` does **NOT** alter `Task.status` or `Task.actualMinutes`. Planning time is maintained independently from execution tracking.

---

## 4. Timezone & Date Boundary Policy

- Timestamps are stored in PostgreSQL as UTC ISO dates (`startAt`, `endAt`).
- Daily boundaries (`startUtc`, `endUtc`) are constructed using UTC midnight bounds (`Date.UTC(year, month - 1, day, 0, 0, 0, 0)` to `23:59:59.999`) to prevent timezone offset boundary drift.
- Weekly boundaries calculate `weekStart` and `weekEnd` relative to user preference (`UserSettings.weekStartsOn`: 1 = Monday, 0 = Sunday).
