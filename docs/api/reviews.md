# Weekly Reviews REST API Specification

The Weekly Reviews API powers the engineering feedback loop by enabling structured weekly reflections (`wins`, `challenges`, `lessons`, `nextFocus`) paired with deterministic, read-only factual system summaries.

---

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/reviews/weekly` | List weekly review history for authenticated owner |
| `GET` | `/api/v1/reviews/weekly/context` | Read-only factual weekly summary aggregates (completed/blocked tasks, planned vs learning hours, evidence, active projects) |
| `GET` | `/api/v1/reviews/weekly/:id` | Get weekly review details |
| `POST` | `/api/v1/reviews/weekly` | Create a new weekly review |
| `PATCH` | `/api/v1/reviews/weekly/:id` | Update weekly review entries |
| `POST` | `/api/v1/reviews/weekly/:id/complete` | Mark weekly review as `COMPLETED` |
| `POST` | `/api/v1/reviews/weekly/:id/reopen` | Reopen completed weekly review back to `DRAFT` |

---

## Security & Scoping

- All routes require session cookie authentication via `requireAuth`.
- Factual context aggregates compute read-only system metrics without mutating execution data.
- Single-owner isolation enforced via `req.auth!.userId`.
