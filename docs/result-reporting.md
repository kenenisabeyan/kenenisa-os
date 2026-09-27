# KENENISA OS — Result Dashboards & Filtering Specification

ID: `RES-002`  
Status: `APPROVED`

## Overview

The Results experience provides a dedicated dashboard in the KENENISA OS navigation for inspecting outcomes, filtering by horizon and status, viewing audit details, and accessing period summaries.

---

## 1. Dashboard Structure & Navigation

Navigation position:
```text
Command Center → Planning → Tasks → Projects → Learning → Evidence → Results → Reviews → Intelligence
```

### Dashboard Panels
1. **Horizon & Period Selector**: `Today`, `This Week`, `This Month`, `This Year`, `Custom Range`.
2. **Counter Stat Cards**: Real-time factual counts for Completed 🟢, Partial 🟡, Missed 🔴, Blocked 🟠, In Progress 🔵, Rescheduled ↪, Cancelled ⚫, Unknown ⚪.
3. **Actionable Advance Recommendations**: Step-by-step next steps integrated with the Next Best Action engine.
4. **Intelligence Core Advisory**: Non-judgmental system summary based on empirical telemetries.
5. **Excel Workspace**: Interactive in-app spreadsheet view.

---

## 2. Filtering & Search Parameters

The API endpoint `/api/v1/results` supports server-side indexed filters:
- `horizon`: `YEARLY`, `MONTHLY`, `WEEKLY`, `DAILY`.
- `status`: `COMPLETED`, `PARTIALLY_COMPLETED`, `MISSED`, `BLOCKED`, `IN_PROGRESS`, `RESCHEDULED`, `CANCELLED`, `UNKNOWN`.
- `source`: `AUTOMATIC`, `USER_CONFIRMED`, `SYSTEM_VERIFIED`, `UNKNOWN`.
- `workstreamId`, `projectId`, `fromDate`, `toDate`, `search`.
