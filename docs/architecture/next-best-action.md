# KENENISA OS — Deterministic Next Best Action Architecture

## Overview
The Next Best Action Engine powers the Command Center by deterministically answering: **"What single task should I execute right now?"**

To ensure trust, predictability, and reproducibility, the engine relies on explicit mathematical scoring criteria rather than non-deterministic AI/LLM models or random heuristics.

---

## 1. Candidate Pool Eligibility
A task is eligible for recommendation if and only if it satisfies all of the following:
1. Belongs to the authenticated owner (`userId`).
2. Status is either `IN_PROGRESS` or `READY`.
3. Has **0 active/unsatisfied `BLOCKS` dependencies** (i.e. no blocking task in `READY`, `IN_PROGRESS`, `BLOCKED`, or `TODO`).

Tasks in `BLOCKED`, `DONE`, or `CANCELLED` status are strictly filtered out of the candidate pool.

---

## 2. Deterministic Scoring Algorithm (Max Score: 100)

Total score is computed across 5 transparent categories:

$$\text{Score} = S_{\text{priority}} + S_{\text{urgency}} + S_{\text{strategic}} + S_{\text{readiness}} + S_{\text{continuity}}$$

### A. Priority Weight ($S_{\text{priority}}$, Max 35)
* `URGENT`: +35 points
* `HIGH`: +25 points
* `MEDIUM`: +15 points
* `LOW`: +5 points

### B. Urgency / Due Date ($S_{\text{urgency}}$, Max 30)
* `Overdue` ($\text{dueDate} < \text{startOfToday}$): +30 points
* `Due Today` ($\text{startOfToday} \le \text{dueDate} \le \text{endOfToday}$): +25 points
* `Due Tomorrow` ($\text{dueDate} \le \text{endOfTomorrow}$): +15 points
* `Due within 7 days`: +10 points
* `No due date`: 0 points

### C. Strategic Goal Alignment ($S_{\text{strategic}}$, Max 20)
* Task linked to a Project that is linked to an Active Goal: +20 points
* Task linked to a Project without a Goal: +10 points
* Task without a Project: +0 points

### D. Dependency Readiness ($S_{\text{readiness}}$, Max 10)
* Candidate has 0 blocking dependencies: +10 points
* Candidate has dependencies but all are `DONE`: +5 points

### E. Execution Continuity ($S_{\text{continuity}}$, Max 5)
* Status is `IN_PROGRESS`: +5 points (reduces context-switching friction)
* Status is `READY`: 0 points

---

## 3. Strict Deterministic Tie-Breaking
When multiple candidate tasks achieve the exact same total score, ties are resolved using the following order:
1. `score` (Descending)
2. `dueDate` (Ascending — earlier due dates first; nulls last)
3. `priority` (Descending rank: URGENT > HIGH > MEDIUM > LOW)
4. `updatedAt` (Descending — recently touched first)
5. `id` (Ascending lexicographical comparison for 100% determinism)

---

## 4. Reason Generation
For every evaluated task, the engine generates clear human-readable explanations detailing why points were awarded, ensuring full transparency in the Command Center UI.
