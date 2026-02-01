---
phase: quick
plan: 012
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true

must_haves:
  truths:
    - "Latest code (Phase 6 features) is deployed and live at https://llm.sutyrin.pro"
    - "Playwright browser verifies key Phase 6 pages load and render correctly"
    - "Analysis report identifies what works and what needs attention in production"
  artifacts:
    - path: ".planning/quick/012-deploy-test-phase6/012-SUMMARY.md"
      provides: "Deployment and test results report"
  key_links:
    - from: "deploy.sh"
      to: "https://llm.sutyrin.pro"
      via: "rsync + docker compose"
      pattern: "Deploy complete"
    - from: "playwright"
      to: "https://llm.sutyrin.pro"
      via: "browser automation"
      pattern: "page.goto.*llm.sutyrin.pro"
---

<objective>
Deploy latest code (v1.1 with Phase 6 features) to production at https://llm.sutyrin.pro, then use Playwright browser automation to verify Phase 6 features work in production: composition preview, snapshots, backup status, shareable URLs. Produce a results report.

Purpose: Validate that Phase 6 features (preview engine, composition snapshots, cloud backup, backup status UI, shareable URLs) actually work on the production server, not just locally.

Output: Successful deployment + Playwright test results with screenshots + analysis report.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/011-deployment-to-fra-server/011-SUMMARY.md

Key facts:
- deploy.sh exists at repo root, does rsync to root@fra + docker compose up --build
- Site runs at https://llm.sutyrin.pro (Docker container on port 3080, nginx reverse proxy)
- Backup server runs on port 3081 (health endpoint: /api/health)
- Playwright 1.58.0 installed as devDependency
- Phase 6 pages to test:
  - / (homepage with gallery)
  - /mobile/gallery (mobile gallery view)
  - /mobile/compose (composition canvas with preview)
  - /mobile/compositions (saved compositions and snapshots list)
  - /mobile/backup (backup management page with status badge)
  - /c/?id=test (shareable composition URL viewer)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Deploy latest code to production</name>
  <files></files>
  <action>
Run the deploy script to push latest code (including all Phase 6 features) to the fra server:

```bash
./deploy.sh
```

This will:
1. rsync code to root@fra:/opt/eoe-portfolio
2. docker compose down + up --build on remote
3. Wait for container health
4. Test portfolio response (HTTP 200 on port 3080)
5. Test backup server response (HTTP 200 on port 3081/api/health)

After deploy.sh completes, verify the site is accessible externally:
```bash
curl -s -o /dev/null -w '%{http_code}' https://llm.sutyrin.pro/
```

If deploy fails, check container logs:
```bash
ssh root@fra 'cd /opt/eoe-portfolio/portfolio && docker compose logs --tail=50'
```
  </action>
  <verify>
    `curl -s -o /dev/null -w '%{http_code}' https://llm.sutyrin.pro/` returns 200.
    `ssh root@fra "curl -s -o /dev/null -w '%{http_code}' http://localhost:3081/api/health"` returns 200.
  </verify>
  <done>
    Production site at https://llm.sutyrin.pro serves the latest code with Phase 6 features. Both portfolio container and backup server container are healthy.
  </done>
</task>

<task type="auto">
  <name>Task 2: Run Playwright browser tests on Phase 6 features</name>
  <files></files>
  <action>
Write and execute a Playwright script inline (no permanent test file needed) that visits https://llm.sutyrin.pro and tests Phase 6 feature pages. Use `npx playwright` to run.

Create a temporary test script that does the following checks with a real Chromium browser:

**Page 1: Homepage (/)**
- Navigate to https://llm.sutyrin.pro/
- Wait for page load, take screenshot
- Check page title exists
- Look for atom gallery content (any atom cards or links)

**Page 2: Mobile Gallery (/mobile/gallery)**
- Navigate to /mobile/gallery
- Wait for content to render
- Take screenshot
- Check for gallery items (atom list)

