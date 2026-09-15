# ADR 0006: Validation Baseline with Zod

## Status

Accepted

## Context

Data validation must be strict, type-safe, and shared between frontend and backend.

## Decision

Use Zod for runtime schema validation. Requests are validated via Express middleware (`validate`), returning `422 Unprocessable Entity` with structured field errors on failure.

## Consequences

- **Positive:** Type inference directly produces TypeScript types, eliminating duplicate interface definitions.
- **Negative:** Schema validation adds minor runtime CPU overhead.
