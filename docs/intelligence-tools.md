# Intelligence Core — Tool Catalog & Action Protocol

The Intelligence Core uses a controlled tool registry to inspect operating state and propose actions.

---

## Read Tools

| Tool Name | Description | Output |
| :--- | :--- | :--- |
| `get_current_state` | High-level summary of open tasks, active projects, active opportunities | Counts of open tasks, projects, opportunities |
| `get_blocked_tasks` | Retrieves all BLOCKED tasks for the authenticated user | List of blocked tasks with priority & project |

---

## Action Proposal Tools

Action proposal tools do **not** mutate the database directly. They return a proposal payload requiring explicit user confirmation.

| Tool Name | Action | Confirmation Required |
| :--- | :--- | :--- |
| `propose_create_task` | Proposes creating a new task with title and priority | **YES** |
| `propose_create_time_block` | Proposes scheduling a time block | **YES** |
| `propose_create_memory` | Proposes persisting a durable user memory | **YES** |
