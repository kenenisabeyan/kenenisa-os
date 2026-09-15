# ADR 0002: Modular Monolith Architecture

## Status

Accepted

## Context

KENENISA OS is a personal 5th-Year Engineering & Career Operating System managing ASTU coursework, final projects, full-stack engineering, AI learning, EDOT SaaS, freelancing, and personal analytics. We need an architecture that avoids microservices complexity while maintaining clean domain boundaries and testability.

## Decision

Adopt a Modular Monolith architectural pattern inside an npm monorepo (`apps/api`, `apps/web`, `packages/shared`). Each domain module (e.g. `academic`, `projects`, `tasks`) resides in isolated modules with clear boundaries.

## Consequences

- **Positive:** Low operational complexity, simple single-process deployment, zero network latency between modules, shared TypeScript types across frontend and backend.
- **Negative:** Requires disciplined code organization to prevent cross-module leaks.
