# ADR 0001 — Use a Monorepo

**Date:** 2026-09-15
**Status:** Accepted

---

## Context

KENENISA OS consists of multiple related packages that will evolve together:

- A React frontend (`apps/web`)
- An Express REST API (`apps/api`)
- Shared TypeScript types and constants (`packages/shared`)

The system will expand to potentially include more apps (e.g., a mobile app, a CLI tool) and more shared packages (e.g., validation schemas, utility libraries) over time.

The core challenge is managing these packages without unnecessary friction — shared types must stay in sync, refactoring must be safe across boundaries, and the development workflow must remain simple.

---

## Decision

Use a **monorepo** managed with **npm workspaces**.

All packages live in a single Git repository under a consistent directory structure.

---

## Rationale

### Code sharing without publishing

Shared types (`@kenenisa-os/shared`) can be imported directly across packages without publishing to a registry. TypeScript project references ensure type-checking is correct across boundaries.

### Atomic commits across boundaries

A change that modifies a shared type and updates all consumers can be committed in a single Git commit, making history coherent and bisection meaningful.

### Consistent tooling

ESLint, Prettier, TypeScript, and testing configuration can be defined once at the root and shared or extended by each workspace. There is no risk of configuration drift between repositories.

### Simplified dependency management

`npm install` at the root installs all workspace dependencies. Hoisting avoids duplicate installs while workspace protocol links ensure correct resolution.

### No operational overhead of a package registry

The shared package does not need to be published to npm. This avoids versioning ceremony for internal-only code.

---

## Consequences

### Positive

- Single `git clone`, single `npm install`, single CI pipeline.
- TypeScript type errors across package boundaries are caught locally.
- Refactoring across `apps/` and `packages/` is safe and fast.
- Documentation, decisions, and tests have a single home.

### Negative / Trade-offs

- The repository will grow over time — requires discipline in keeping `packages/` lean and purpose-driven.
- npm workspaces hoisting can occasionally cause resolution issues; these are well-understood and manageable.
- If packages ever need to be independently published or deployed, additional tooling (e.g., Turborepo, Changesets) may be introduced.

---

## Alternatives Considered

### Polyrepo (multiple separate repositories)

Rejected. Sharing types across repos requires publishing to a registry and versioning every internal change. This adds significant overhead for a system maintained by a single developer.

### Turborepo / Nx

Considered. Both are excellent build orchestration tools for monorepos. Rejected at this stage because npm workspaces is sufficient for the current scale. If build times or task orchestration become a concern, Turborepo can be added incrementally without restructuring the repository.

### Lerna

Rejected. Lerna is primarily a package publishing tool. The use case here is not publishing — it is development coordination.
