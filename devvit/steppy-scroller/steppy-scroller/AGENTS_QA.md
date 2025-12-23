# QA Protocol for Steppy Scroller (Devvit)

This document outlines the automated Quality Assurance process for the Steppy Scroller Devvit application.

## automated QA Workflow

The `test:qa` script performs the following steps:
1.  **Build**: Compiles the client and server code (`npm run build`).
2.  **Deploy**: Uploads the latest version to the Devvit platform (`devvit upload`).
3.  **Verify**: Runs End-to-End (E2E) tests using Playwright (`npm run pw:devvit:e2e`).
    *   Navigates to the live Reddit post (configured via `devvit-config.mjs` or `DEVVIT_POST_URL`).
    *   Clicks through the application (Center, Arrow buttons).
    *   Captures screenshots at each stage.

## Agent Verification Instructions

After running `npm run test:qa`, an AI Agent should:

1.  **Check Output Logs**: Ensure all steps (Build, Upload, Test) completed with `Exit Code: 0`.
2.  **Locate Screenshots**: Find the generated screenshots in `test-results/devvit/`.
    *   Pattern: `steppy-after-start-*.png`
    *   Pattern: `steppy-after-↖-*.png`, etc.
3.  **Visual Inspection**:
    *   Use the `read_file` tool to examine the latest `steppy-after-start` screenshot.
    *   **Pass Criteria**:
        *   The "Steppy Scroller" logo or title screen is visible.
        *   The "Start" button (or equivalent interaction prompt) is clear.
        *   No "Error loading app" or blank white screens.
    *   **Fail Criteria**:
        *   Broken images/assets.
        *   Error messages from Reddit or the App.

## Manual Trigger

To run this workflow manually:

```bash
cd devvit/steppy-scroller/steppy-scroller
npm run test:qa
```
