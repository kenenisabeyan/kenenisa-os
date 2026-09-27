# KENENISA OS — Result Insights & Pattern Detection Model

ID: `INS-001`  
Status: `APPROVED`

## Overview

The Result Insights Model generates non-judgmental execution observations, period comparisons, and pattern detections from empirical system telemetries.

---

## 1. Automatic Factual Observations

System observations describe observable telemetries without psychological or personal judgment:
- **Carry-Forward**: Activities carried into future planning periods due to incomplete status.
- **Dependency Blockers**: Outcomes prevented from progressing due to open upstream tasks.
- **Rescheduled Items**: Activities explicitly moved to a different schedule window.
- **Schedule Expirations**: Scheduled windows that expired without recorded completion proof.

---

## 2. Pattern Detection Rules

Patterns require a minimum empirical threshold before being reported:

| Pattern Category | Minimum Evidence Threshold | Description |
| :--- | :--- | :--- |
| `RESCHEDULE_RECURRENCE` | $\ge 2$ reschedules on same outcome | Planned activity repeatedly moved to future windows. |
| `BLOCKER_RECURRENCE` | $\ge 2$ tasks blocked by same dependency | System bottleneck caused by single blocking task. |
| `WEEKDAY_CONCENTRATION` | $\ge 3$ unresolved items on specific day | Elevated missed/incomplete rate on specific weekday. |
| `CAPACITY_OVERLOAD` | Scheduled minutes $>$ Capacity minutes | Time blocks exceed configured daily capacity. |

---

## 3. Period-Over-Period Comparisons

Factual metric changes between periods (e.g., Current Week vs. Previous Week):
- `completed`: count change tagged as `increased`, `decreased`, or `unchanged`.
- `missed`: count change tagged as `increased`, `decreased`, or `unchanged`.
- `blocked`: count change tagged as `increased`, `decreased`, or `unchanged`.
- **Zero Grade Policy**: System rejects productivity grades, discipline scores, or personality ratings.
