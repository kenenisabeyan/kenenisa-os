# ADR 0004: PostgreSQL & Prisma ORM Data Access

## Status

Accepted

## Context

KENENISA OS requires a relational database for complex relational data (ASTU courses, deliverables, task dependencies, evidence).

## Decision

Use PostgreSQL with Prisma ORM. Repositories in `apps/api/src/repositories` wrap Prisma client operations.

## Consequences

- **Positive:** Type-safe SQL queries, automated migrations, declarative schema definition.
- **Negative:** Schema migrations require careful planning in production environments.
