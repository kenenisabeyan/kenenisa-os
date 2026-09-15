# Repositories Layer

This directory contains repository classes that encapsulate database access logic using Prisma client.

## Pattern

- Repositories perform CRUD and complex DB queries.
- Controllers and Services interact with Repositories rather than calling Prisma directly in route handlers.
- Example (Future): `UserRepository`, `AcademicRepository`, `TaskRepository`.
