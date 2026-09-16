# Architecture Decision Records

## KENENISA OS — ADR Index

Architecture Decision Records (ADRs) document significant architectural decisions made during the development of KENENISA OS.

Each ADR captures:

- The context and forces that led to the decision
- The decision itself
- The rationale
- The consequences

---

## Index

| [0001](./0001-monorepo.md) | Use a Monorepo | Accepted |
| [0002](./0002-modular-monolith.md) | Modular Monolith Architecture | Accepted |
| [0003](./0003-rest-api.md) | REST API Versioning (`/api/v1`) | Accepted |
| [0004](./0004-postgresql-prisma.md) | PostgreSQL & Prisma ORM as Source of Truth | Accepted |
| [0005](./0005-api-versioning.md) | API Versioning Standard | Accepted |
| [0006](./0006-validation-with-zod.md) | Validation with Zod Schemas | Accepted |
| [0007](./0007-authentication-strategy.md) | Argon2id & SHA-256 Session Hashing Auth | Accepted |
| [0008](./0008-product-evolution-loop.md) | Continuous Product Evolution Loop | Accepted |

---

## Format

ADRs follow the [MADR format](https://adr.github.io/madr/) (Markdown Architectural Decision Records).

New ADRs should be numbered sequentially and placed in this directory.
