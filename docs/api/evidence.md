# Evidence Vault REST API Specification

The Evidence API captures observable, tangible proof of engineering outputs, software deployments, git commits, technical documentation, and learning artifacts, establishing explicit links to tasks, projects, learning items, and skills.

---

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/evidence` | List evidence records with filtering (`type`, `search`, `projectId`, `taskId`, `learningItemId`, `skillId`) and pagination |
| `GET` | `/api/v1/evidence/:id` | Get evidence record details with linked tasks, projects, learning items, and skills |
| `POST` | `/api/v1/evidence` | Create a new evidence record |
| `PATCH` | `/api/v1/evidence/:id` | Update an existing evidence record |
| `DELETE` | `/api/v1/evidence/:id` | Delete an evidence record |
| `POST` | `/api/v1/evidence/:id/tasks` | Link a task to evidence |
| `DELETE` | `/api/v1/evidence/:id/tasks/:taskId` | Unlink a task from evidence |
| `POST` | `/api/v1/evidence/:id/projects` | Link a project to evidence |
| `DELETE` | `/api/v1/evidence/:id/projects/:projectId` | Unlink a project from evidence |
| `POST` | `/api/v1/evidence/:id/learning-items` | Link a learning item to evidence |
| `DELETE` | `/api/v1/evidence/:id/learning-items/:learningItemId` | Unlink a learning item from evidence |
| `POST` | `/api/v1/evidence/:id/skills` | Link a skill to evidence |
| `DELETE` | `/api/v1/evidence/:id/skills/:skillId` | Unlink a skill from evidence |

---

## Security & Scoping

- All routes require session cookie authentication via `requireAuth`.
- Single-owner isolation enforced via `req.auth!.userId`.
- Attaching cross-user entities returns `403 Forbidden`.
