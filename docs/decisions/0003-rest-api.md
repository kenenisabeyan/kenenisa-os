# ADR 0003: REST API with Standard JSON Envelopes

## Status

Accepted

## Context

We require a predictable, self-documenting API contract between `apps/web` and `apps/api`.

## Decision

Use HTTP REST API with explicit JSON envelopes (`ApiResponse<T>`, `ApiErrorResponse`). Every endpoint response includes standard metadata (`requestId`, `timestamp`, `path`).

## Consequences

- **Positive:** Uniform client handling, clear error contract (`ApiErrorResponse`), easy integration testing with Supertest.
- **Negative:** Slightly higher response size due to standard wrapper envelope.
