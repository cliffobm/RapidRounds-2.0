# Rapid Rounds mobile app

The Expo iOS/Android application is in [mobile](mobile/). Existing repository files are preserved.

Start with the [iPhone and TestFlight guide](mobile/docs/TESTFLIGHT_GUIDE.md), [monitoring setup](mobile/docs/MONITORING_SETUP.md), and [app README](mobile/README.md).

From `mobile/`, run `npm ci`, then `npm run health`. The checks use ordinary code and do not call an AI service. GitHub's App health job runs those checks on pushes and pull requests. Weekly runs, issue templates, and dependency proposals become available from the default branch after merge. No workflow automatically publishes an app.

This remains an educational beta: clinical review, owned service accounts, signed builds, and physical-device testing are required before release.
