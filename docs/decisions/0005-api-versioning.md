# ADR 0005: Explicit API Path Versioning (`/api/v1/`)

## Status

Accepted

## Context

Future iterations of KENENISA OS may require non-breaking and breaking API schema updates without disrupting active client sessions.

## Decision

All public API endpoints are prefixed with `/api/v1/`.

## Consequences

- **Positive:** Enables parallel support for legacy API versions during future major upgrades.
- **Negative:** Requires route version routing management in Express.
