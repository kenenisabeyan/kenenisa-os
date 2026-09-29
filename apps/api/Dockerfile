# ─── Stage 1: Builder ───────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Copy packages (shared types etc.)
COPY packages/ ./packages/

# Copy the API app
COPY apps/api/ ./apps/api/

# Install all dependencies (including devDeps for build)
RUN npm ci --workspace=apps/api --include-workspace-root

# Generate Prisma client
RUN npm run db:generate --workspace=apps/api

# Build TypeScript
RUN npm run build --workspace=apps/api

# ─── Stage 2: Production Runner ──────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy root manifest for workspace resolution
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Copy packages
COPY packages/ ./packages/

# Copy built API
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma/ ./apps/api/prisma/
COPY --from=builder /app/apps/api/dist/ ./apps/api/dist/

# Install production-only dependencies
RUN npm ci --workspace=apps/api --omit=dev --include-workspace-root

# Generate Prisma client in production image
RUN npm run db:generate --workspace=apps/api

WORKDIR /app/apps/api

EXPOSE 3000

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
