# Security Baseline — KENENISA OS

## HTTP Security Controls

- **Helmet:** Enforces CSP, HSTS, X-Content-Type-Options, Frameguard (clickjacking mitigation).
- **Rate Limiting:** IP rate limiter restricts incoming requests to 100 requests / 15 minutes window on `/api`.
- **CORS:** Strict origin checking against `CORS_ORIGIN` env variable.
- **Request Tracing:** `X-Request-ID` attached to all incoming and outgoing requests for auditing.
- **Validation:** Every input payload is validated via Zod schemas before hitting business logic.
