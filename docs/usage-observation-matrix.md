# KENENISA OS — Usage Observation Matrix

**Project**: KENENISA OS — Personal 5th-Year Engineering & Career Operating System  
**Document Identifier**: `v1.0.0-usage-matrix`  
**Date**: `2026-09-16`  
**Status**: `ACTIVE USAGE MATRIX`  

---

## 1. Domain Usage & Value Matrix

This matrix documents the expected versus actual usage state across system domains based on verifiable telemetry, automated test suite verification, and live operating workflows.

### Usage State Legend:
`USED` | `PARTIALLY_USED` | `RARELY_USED` | `NOT_USED` | `UNKNOWN`

---

| ID | Domain | Primary Workflow | Expected Use | Actual Use State | Evidence Source | Observed Friction | Measurable Value Produced | Strategic Product Decision |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **`UOM-001`** | **Authentication** | Login, Session Management, Logout | Daily login & session preservation | `USED` | `PRODUCTION_OBSERVED` | None | Secure Argon2id password hashing + HTTP-Only cookie protection | **`KEEP`** (`PDR-001`) |
| **`UOM-002`** | **Workstreams** | Strategic Domain Partitioning | Top-level 7 core workstreams | `USED` | `DEVELOPMENT_OBSERVED` | None | Clear separation between ASTU, Engineering, EDOT, etc. | **`KEEP`** |
| **`UOM-003`** | **Goals** | Strategic Target Setting | Workstream goal setting & progress tracking | `USED` | `DEVELOPMENT_OBSERVED` | None | Alignment between long-term targets and actionable projects | **`KEEP`** |
| **`UOM-004`** | **Projects** | Project Workspace & Milestones | Engineering & academic project delivery | `USED` | `DEVELOPMENT_OBSERVED` | None | Milestone completion metrics & project health scoring | **`KEEP`** |
| **`UOM-005`** | **Tasks & Subtasks**| Task Execution & DAG Dependencies | Daily task execution & blocking tasks | `USED` | `AUTOMATED_TEST` | Task creation metadata overhead (Calibrated in `WF-002`) | Eliminates circular dependencies & enforces task priority | **`KEEP`** |
| **`UOM-006`** | **Command Center** | Operational Entry Point & NBA | Daily start of day & NBA inspection | `USED` | `DEVELOPMENT_OBSERVED` | Score breakdown was previously hidden (Calibrated in `WF-004`) | Deterministic Next Best Action scoring (100-point algorithm) | **`KEEP`** (`PDR-003`) |
| **`UOM-007`** | **Planning & Capacity**| Time Blocking & Schedule Commitments| Daily time-blocking & 480m capacity check | `USED` | `DEVELOPMENT_OBSERVED` | Excessive clicks to schedule task (Calibrated in `WF-001`) | Prevents over-commitments and capacity overload | **`KEEP`** |
| **`UOM-008`** | **Learning & Skills** | Course/Paper Track & Skill Levels | Technical skill acquisition & activity log | `USED` | `DEVELOPMENT_OBSERVED` | 3 clicks to attach proof (Calibrated in `WF-003`) | Quantifiable skill progression (Beginner -> Expert) | **`KEEP`** |
| **`UOM-009`** | **Evidence Engine** | Proof Artifact Capture & Verification | Proof-of-work linkers for tasks & projects | `USED` | `DEVELOPMENT_OBSERVED` | None | Verifiable proof trail for career & academic portfolio | **`KEEP`** |
| **`UOM-010`** | **Weekly Reviews** | Retrospective Reflection Loop | Sunday review, velocity, wins & lessons | `USED` | `DEVELOPMENT_OBSERVED` | Manual typing of task titles (Calibrated in `WF-007`) | Factual retrospective analysis & planned vs actual velocity | **`KEEP`** |
| **`UOM-011`** | **Analytics Engine**| Personal Operating Intelligence | Weekly completion ratios & capacity trends | `USED` | `AUTOMATED_TEST` | Multi-period analytics query bounds (Tracked in `PE-007`) | Timezone-aware factual metrics without fake productivity scores | **`IMPROVE`** (`NOW-03`) |
| **`UOM-012`** | **Opportunities** | Career Pipeline Management | Job applications & interview preparation | `USED` | `DEVELOPMENT_OBSERVED` | Tags lost on drag in UI (Calibrated in `WF-005`) | Direct linkage between job requirements and portfolio evidence | **`KEEP`** |
| **`UOM-013`** | **Intelligence Core**| AI Reasoning & Advisory Tooling | Operational questions & context queries | `USED` | `AUTOMATED_TEST` | Context size overhead (Tracked in `PE-009`) | AI advisory grounded in application state with 2-phase confirm | **`KEEP`** (`PDR-004`) |
| **`UOM-014`** | **Monitoring / Probes**| Health Probes & Structured Logs | Operational health checks (`/health`, `/ready`) | `USED` | `SYSTEM_LOG` | None | Pino request correlation (`requestId`) & DB connectivity check | **`KEEP`** |
| **`UOM-015`** | **PDF Evidence Export**| PDF Retrospective Export | Automated PDF report export | `NOT_USED` | `UNKNOWN` | Feature not yet built | Categorized in `NEXT-01` roadmap tier | **`DEFER`** (`NEXT-01`) |

---

## 2. Summary of Observations & Domain Decisions

- **Active Implemented Domains**: 14 / 14 core operational domains are actively `USED` and producing verified value.
- **Unused / Deferred Features**: 1 feature (`PDF Evidence Export`) marked `NOT_USED` and correctly placed in `NEXT-01` roadmap.
- **Fake Productivity Scores**: 0 artificial scores (no "discipline scores", "XP", or "streaks"). All analytics are derived from database records.
