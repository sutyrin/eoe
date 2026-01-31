---
phase: quick
plan: 011
type: execute
wave: 1
depends_on: []
files_modified:
  - portfolio/Dockerfile
  - portfolio/docker-compose.yml
  - portfolio/.dockerignore
  - deploy.sh
autonomous: false

must_haves:
  truths:
    - "https://llm.sutyrin.pro loads the EOE portfolio site on mobile"
    - "Service worker and PWA manifest served correctly over HTTPS"
    - "Deploy script re-deploys with a single local command"
  artifacts:
    - path: "portfolio/Dockerfile"
      provides: "Multi-stage build: node for build, nginx for serve"
    - path: "portfolio/docker-compose.yml"
      provides: "Container definition with port mapping"
    - path: "portfolio/.dockerignore"
      provides: "Excludes node_modules, .git from build context"
    - path: "deploy.sh"
      provides: "One-command rsync + remote rebuild script"
  key_links:
    - from: "deploy.sh"
      to: "root@fra"
      via: "rsync + ssh"
      pattern: "rsync.*fra.*docker"
    - from: "nginx on fra"
      to: "docker container"
      via: "reverse proxy to localhost port"
      pattern: "proxy_pass.*localhost"
---

<objective>
Deploy the EOE portfolio (Astro SSG) to root@fra server in a Docker container, served via nginx reverse proxy at https://llm.sutyrin.pro.

Purpose: Get the portfolio PWA accessible on mobile for real-world testing of all v1.1 features (gallery, parameter tweaker, composition canvas, voice notes).

Output: Working deployment at https://llm.sutyrin.pro, plus a `deploy.sh` script for future re-deploys.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Key facts gathered during planning:
- Server: root@fra (194.116.214.211), reachable via SSH
- Server has: Docker 28.2.2, Node 20, nginx, certbot
- No existing llm.sutyrin.pro nginx config or SSL cert
- Existing containers: tm-tracker (running), others stopped
- Portfolio: Astro SSG, builds to portfolio/dist/ via `npm run build`
- Build requires atoms/ dir at repo root (copy-atoms.js copies them to public/atoms/)
- Monorepo with npm workspaces: root package.json references cli/ and portfolio/
- The build script runs: copy-atoms.js, generate-metadata.js, then astro build
- No .env needed for the portfolio build
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Docker and deployment infrastructure</name>
  <files>
    portfolio/Dockerfile
    portfolio/docker-compose.yml
    portfolio/.dockerignore
    deploy.sh
  </files>
  <action>
Create a multi-stage Dockerfile in portfolio/:

Stage 1 (build): Use node:20-alpine. Copy the entire repo context needed for the build. The tricky part: copy-atoms.js references `../../atoms` relative to portfolio/scripts/, so the build context must include the atoms/ directory. Approach: use the REPO ROOT as Docker build context, with Dockerfile path specified as portfolio/Dockerfile.

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json ./
COPY portfolio/package.json ./portfolio/

# Copy atoms (needed by copy-atoms.js which references ../../atoms)
COPY atoms/ ./atoms/

# Install dependencies (workspace-aware)
RUN npm ci --workspace=portfolio

# Copy portfolio source
COPY portfolio/ ./portfolio/

# Build (runs copy-atoms + generate-metadata + astro build)
WORKDIR /app/portfolio
RUN npm run build
```

Stage 2 (serve): Use nginx:alpine. Copy the built dist/ into nginx. Use a simple nginx config that serves static files on port 80 inside the container.

Create a minimal nginx.conf for the container:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA/PWA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets aggressively
    location /_astro/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service worker must not be cached
    location = /sw.js {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location = /registerSW.js {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

Create docker-compose.yml in portfolio/:
```yaml
services:
  eoe-portfolio:
    build:
      context: ..
      dockerfile: portfolio/Dockerfile
    container_name: eoe-portfolio
    restart: unless-stopped
    ports:
      - "3080:80"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/"]
      interval: 30s
      timeout: 5s
      retries: 3
```

Port 3080 externally (avoids conflict with other services).

Create .dockerignore in portfolio/:
```
node_modules
.git
dist
.planning
videos
games
devvit
.vercel
*.md
.env
```

NOTE: Since build context is repo root, the .dockerignore should be at repo root. Create it at the repo root as `.dockerignore` (not in portfolio/).

Create deploy.sh at repo root:
```bash
#!/bin/bash
set -euo pipefail

REMOTE="root@fra"
REMOTE_DIR="/opt/eoe-portfolio"

echo "==> Syncing code to $REMOTE:$REMOTE_DIR..."
rsync -az --delete \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=videos \
  --exclude=games \
  --exclude=devvit \
  --exclude=.vercel \
  --exclude=.planning \
  --exclude='.env' \
  -e ssh \
  ./ "$REMOTE:$REMOTE_DIR/"

echo "==> Building and starting container on remote..."
ssh "$REMOTE" "cd $REMOTE_DIR/portfolio && docker compose down --remove-orphans 2>/dev/null; docker compose up -d --build"

echo "==> Waiting for container health..."
ssh "$REMOTE" "sleep 3 && docker ps --filter name=eoe-portfolio --format '{{.Status}}'"

