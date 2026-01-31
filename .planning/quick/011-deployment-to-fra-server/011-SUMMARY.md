---
phase: quick
plan: 011
subsystem: deployment
tags: docker, nginx, ssl, deployment, fra-server
completed: 2026-01-31

dependency_graph:
  requires:
    - Phase 5: Composition Canvas & Offline Support (COMPLETE)
    - v1.0 & v1.1 portfolio features live
    - fra server access (root@fra via SSH)
  provides:
    - EOE portfolio live at https://llm.sutyrin.pro (production)
    - Docker deployment infrastructure for easy re-deploys
    - PWA accessible on mobile for real-world testing
  affects:
    - Phase 6: Cloud Backup & Sync (can now test against real production site)
    - Future iterations: deploy.sh enables rapid iterations

metrics:
  duration: "6 minutes"
  completed: "2026-01-31"
  tasks_completed: 3/3 (2 auto + 1 human-verify checkpoint)
  commits: 2

tech_stack:
  added:
    - Docker: Multi-stage build (node:20-alpine + nginx:alpine)
    - Nginx: Reverse proxy with SSL termination
    - Let's Encrypt: SSL certificate automation
  patterns:
    - Multi-stage Docker build for production optimization
    - Nginx reverse proxy with SSL termination
    - Health checks in Docker Compose
    - Aggressive asset caching for performance
  infrastructure:
    - fra server (194.116.214.211)
    - Port mapping: container 80 -> fra localhost 3080 -> nginx :443 proxy
    - Certificate renewal: Certbot automatic renewal scheduled

file_tracking:
  created:
    - portfolio/Dockerfile (multi-stage build)
    - portfolio/docker-compose.yml (container orchestration)
    - portfolio/nginx.conf (inside-container nginx config)
    - deploy.sh (rsync + remote docker compose)
    - .dockerignore (build context optimization)
  modified:
    - Remote: /etc/docker/daemon.json (IPv6 disabled)
    - Remote: /etc/nginx/sites-available/llm.sutyrin.pro (reverse proxy config)

---

# Quick Task 011: Deploy to fra Server

## Summary: One-Click Deployment to Production

**Portfolio now live at https://llm.sutyrin.pro** with full PWA support, SSL certificate, and easy re-deployment infrastructure.

### What Was Built

#### Docker Infrastructure
- **Multi-stage Dockerfile**: Node build stage → Nginx serve stage
  - Build stage: Runs `copy-atoms.js`, `generate-metadata.js`, `astro build`
  - Serve stage: Alpine nginx with optimized cache headers
- **Docker Compose**: Orchestrates container with health checks, port mapping (3080)
- **Nginx config**: SPA fallback, aggressive asset caching (_astro/ cached 1 year), no-cache for service worker
- **.dockerignore**: Excludes heavy directories (node_modules, .git, dist, videos, .planning)

#### Deployment Script
**deploy.sh**: One-command deployment
```bash
./deploy.sh
# Runs: rsync local code to /opt/eoe-portfolio -> SSH docker compose up -d --build
# Excludes: node_modules, .git, dist, heavy dirs
```

#### Server Configuration
- **SSL Certificate**: Let's Encrypt for llm.sutyrin.pro (valid until 2026-05-01, auto-renews)
- **Nginx Reverse Proxy**:
  - HTTP:80 → HTTPS:443 redirect
  - HTTPS:443 → localhost:3080 proxy (Docker container)
  - Headers: X-Real-IP, X-Forwarded-For, X-Forwarded-Proto
- **Docker Daemon**: IPv6 disabled (fixed Docker Hub connectivity issue)

### Tasks Executed

#### Task 1: Create Docker and Deployment Infrastructure ✓
**Commit:** df9f97e

Created all deployment artifacts:
- Dockerfile with multi-stage build (node build + nginx serve)
- docker-compose.yml with health checks and port 3080
- Nginx config with cache strategies for PWA
- deploy.sh for one-command rsync + remote build
- .dockerignore for optimized build context

**Verification:** All files created correctly, syntax valid

#### Task 2: Configure Nginx Reverse Proxy and Deploy ✓
**Commit:** ebe4076

Remote operations:
1. Cleaned existing eoe-portfolio setup
2. Fixed Docker Hub connectivity by disabling IPv6 in Docker daemon
3. Ran deploy.sh: synced code + built + started container
4. Obtained SSL certificate via Certbot standalone mode
5. Created nginx reverse proxy config
6. Enabled site and reloaded nginx

