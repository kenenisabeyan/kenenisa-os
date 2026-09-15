# Task Dependencies Architecture & Cycle Detection Algorithm

This document details the deterministic dependency execution engine in **KENENISA OS**.

---

## Strategic Hierarchy Alignment

```text
User ➔ Workstream ➔ Goal ➔ Project ➔ Milestone ➔ Task ➔ Subtask
                                                  │
                                          TaskDependency
                                                  │
                                            [BLOCKS edge]
                                                  │
                                                  ▼
                                            Readiness State
```

---

## Dependency Semantics

A task dependency establishes a **prerequisite relationship**:
- `Task A (blockingTaskId) BLOCKS Task B (dependentTaskId)`
- Task B **cannot** be marked as `IN_PROGRESS` or `READY` while Task A remains unfinished (`status !== 'DONE'`).
- Attempting to bypass this via `/start` or `PATCH` returns a `TASK_HAS_UNRESOLVED_DEPENDENCIES` domain error.

---

## Graph Cycle Detection Algorithm

The task dependency graph must remain a **Directed Acyclic Graph (DAG)**.

### Insertion Safety Check
Before creating an edge `blockingTaskId -> dependentTaskId`:

1. Traverse all outgoing dependency edges starting from `dependentTaskId` using Breadth-First Search (BFS) / Depth-First Search (DFS).
2. Collect the set of all reachable task IDs: $R(\text{dependentTaskId})$.
3. Check if $\text{blockingTaskId} \in R(\text{dependentTaskId})$.
4. If `blockingTaskId` is reachable, inserting the new edge would form a closed path $\text{blockingTaskId} \to \text{dependentTaskId} \to \dots \to \text{blockingTaskId}$.
5. Reject transaction with error `DEPENDENCY_CYCLE_DETECTED`.

```mermaid
graph TD
    A["Task A (Database Schema)"] -->|BLOCKS| B["Task B (API Endpoint)"]
    B -->|BLOCKS| C["Task C (Frontend UI)"]
    C -. Attempted Edge .->|REJECTED CYCLE| A
```

---

## Auto-Unblocking Readiness Transition

When `Task A` transitions to `DONE`:
1. Find all `dependentDependencies` where `blockingTaskId === Task A.id`.
2. For each dependent task `Task B`:
   - Calculate count of remaining unsatisfied blockers ($\text{status} \neq \text{'DONE'}$).
   - If `unsatisfiedBlockers === 0` and `Task B.status === 'BLOCKED'`, automatically transition `Task B.status` to `READY`.
