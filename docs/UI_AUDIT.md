# Development UI audit

Development branch: `sprint4/cjis-source-migration`. Main and production remain unchanged; no merge, deployment, hosted migration, or seed is performed.

Repairs cover ordering submission and sequence scoring, preserved answers on revisits, adaptive continuation, quiz-bank switching and Next, round bookmarks, mobile practice/leaderboard layout, homepage/study/reference navigation, calculator validation, theme persistence, generator feedback, diagnostics hydration, and missing logo assets. Role authorization reads protected profiles, account requests use authenticated IDs, the privileged example endpoint is unavailable, and RR schema failures show a setup message.

Unconnected account/billing/educator actions and missing lessons are disabled. Sample activity/rank/study progress and device/visit-only data are labelled.

The workspace resumed from an earlier checkpoint after the initial audit. This recovery checkpoint restores the source and tests; verification of this exact revision is in progress. Prior results are not used to certify the restored revision. Final results will be added after fresh validation.

## Verification limits and remaining work

- Cloud Profile bookmarks are not implemented. Round bookmarks reset on reload.
- Practice progress is device-local and not isolated between accounts or synchronized. Study completion is visit-only; some activity/rank/progress data is sample data.
- Authoritative rationale quotas, subscription entitlements, trial activation and checkout require an authenticated backend and billing sandbox tests. Four desktop/mobile integration cases are explicitly skipped.
- Hosted scenario/attempt persistence, achievement retrieval, RR installation/seeding and OAuth provider configuration require live development-project verification.
- Signed-in browser tests use disposable simulated Auth/Data APIs; they do not prove hosted RLS. The owner separately reported hosted learner isolation, login/refresh/sign-out and Profile edit checks passing.
- The dependency audit previously reported 55 findings, including five critical. Forced upgrades were not applied. A fresh audit and dependency review remain release work.
- Imported question banks remain draft. Software validation does not approve clinical accuracy or calibrate assessment items.
- This browser audit exercises desktop Chromium and Android-sized Chromium; Firefox and Safari remain unverified.