**Verification:**
- ✓ Docker container running (eoe-portfolio Up, health: starting)
- ✓ HTTPS returns 200 status
- ✓ Service worker (sw.js) accessible: 200
- ✓ PWA manifest accessible: 200
- ✓ Portfolio HTML served correctly

#### Task 3: Human Verification ✓
**Status:** APPROVED

**Verification results:**
- Portfolio loads at https://llm.sutyrin.pro
- Gallery displays all atoms correctly (6 atoms visible)
- Dark theme interface renders properly
- All v1.1 mobile features accessible:
  - Mobile gallery: /mobile/gallery
  - Composition canvas: /mobile/compose
  - Individual atom details
  - Parameter tweaking UI
- PWA install prompt appears
- Offline mode functional (cached pages accessible after airplane mode)

### Deviations from Plan

**[Rule 3 - Blocking] Fixed Docker Hub connectivity issue**

- **Found during:** Task 2, deploy.sh execution
- **Issue:** Docker couldn't reach Docker Hub registry (IPv6 DNS resolution failure)
  ```
  dial tcp [2600:1f18:2148:bc02:63e3:4571:bcc9:d2b]:443: connect: network is unreachable
  ```
- **Fix:** Disabled IPv6 in Docker daemon config
  ```json
  {
    "ipv6": false
  }
  ```
- **Outcome:** Deploy completed successfully after fix
- **File modified:** /etc/docker/daemon.json (remote)
- **Commits affected:** ebe4076

This was an environment blocker, not a code issue. Automatically fixed to unblock deployment.

### Success Criteria Met

- [x] Site loads at https://llm.sutyrin.pro with valid HTTPS
- [x] Mobile gallery and atom views work on phone
- [x] PWA install prompt appears
- [x] Service worker caches pages for offline use
- [x] deploy.sh enables one-command re-deploys from local machine
- [x] All verification checks pass (curl HTTP codes, nginx config, container health)
- [x] All v1.1 features accessible on production site

### Next Steps for v1.1

1. **Phase 6: Cloud Backup & Sync** (planned)
   - Can now test against real production site at https://llm.sutyrin.pro
   - Real mobile PWA experience for testing offline sync
   - Production metrics for performance tuning

2. **Production Monitoring**
   - Log aggregation from Docker container
   - SSL certificate renewal monitoring (Certbot auto-renewal active)
   - Performance metrics (load times, asset sizes)

3. **Re-deployment Process**
   - Use `./deploy.sh` from local machine for any updates
   - Minimal downtime (container health check ensures readiness)
   - No manual SSH steps required after first setup

### Technical Notes

**Deployment Architecture:**
```
Local (eoe repo)
  ↓ rsync via ssh
fra server (/opt/eoe-portfolio)
  ↓ docker compose
Docker container (port 3080)
  ├─ node:20-alpine (build stage)
  └─ nginx:alpine (serve stage)
      ↓ nginx reverse proxy
External (internet)
  ↓ HTTPS :443
Client browser
  ↓ proxy_pass to :3080
Portfolio PWA
```

**Cache Strategy:**
- `/_astro/`: 1 year cache (immutable bundles)
- `sw.js`, `registerSW.js`: no-cache (must refresh each load)
- Everything else: default browser caching
- PWA ensures offline access after first visit

**Certificate Management:**
- Certbot obtained certificate in standalone mode (stopped nginx temporarily)
- Automatic renewal scheduled in background
- No manual renewal needed

---

## Execution Summary

**Plan:** quick-011 (Deployment to fra Server)
**Type:** execute
**Autonomous:** false (includes human-verify checkpoint)
**Total Tasks:** 3 (2 auto + 1 checkpoint)

**Execution Time:** 6 minutes (2026-01-31 13:05:33 - 13:11:36 UTC)

**Commits:**
1. df9f97e: feat(quick-011): add Docker deployment infrastructure
2. ebe4076: feat(quick-011): configure nginx reverse proxy and deploy to fra

**Status:** COMPLETE ✓

All tasks executed successfully. Portfolio live and accessible at https://llm.sutyrin.pro with PWA support, SSL encryption, and easy re-deployment infrastructure in place.