echo "==> Testing local response..."
ssh "$REMOTE" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3080/"

echo ""
echo "Deploy complete! Site should be at https://llm.sutyrin.pro"
```

Make deploy.sh executable: chmod +x deploy.sh
  </action>
  <verify>
    Run `cat portfolio/Dockerfile && cat portfolio/docker-compose.yml && cat deploy.sh` to confirm all files created correctly.
  </verify>
  <done>
    Dockerfile with multi-stage build exists, docker-compose.yml maps port 3080, deploy.sh does rsync + remote docker compose up, .dockerignore excludes heavy dirs.
  </done>
</task>

<task type="auto">
  <name>Task 2: Configure nginx reverse proxy with SSL and deploy</name>
  <files>
    deploy.sh (already created)
  </files>
  <action>
This task runs remote commands via SSH. Do everything through `ssh root@fra`.

Step 1: Wipe any existing eoe-related setup on the server:
```bash
ssh root@fra 'docker stop eoe-portfolio 2>/dev/null; docker rm eoe-portfolio 2>/dev/null; rm -rf /opt/eoe-portfolio; echo "Cleaned"'
```

Step 2: Run deploy.sh to sync code and build the container:
```bash
./deploy.sh
```

Step 3: Create nginx site config on the remote server. First, get SSL cert:
```bash
ssh root@fra 'certbot certonly --nginx -d llm.sutyrin.pro --non-interactive --agree-tos -m pavel@sutyrin.pro'
```

NOTE: If certbot --nginx fails because there is no existing nginx config for the domain, use standalone mode temporarily:
```bash
ssh root@fra 'systemctl stop nginx && certbot certonly --standalone -d llm.sutyrin.pro --non-interactive --agree-tos -m pavel@sutyrin.pro && systemctl start nginx'
```

Step 4: Create the nginx reverse proxy config:
```bash
ssh root@fra 'cat > /etc/nginx/sites-available/llm.sutyrin.pro << "NGINX"
server {
    listen 80;
    server_name llm.sutyrin.pro;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name llm.sutyrin.pro;

    ssl_certificate /etc/letsencrypt/live/llm.sutyrin.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/llm.sutyrin.pro/privkey.pem;

    location / {
        proxy_pass http://localhost:3080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX'
```

Step 5: Enable the site and reload nginx:
```bash
ssh root@fra 'ln -sf /etc/nginx/sites-available/llm.sutyrin.pro /etc/nginx/sites-enabled/llm.sutyrin.pro && nginx -t && systemctl reload nginx'
```

Step 6: Verify the deployment is working:
```bash
curl -s -o /dev/null -w '%{http_code}' https://llm.sutyrin.pro/
```
Should return 200.

Also verify the service worker and manifest are accessible:
```bash
curl -s -o /dev/null -w '%{http_code}' https://llm.sutyrin.pro/sw.js
curl -s -o /dev/null -w '%{http_code}' https://llm.sutyrin.pro/manifest.webmanifest
```
Both should return 200.
  </action>
  <verify>
    `curl -sI https://llm.sutyrin.pro/ | head -5` shows HTTP/2 200 with content-type text/html.
    `curl -s https://llm.sutyrin.pro/ | grep -o '<title>[^<]*</title>'` shows the portfolio title.
    `ssh root@fra 'docker ps --filter name=eoe-portfolio --format "{{.Status}}"'` shows "Up" with healthy status.
  </verify>
  <done>
    https://llm.sutyrin.pro serves the EOE portfolio over HTTPS with valid SSL certificate. Nginx reverse proxies to Docker container on port 3080. Container is running and healthy.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    Full deployment of EOE portfolio to https://llm.sutyrin.pro:
    - Docker container running Astro SSG build served by nginx (inside container)
    - Server nginx reverse proxy with Let's Encrypt SSL
    - PWA manifest and service worker accessible
    - deploy.sh for future one-command re-deploys
  </what-built>
  <how-to-verify>
    1. Open https://llm.sutyrin.pro on your phone
    2. Verify the portfolio/gallery loads correctly
    3. Check that atoms are visible and clickable
    4. Try the mobile gallery at https://llm.sutyrin.pro/mobile/gallery
    5. Confirm "Add to Home Screen" prompt works (PWA)
    6. Test offline: enable airplane mode after first load, verify cached pages still work
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- `curl -s https://llm.sutyrin.pro/ | grep -c 'html'` returns non-zero (HTML served)
- `curl -sI https://llm.sutyrin.pro/sw.js` returns 200 (service worker accessible)
- `curl -sI https://llm.sutyrin.pro/manifest.webmanifest` returns 200 (PWA manifest accessible)
- `ssh root@fra 'docker ps --filter name=eoe-portfolio'` shows running container
- `./deploy.sh` completes without errors (re-deploy works)
</verification>

<success_criteria>
- Site loads at https://llm.sutyrin.pro with valid HTTPS
- Mobile gallery and atom views work on phone
- PWA install prompt appears
- Service worker caches pages for offline use
- deploy.sh enables one-command re-deploys from local machine
</success_criteria>

<output>
After completion, create `.planning/quick/011-deployment-to-fra-server/011-SUMMARY.md`
</output>
