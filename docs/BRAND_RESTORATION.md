# Branding, theme and scenario repair — October 15, 2026

See [VERSION_LINEAGE.md](VERSION_LINEAGE.md) for the archive checkpoint, recovered prototype, source provenance and continuing development plan.

## Changes and verification

- Home, header/navigation and RR catalog use the approved RR/ECG, cyan/emerald and ink direction. The new entrance is an inline reconstruction, optional/replayable and disabled for reduced motion, not the missing original orbital animation.
- Shared cards and Study headings use paired theme tokens; global nested-text overrides and duplicate dark wrappers are removed. Initialization, refresh, system preference and cross-tab state share `html.dark`.
- Six available RR cards resolve to bundled practice players: the five existing deep links plus the recovered five-stage TAVR learning case. Answers lock after submission, each decision shows reasoning, and completion offers a clean retry. Draft practice does not award XP or competency scores. This does not install or seed the hosted RR schema.
- Auth/profile/security migrations and existing test-bank answer meanings are preserved. Home navigation coverage follows the new accessible links. The older standalone sign-in fixture now supplies the API version header expected by the Auth SDK.

Local checks: 186 unit tests in 24 files pass; Sprint 4 validation, type checking, migration provenance, all 11 legacy bank files and 17 staging datasets / 168 draft items pass. Node 20 production build passes. Existing lint warnings remain nonblocking.

The owner pasted layout source, with no error line or stack message. The source compiles; the duplicate manual document title was removed. No diagnosis of an unreported local exception is claimed.

Desktop/mobile Chromium checks are added in `e2e/brand-scenarios.spec.ts`: repeated dark/light switching with measured heading contrast, all six RR routes, complete v3 practice/retry, and nonblocking reduced-motion branding. The CI workflow also runs the full Google/email/Profile simulator suite and the existing UI regression suite. Current CI results must be read before treating browser verification as complete.

No new database operation, production deployment or main-branch change is part of this repair. Clinical accuracy/review, calibrated ability scoring, account-isolated cloud practice history, live provider consent/mail delivery, billing, and Firefox/Safari coverage remain separate readiness work.
