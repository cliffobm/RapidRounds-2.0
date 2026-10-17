# Personal settings and original-brand landing page

Implemented on `feature/cjis-foundation`, October 16, 2026. Main and the production database are unchanged.

## Experience

- `/` is a dedicated welcome page. `/home` retains the learning dashboard; the Home navigation points there. Direct practice, rounds and study links still work.
- The header exposes Settings on mobile and desktop, including during a practice round.
- `/settings` replaces an inherited account settings mock-up with working device preferences. It contains no account, password or server-side profile operations and is available without authentication. `/profile` and `/admin` retain fail-closed authentication.
- Light, dark or live system appearance; standard, large and extra-large text; stronger contrast; reduced decorative motion. OS reduced motion always takes precedence. The original introduction plays only after a deliberate tap and has a stop control and still-image fallback.
- Optional preferred name, pronouns, age range, discipline, unit and experience; a private learning intention and weekly session/duration targets. Name and goal appear on `/home`. Targets are not claimed as completed sessions, clinical competence or learning gains.
- Versioned, validated local storage; visible storage failure state; cross-tab preferences; deliberate reset with confirmation. Reset leaves study results and imported calendar events intact. Nothing syncs across devices, preview domains or accounts.
- Calendar export creates a repeating daily, weekday or weekly `.ics` event at a floating local wall-clock time, with the chosen session duration and a requested alert 5 minutes before. Users must import/confirm the event in their calendar. Google Calendar requires importing on a computer, after which the event can sync to the phone. Calendar notification settings control delivery. No website push scheduler, email, notification permission or background service is involved. Editing preferences does not update an imported event; the UI explains how to replace it. No profile, private goal, deployment URL or share token is exported.
- Home-screen shortcut instructions explicitly retain the internet requirement. This does not claim offline/PWA functionality.

## Original brand provenance

Recovered from the user-supplied colleague pilot at `https://rapidrounds-cardiac-pilot--colleagues.expo.app/`. Assets are served locally from this repository; there is no runtime dependency on the pilot.

- `public/brand/rapidrounds-metallic.png`: original `assets/assets/rapid-rounds-geometry-poster.0dee4ef9f1aabf5cf50721488c515e73.png`, 960×960. SHA-256 `797e6747da86950499ddeb3c1f8153d5a99c2f94c54a386006d621f8500d562d`.
- `public/brand/rapidrounds-intro.mp4`: original `assets/assets/rapid-rounds-geometry-intro.c9ede8709869004d13751a38d6fed2e2.mp4`, 522,331 bytes. SHA-256 `28e2588a26797ff6efb0840de394dcb2ff04cfae6de5362d9535c70c9d456a15`.

The similarly named `logo-orbit` asset is a different purple/teal flat logo; it is not used. The reconstructed chrome SVG has been replaced with the original metallic poster in shared branding.

## Rendering and device state

The header, metadata and main landmark remain server rendered. `BrowserPage` mounts page content after the browser is ready and wraps pending content in an explicit Suspense boundary. This avoids an intermittent React 418 recovery observed with the inherited streamed shell while applying browser preferences. Navigation and theme subscriptions are isolated from the page container; preference consumers use a stable `useSyncExternalStore` server snapshot. No recovery errors are filtered or suppressed by tests.

Tradeoff: page content requires JavaScript and initially shows a preparation message. Non-JavaScript clients receive the header and preparation view. This is a browser learning app review build, not a statically rendered marketing site. The inherited full-screen root loading component was removed. All temporary React diagnostic instrumentation was restored before verification and is absent from the source and final build.

## Verification

- `npm run test:cjis`: 8 passed.
- `npx vitest run lib/cjis components/qbank/LegacyPractice.spec.tsx components/learning/Experience.spec.tsx components/settings/Settings.spec.tsx`: 30 passed, including 6 new settings/calendar checks.
- `npm run typecheck`: passed.
- `npm run build`: passed using local Node 22.19.0 / Next 15.5.28.
- `npm test`: 85 passed, 14 failed; 8 failed files (including 3 suite-load failures). The inherited failures remain in auth, rationales, AnswerBlock, OrderQuestion, ScenarioCard, dashboard and database suites, matching the prior failure categories. The six new settings checks pass. CI retains the full failing legacy job.

- `npx playwright test --config playwright.cjis.config.ts`: 7 passed against the production build, with page-error detection. Covers the existing clinical learning flows at 390/1440px, 320px layout, the landing video, profile/theme/goal persistence at 320/390/1440px, actual calendar downloads, live system theme changes, OS reduced motion, account/admin access boundaries, and WCAG 2 A/AA axe checks on landing, settings, home and an open practice question in dark/high-contrast/large-text mode. This is not a complete accessibility certification.
- Browser checks also exposed and repaired a missing progressbar role. Visible-only assertions avoid matching hidden rendered copies; accessibility scans wait for visible page content and disable decorative motion before checking settled contrast. Diagnostic and repeat runs were interrupted by computer suspension (including `ERR_NETWORK_IO_SUSPENDED`); interrupted runs are not claimed as passing.

Physical-device calendar import and OS alert delivery require device testing; automated browser tests verify the actual downloaded calendar content, not notification delivery.

References: [iCalendar RFC 5545](https://www.rfc-editor.org/rfc/rfc5545), [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API), [React server snapshots](https://react.dev/reference/react/useSyncExternalStore), [Google Calendar import](https://support.google.com/calendar/answer/37118).
