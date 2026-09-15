# KENENISA OS — Production Operations & Hardening Guide

This document outlines the production readiness, environment requirements, startup sequence, database lifecycle, security settings, and deployment architecture for **KENENISA OS**.

---

## 1. Supported Runtime & Environment Requirements

* **Node.js**: `>= 20.x.x` (LTS recommended)
* **Database**: PostgreSQL `14+` or `15+`
* **Package Manager**: `npm >= 10.x.x`
* **Browser Support**: Chrome, Firefox, Safari, Edge (ES2022+)

---

## 2. Environment Variables Configuration

Server-side environment configuration is defined and validated at startup using Zod in [`apps/api/src/config/index.ts`](file:///c:/Users/kenenisa/Desktop/about%20kenenisa/My%20pojects/kenenisa-os/apps/api/src/config/index.ts).

| Variable Name | Required / Optional | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Optional | `development` | Deployment environment (`development`, `test`, `production`) |
| `PORT` | Optional | `3000` | Port for Express REST API server |
| `CORS_ORIGIN` | Optional | `http://localhost:5173` | Explicit allowed origin for CORS requests |
| `LOG_LEVEL` | Optional | `info` | Pino log level (`fatal`, `error`, `warn`, `info`, `debug`) |
| `DATABASE_URL` | Required in Prod | `postgresql://...` | PostgreSQL connection string |
| `SESSION_SECRET` | Required in Prod | `...` | Secret key for session cookie hashing |
| `RATE_LIMIT_MAX` | Optional | `100` | Global API rate limit (requests per 15 min per IP) |
| `AI_PROVIDER` | Optional | `openai` | Active AI provider (`openai` or mock fallback) |
| `AI_MODEL` | Optional | `gpt-4o-mini` | AI model identifier |
| `AI_API_KEY` | Optional | `undefined` | Server-only OpenAI API key |
| `AI_BASE_URL` | Optional | `https://api.openai.com/v1` | Base URL for LLM provider API |
| `AI_TIMEOUT_MS` | Optional | `15000` | Timeout threshold in milliseconds for LLM generation |

---

## 3. Server Startup Sequence

```text
1. Read Process Environment (process.env)
   ↓
2. Load & Validate via Zod (apps/api/src/config/index.ts)
   ↓
3. Initialize Structured Logger (apps/api/src/lib/logger.ts)
   ↓
4. Initialize Centralized Prisma Client (apps/api/src/lib/prisma.ts)
   ↓
5. Mount Security Middleware (Helmet, CORS, CookieParser, Rate Limiters)
   ↓
6. Mount Request Context & Request ID (X-Request-ID)
   ↓
7. Mount REST API Routers (/api/v1/*)
   ↓
8. Start HTTP Server & Attach Graceful Shutdown Signal Handlers
```

---

## 4. Database Lifecycle & Migration Policy

* **Prisma Schema**: Located at [`apps/api/prisma/schema.prisma`](file:///c:/Users/kenenisa/Desktop/about%20kenenisa/My%20pojects/kenenisa-os/apps/api/prisma/schema.prisma).
* **Generation**: Run `npm run db:generate --workspace=apps/api` to generate type-safe Prisma Client definitions.
* **Production Policy**:
  * **NEVER** run `prisma migrate reset` in production environments.
  * **ALWAYS** deploy database changes using `npx prisma migrate deploy` in CD deployment pipelines.

---

## 5. Backup & Restore Procedures

### PostgreSQL Database Backup
```bash
pg_dump -U postgres -h localhost -d kenenisa_os -F c -b -v -f /backups/kenenisa_os_$(date +%Y%m%d_%H%M%S).dump
```

### PostgreSQL Database Restore
```bash
pg_restore -U postgres -h localhost -d kenenisa_os -v --clean --if-exists /backups/kenenisa_os_20260916_000000.dump
```

---

## 6. Process Shutdown & Signal Handling

The server handles `SIGTERM` and `SIGINT` signals with a **bounded 10-second graceful shutdown**:

1. Stop accepting new incoming HTTP connections (`server.close()`).
2. Disconnect active database connection pools (`prisma.$disconnect()`).
3. Complete active standard requests and terminate cleanly with exit code `0`.
4. If shutdown exceeds 10 seconds, force termination with exit code `1`.
