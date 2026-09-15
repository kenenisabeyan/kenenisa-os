# Backend Architecture — `apps/api`

## Tech Stack

- **Server:** Node.js + Express 4
- **Language:** TypeScript
- **Security:** Helmet, CORS, Express Rate Limit
- **Logging:** Pino + pino-pretty
- **Validation:** Zod
- **Testing:** Vitest + Supertest

## Request Lifecycle

```
Client Request
  │
  ▼
1. Helmet (Security headers)
2. Cors (CORS policy check)
3. RateLimit (IP rate limiting)
4. Express Body Parser
5. RequestId Middleware (Injects X-Request-ID)
6. RequestLogger (Pino structured log on finish)
7. Router (/api/v1/...)
8. Route Validation Middleware (Zod schema validate)
9. Controller -> Service -> Repository / Domain
10. Response Helper (sendSuccess / sendError)
  │ (Error handling)
  ▼
Central Error Handler Middleware
```
