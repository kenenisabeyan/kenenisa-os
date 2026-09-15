# KENENISA OS — Opportunities & Career Execution Engine

The **Opportunities Engine** connects the user's strategic goals, projects, skills, learning, and observable evidence to real professional possibilities (freelance contracts, full-time/part-time engineering roles, internships, research collaborations, client deliveries, etc.).

---

## 1. Domain Philosophy

- **Execution System**: KENENISA OS tracks, prepares, and structures professional opportunities. It does not send automated applications or scrape third-party job boards.
- **Source of Truth for Actionable Work**: Actionable work required for an opportunity is represented as standard `Task` items. Tasks are linked to opportunities rather than duplicating task logic.
- **Single-Owner Isolation**: Every Opportunity and linked entity is strictly scoped to `req.auth.userId`. Cross-user relationships are rejected.

---

## 2. Opportunity Lifecycle States

```text
DISCOVERED
    │
    ├──► EVALUATING ──► ARCHIVED / EXPIRED
    │
    ├──► PREPARING
    │       │
    │       ▼
    └────► APPLIED ──► REJECTED / WITHDRAWN / EXPIRED
            │
            ▼
       IN_DISCUSSION
            │
            ▼
        INTERVIEW
            │
            ▼
         OFFERED ──► REJECTED / WITHDRAWN
            │
            ▼
         ACCEPTED
            │
            ▼
          ACTIVE
            │
            ▼
        COMPLETED
```

### Terminal States
- `COMPLETED`, `REJECTED`, `WITHDRAWN`, `EXPIRED`, `ARCHIVED` set `closedAt` timestamp upon transition.

---

## 3. Entity Relationships

- **`OpportunitySkill`**: Explicit join table connecting an opportunity to required or relevant skills (`PRIMARY` / `SECONDARY`).
- **`OpportunityProject`**: Links an opportunity to a portfolio/execution project.
- **`OpportunityEvidence`**: Links an opportunity to proof of capability (GitHub repo, deployed site, certificate, research paper, etc.).
- **`OpportunityTask`**: Connects actionable preparation/application tasks to the opportunity.
- **`OpportunityActivity`**: User-visible professional timeline log for notes, contacts, interviews, follow-ups, and status changes.

---

## 4. Follow-ups & Deadlines

- `followUpDate`: Filtered into `overdue`, `today`, and `upcoming` lists.
- `deadline`: Filtered into `overdue`, `today`, `next7Days`, and `next30Days` lists.
- Boundary calculations respect `UserSettings.timezone`.
