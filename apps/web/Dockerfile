# ─── Stage 1: Builder ───────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Copy the web app
COPY apps/web/ ./apps/web/

# Install dependencies
RUN npm ci --workspace=apps/web --include-workspace-root

# Build for production (outputs to apps/web/dist)
# Pass VITE_API_URL at build time via --build-arg
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build --workspace=apps/web

# ─── Stage 2: Serve with Nginx ───────────────────────────────────────
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
