# KENENISA OS — Production Deployment Guide

This document provides step-by-step instructions for deploying **KENENISA OS** into a production environment.

---

## 1. System Requirements & Prerequisites

* **Node.js**: `v20.x.x LTS` or higher
* **npm**: `v10.x.x` or higher
* **Database**: PostgreSQL `14.x` or `15.x` with `sslmode=require` supported
* **Web Server / Reverse Proxy**: Nginx, Cloudflare, Caddy, Vercel, or AWS CloudFront (for serving static frontend assets and proxying API requests)

---

## 2. Production Environment Setup

Create environment variable configuration in the target hosting environment or server process manager (e.g., Systemd, PM2, Docker, Render, Railway).

### Required Server Environment Variables
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:5432/<DB_NAME>?sslmode=require
SESSION_SECRET=<HIGH_ENTROPY_MIN_32_CHAR_RANDOM_SECRET>
FRONTEND_URL=https://app.yourdomain.com
API_URL=https://api.yourdomain.com
CORS_ORIGIN=https://app.yourdomain.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
LOG_LEVEL=info
RATE_LIMIT_MAX=100
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
AI_API_KEY=<SERVER_ONLY_OPENAI_API_KEY>
AI_TIMEOUT_MS=15000
```

---

## 3. Step-by-Step Deployment Execution Procedure

### Step 3.1: Repository Checkout & Build Verification
```bash
# Clone or checkout the verified commit SHA
git clone https://github.com/kenenisabeyan/kenenisa-os.git
cd kenenisa-os
git checkout 5b0351d1fd923c9f7470915b87592bd00c4cad7a

# Install production dependencies
npm ci

# Run verification quality gates
npm run typecheck
npm run lint
npm test
```

### Step 3.2: Production Database Migration
```bash
# Apply pending Prisma database migrations safely against target PostgreSQL instance
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

# Generate type-safe Prisma Client
npm run db:generate --workspace=apps/api
```

### Step 3.3: Production Compilation
```bash
# Build API and Web production bundles
npm run build
```
Output:
- API Compiled JavaScript: `apps/api/dist/`
- Web Static Assets: `apps/web/dist/` (`index.html`, CSS, JS bundles)

### Step 3.4: Express API Process Launch
Launch the API server using Node.js or a process manager:
```bash
# PM2 process execution
pm2 start apps/api/dist/server.js --name "kenenisa-os-api" --env production

# Direct Node.js execution
node apps/api/dist/server.js
```

### Step 3.5: Static Frontend Serving
Serve the built static bundle in `apps/web/dist/` using Nginx, Caddy, Vercel, or static web host.

#### Sample Nginx Configuration Snippet
```nginx
server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.yourdomain.com/privkey.pem;

    root /var/www/kenenisa-os/apps/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/v1/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 4. Post-Deployment Verification SOP

After starting API processes and web static hosting, verify deployment operational health:

1. **Check Liveness Endpoint**:
   ```bash
   curl -i https://api.yourdomain.com/health
   # Expected: HTTP 200 OK {"status":"ok","timestamp":"..."}
   ```

2. **Check Database Readiness Endpoint**:
   ```bash
   curl -i https://api.yourdomain.com/ready
   # Expected: HTTP 200 OK {"status":"ok","database":"connected","timestamp":"..."}
   ```

3. **Verify Web SPA Loading**:
   Open browser at `https://app.yourdomain.com` and log in with owner credentials.
