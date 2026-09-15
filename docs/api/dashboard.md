# KENENISA OS — Command Center Dashboard API Reference

The Command Center API provides an aggregated, deterministic snapshot of the user's execution status, priority breakdown, active workstreams, active projects, blocked work, overdue tasks, and Next Best Action recommendation.

---

## Base Path
`/api/v1/dashboard`

Authentication required: **Cookie Session (`session_id`)** or **Bearer Header**. Single-tenant owner isolation is enforced on all endpoints.

---

## 1. Get Command Center Snapshot

### Request
`GET /api/v1/dashboard`

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `date` | `string` | No | Target ISO date (YYYY-MM-DD) for evaluation. Defaults to current date. |
| `timezone` | `string` | No | User's local IANA timezone (e.g. `UTC`, `Africa/Addis_Ababa`). |

---

### Response (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Command Center dashboard data retrieved successfully",
  "data": {
    "summary": {
      "activeWorkstreams": 4,
      "activeGoals": 10,
      "activeProjects": 8,
      "readyTasks": 15,
      "inProgressTasks": 3,
      "blockedTasks": 2,
      "overdueTasks": 1,
      "completedTasksRecent": 12
    },
    "nextBestAction": {
      "recommendedTask": {
        "id": "cm123456789",
        "title": "Complete Step 6 Next Best Action Unit Tests",
        "status": "READY",
        "priority": "URGENT",
        "estimateMinutes": 45,
        "dueDate": "2026-09-16T00:00:00.000Z",
        "project": {
          "id": "proj_1",
          "name": "KENENISA OS Core",
          "slug": "kenenisa-os-core"
        }
      },
      "score": 95,
      "reasons": [
        {
          "category": "PRIORITY",
          "points": 35,
          "description": "Urgent priority task (+35 points)"
        },
        {
          "category": "URGENCY",
          "points": 30,
          "description": "Task due today (+30 points)"
        },
        {
          "category": "READINESS",
          "points": 10,
          "description": "0 unsatisfied blocking dependencies (+10 points)"
        }
      ],
      "candidatePoolCount": 18,
      "evaluatedAt": "2026-09-16T01:00:00.000Z"
    },
    "today": {
      "date": "2026-09-16",
      "dueToday": [],
      "inProgress": [],
      "ready": []
    },
    "workstreams": [],
    "activeProjects": [],
    "blockedTasks": [],
    "overdueTasks": [],
    "upcomingTasks": [],
    "recentActivity": []
  }
}
```

---

## Error Codes
* `401 Unauthorized`: Session cookie missing or invalid.
* `400 Bad Request`: Query parameters fail validation.
* `500 Internal Server Error`: Unexpected database query error.
