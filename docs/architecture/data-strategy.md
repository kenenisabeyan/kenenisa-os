# Data Strategy — KENENISA OS

## Relational Storage

- PostgreSQL primary database for transactional and domain entities.
- Prisma ORM schema definition (`prisma/schema.prisma`).

## Data Lifecycle & Auditing

- Soft delete (`deletedAt` timestamp) for critical entities (academic grades, project deliverables, milestones).
- Standard audit timestamps (`createdAt`, `updatedAt`) across all models.
- Immutable evidence logs for task evidence attachments and review notes.
