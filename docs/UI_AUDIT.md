# Development UI audit

This records the earlier UI audit. Later account authentication work and its test-project migration are recorded in [AUTH_SETUP.md](AUTH_SETUP.md).

Development branch: `sprint4/cjis-source-migration`. Main and production remain unchanged; no merge, deployment, hosted migration, or seed is performed.

Repairs cover ordering submission and sequence scoring, preserved answers on revisits, adaptive continuation, quiz-bank switching and Next, round bookmarks, mobile practice/leaderboard layout, homepage/study/reference navigation, calculator validation, theme persistence, generator feedback, diagnostics hydration, and missing logo assets. Role authorization reads protected profiles, account requests use authenticated IDs, the privileged example endpoint is unavailable, and RR schema failures show a setup message.

Unconnected account/billing/educator actions and missing lessons are disabled. Sample activity/rank/study progress and device/visit-only data are labelled.

The recovered source passes 124 unit tests in 18 files, type checking, the Node 20 production build, Sprint 4/CJIS validation, and all 11 legacy bank files. The source manifest verifies 176 unchanged imports and 97 documented changes. Staging validation covers 17 datasets / 168 draft items.

The fresh public browser run passed 165 cases, failed three keyboard ordering cases, and explicitly skipped four cloud bookmark/billing integration cases. Disabling sortable transitions and synchronizing the restored keyboard test fixed those failures; all six focused desktop/mobile ordering checks then passed, including unchanged-order submission, exact-sequence scoring, and a complete cardiac round. Together with four passing signed-in simulated-API checks, 172 distinct browser checks pass after the targeted correction/rerun. These are separate runs, not a claim of one uninterrupted failure-free suite.

All 33 inventoried public routes return HTTP 200 on both projects without uncaught page errors. Shared logo assets load without brand-resource failures. Route-render coverage does not establish every backend or clinical content path. Google Fonts and unconfigured local API requests can still produce console/network errors; a clean console is not claimed.

The workspace resumed from an earlier checkpoint during the first audit. The source and tests were recovered and saved to the development branch before this fresh verification. Earlier pre-recovery results are not used to certify the final implementation. Compact retained results are in [ui-audit-results.json](ui-audit-results.json).

## Verification limits and remaining work

- Cloud Profile bookmarks are not implemented. Round bookmarks reset on reload.
- Practice progress is device-local and not isolated between accounts or synchronized. Study completion is visit-only; some activity/rank/progress data is sample data.
- Authoritative rationale quotas, subscription entitlements, trial activation and checkout require an authenticated backend and billing sandbox tests. Four desktop/mobile integration cases are explicitly skipped.
- Hosted scenario/attempt persistence, achievement retrieval, RR installation/seeding and OAuth provider configuration require live development-project verification.
- Signed-in browser tests use disposable simulated Auth/Data APIs; they do not prove hosted RLS. The owner separately reported hosted learner isolation, login/refresh/sign-out and Profile edit checks passing.
- The fresh dependency audit reports 55 findings: two low, ten moderate, 38 high, and five critical. Forced upgrades were not applied; dependency review remains a release blocker.
- Imported question banks remain draft. Software validation does not approve clinical accuracy or calibrate assessment items.
- This browser audit exercises desktop Chromium and Android-sized Chromium; Firefox and Safari remain unverified.