**Page 3: Composition Canvas (/mobile/compose)**
- Navigate to /mobile/compose
- Wait for React Flow canvas or composition UI to render
- Take screenshot
- Check for canvas element or React Flow container

**Page 4: Compositions List (/mobile/compositions)**
- Navigate to /mobile/compositions
- Take screenshot
- Check for composition list or empty state message

**Page 5: Backup Management (/mobile/backup)**
- Navigate to /mobile/backup
- Take screenshot
- Look for backup status elements (badge, sync status, buttons)

**Page 6: Shareable URL (/c/?id=test)**
- Navigate to /c/?id=test (will likely show "not found" or empty state since no real snapshot with id "test" exists)
- Take screenshot
- Verify the page loads without crashing (graceful handling of missing snapshot)

For each page:
- Use `page.goto(url, { waitUntil: 'networkidle', timeout: 15000 })` with try/catch for timeout
- Take a screenshot to `.planning/quick/012-deploy-test-phase6/screenshots/` directory
- Collect page title, any console errors, and key DOM element presence
- Print results to stdout

Use mobile viewport (390x844, iPhone 14 dimensions) since this is a mobile-first app.

Run with: `npx playwright test` or inline with Node.js using playwright's library API directly:
```bash
node --experimental-vm-modules -e "..."
```

Or better, write a temp .mjs script and run it:
```javascript
import { chromium } from 'playwright';
// ... test logic
```

Save screenshots to `.planning/quick/012-deploy-test-phase6/screenshots/`.
  </action>
  <verify>
    Screenshots exist in `.planning/quick/012-deploy-test-phase6/screenshots/` for all 6 pages.
    Script output shows pass/fail status for each page check.
  </verify>
  <done>
    All 6 Phase 6 feature pages tested via Playwright browser. Screenshots captured. Console errors logged. DOM element presence verified. Results printed to stdout.
  </done>
</task>

<task type="auto">
  <name>Task 3: Analyze screenshots and compile results report</name>
  <files>.planning/quick/012-deploy-test-phase6/012-SUMMARY.md</files>
  <action>
Review the screenshots captured in Task 2 by reading each image file. Analyze what rendered on each page.

For each of the 6 pages, assess:
1. Did the page load successfully? (HTTP 200, no blank page)
2. Did the expected UI elements render? (gallery items, canvas, backup badge, etc.)
3. Were there any console errors or warnings?
4. Does the page look correct for a mobile viewport?

Compile findings into the summary file at `.planning/quick/012-deploy-test-phase6/012-SUMMARY.md` with:

- Deployment status (success/fail, timing)
- Per-page test results table (page, status, key findings, screenshot)
- Console errors found (if any)
- Overall assessment: which Phase 6 features are working in production vs need attention
- Recommendations for any issues found

Follow the summary template format from prior quick tasks.
  </action>
  <verify>
    `.planning/quick/012-deploy-test-phase6/012-SUMMARY.md` exists and contains test results for all 6 pages.
  </verify>
  <done>
    Summary report documents deployment success, per-page Playwright test results with screenshot analysis, console errors, and overall Phase 6 production readiness assessment.
  </done>
</task>

</tasks>

<verification>
- `curl -s -o /dev/null -w '%{http_code}' https://llm.sutyrin.pro/` returns 200 (deployment verified)
- Screenshots directory contains 6+ images from Playwright browser
- Summary report exists with per-page analysis
- All Phase 6 pages load without crashes in production
</verification>

<success_criteria>
- Latest code deployed to https://llm.sutyrin.pro (both portfolio and backup server running)
- Playwright visited all 6 Phase 6 feature pages with real Chromium browser
- Screenshots captured for visual verification
- Results report identifies working features and any issues needing attention
</success_criteria>

<output>
After completion, create `.planning/quick/012-deploy-test-phase6/012-SUMMARY.md`
</output>
