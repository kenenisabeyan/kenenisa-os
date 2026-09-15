# Testing Strategy — KENENISA OS

## Test Layers

1. **Unit & Integration Tests (Vitest + Supertest):**
   - API endpoints (`apps/api/src/__tests__/**/*.test.ts`)
   - Run command: `npm run test` or `npm run test --workspace=apps/api`

2. **E2E Tests (Playwright):**
   - Web application user flows (`apps/web/e2e/**/*.spec.ts`)
   - Run command: `npm run test:e2e --workspace=apps/web`

3. **Type Safety & Lint Verification:**
   - Typechecking: `npm run typecheck`
   - Linting: `npm run lint`
   - Formatting: `npm run format:check`
