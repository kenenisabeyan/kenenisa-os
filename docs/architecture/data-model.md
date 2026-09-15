# Data Model & Conceptual ERD — KENENISA OS

This document details the core execution, planning, review, and audit entities established in Step 2.

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o| UserSettings : "configures"
    User ||--o{ Workstream : "owns"
    User ||--o{ Goal : "owns"
    User ||--o{ Project : "owns"
    User ||--o{ Milestone : "owns"
    User ||--o{ Task : "owns"
    User ||--o{ Tag : "owns"
    User ||--o{ DailyPlan : "owns"
    User ||--o{ TimeBlock : "owns"
    User ||--o{ WeeklyPlan : "owns"
    User ||--o{ WeeklyReview : "owns"
    User ||--o{ AuditLog : "records"

    Workstream ||--o{ Goal : "contains"
    Workstream ||--o{ Project : "contains"

    Goal ||--o{ Project : "guides"

    Project ||--o{ Milestone : "structures"
    Project ||--o{ Task : "contains"

    Milestone ||--o{ Task : "groups"

    Task ||--o{ Task : "subtasks"
    Task ||--o{ TaskDependency : "blocking"
    Task ||--o{ TaskDependency : "dependent"
    Task ||--o{ TaskTag : "tagged"
    Task ||--o{ TimeBlock : "scheduled"

    Tag ||--o{ TaskTag : "applies"

    DailyPlan ||--o| Task : "mustWin"
    DailyPlan ||--o{ TimeBlock : "allocates"

    WeeklyPlan ||--o{ WeeklyReview : "evaluated_by"
```

---

## Core Schema Models

### 1. Identity & Configuration

- **`User`**: System identity (`id`, `email`, `passwordHash`, `role`, `isActive`).
- **`UserSettings`**: Personal preferences (`timezone`, `weekStartsOn`, `dailyWorkCapacityMinutes`, `weeklyWorkCapacityMinutes`).

### 2. Core Execution Hierarchy

- **`Workstream`**: Top-level strategic area (e.g. _ASTU / Graduation_, _Full-Stack Engineering_).
- **`Goal`**: Outcome-oriented target belonging to a Workstream.
- **`Project`**: Discrete project belonging to a Workstream (and optionally a Goal).
- **`Milestone`**: Sequential phase inside a Project.
- **`Task`**: Primary unit of execution (`BACKLOG`, `READY`, `IN_PROGRESS`, `BLOCKED`, `REVIEW`, `DONE`, `CANCELLED`).
- **`TaskDependency`**: Explicit dependency graph connecting blocking and dependent tasks.
- **`Tag` & `TaskTag`**: Flexible tagging model for cross-cutting categorizations.

### 3. Planning & Reflection

- **`DailyPlan`**: Single plan per user per day with optional `mustWinTaskId`.
- **`TimeBlock`**: Focused work period linked to a `DailyPlan` and/or `Task`.
- **`WeeklyPlan`**: Weekly execution strategy (`weekStart`, `weekEnd`, `theme`).
- **`WeeklyReview`**: Reflection on weekly execution (`wins`, `challenges`, `lessons`, `nextFocus`).

### 4. Traceability

- **`AuditLog`**: Audit trail for state transitions (`entityType`, `entityId`, `action`, `metadata`).
