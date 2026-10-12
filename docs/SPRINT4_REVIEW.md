# Sprint 4: application migration and CJIS integration

## Review target

Review branch: `sprint4/cjis-source-migration`.
Pull request base: `feature/cjis-foundation`.
The PR is a draft. Main and the production database have not been modified. No deployment, database migration, seed, or remote setup script has been run.

## What changed

1. Imported the canonical root application from `cliffobm/RapidRounds`, pinned to commit `9094ae6ddc97ec2c99e4d26fe88d11f661ad20fe` (source commit dated 2025-10-02). This is the verified GitHub source, not an assertion that it contains later work from other environments.
2. Imported 273 source/config/content/test files. Retained the two committed Playwright reference images. Excluded 296 files: OneDrive copies, machine-specific `-EliteBook` copies, generated reports, archives, duplicate enhancement bundles, and stray command output. All source blobs were hash-verified before editing. The updated manifest records 203 unchanged imports and 70 intentional changes, including subsequent blocker repairs.
3. Removed embedded database JWTs, including privileged setup-script credentials, OpenAI API keys, and remote database fallbacks. Development defaults use localhost and a placeholder key. Environment examples use UTF-8. Credentials from the original private repository are not published in this migration; rotation of existing credentials remains an administrator task.
4. Added a lossless draft adapter for wrapped letter-key banks and respiratory arrays with explicit zero-based numeric answers. Invalid or ambiguous keys fail validation. Original payloads, item identities, answer meaning, rationales, tags, assets, and bank metadata remain available.
5. Added a bridge to the original 10-bank registry, validated versioned competency sidecars, and a development-only read endpoint. The endpoint and CLI do not write to any database. The quiz catalog, game scoring, scheduler, local storage keys, and progress models are preserved.
6. Added Draft 2020-12 JSON Schema validation with pinned Ajv 8.17.1, registry consistency checks, answer membership, unique options, nonblank rationale fields, and complete distractor explanations. Competency evidence eligibility requires approved/referenced/calibrated authored records. Migration never grants those statuses.
7. Separated native Node, Vitest, and Playwright discovery; made unit runs deterministic; fixed one inherited exact-optional-property TypeScript error. Restored blocking build type/lint gates. CI targets the development workflow, uses localhost placeholders, and retains failing legacy gates.

## Verification on 2026-10-12

Current local validation uses Node 20.20.2 (matching the Node 20.x CI major version). Initial migration verification used Node 24.19.0. CI status must be reviewed separately.

| Check | Result |
| --- | --- |
| `npm ci --ignore-scripts` | Passed with the locked source dependencies |
| `npm run migration:verify` | Passed: 203 unchanged imports, 70 documented changes, 296 excluded files absent |
| `npm run typecheck` | Passed |
| `npm run test:cjis` | Passed: 12 native Node tests and 16 Vitest integration/regression tests |
| `npm run cjis:validate` | Passed: 17 datasets / 168 draft items |
| `npm run qbank:validate` | Passed: 11 wrapped legacy banks |
| Local Next development API smoke | Passed: catalog has 10 banks; acute MI response preserves item/bank identity |
| Local `/quiz` HTTP smoke | Passed: HTTP 200 and route compilation; component regression also selects a bank and submits an answer |
| `npm run test -- --maxWorkers=2 --minWorkers=1` | Passed: 10 test files / 95 tests, including server-owned profile timestamp payload |
| `npm run lint` | Passed: no blocking errors; inherited warnings remain |
| `npm run build` | Passed: complete production build on Node 20.20.2, with lint and type gates enabled |
| Focused production browser checks | Passed: 4 checks across desktop Chromium and mobile Chrome; bank selection, shuffled correct-answer submission, and production preview gating |
| Full browser suite | Initial desktop run: 36 passed / 8 failed; repaired run: 42 passed / 2 failed, with final scenario rerun 14/14 passed. Signed-in profile/bookmark coverage remains unresolved; mobile run and fresh CI add broader coverage. |
| Isolated PostgreSQL schema/RLS audit | Passed at `76676cb3a6611b12a99d15c967d364334c8d0e97`: all five migration scripts; initial and complete schema learner/educator reads, own/cross-user edits, privilege escalation denial and role revocation; billing/trial field protections. Full Supabase Auth/PostgREST application integration remains unverified. |

Focused regression checks cover every source question's answer meaning and original payload, shuffled-answer grading for the registered banks, quiz bank selection/submission, existing speed/incorrect/unanswered scoring, scheduler outcomes, persistent learner progress, registry sidecars, malformed data, and preview gating. They do not establish full production equivalence. The focused browser run still reports missing-asset/auth-placeholder network failures; it asserts no uncaught page errors, not a clean console across every route.

The original baseline mixed Playwright/native tests into Vitest and reported 13 failing files. Correct discovery initially left 14 executed legacy failures plus 3 collection failures. Those blockers are now repaired through native Vitest mocks, actual query builders, correct client targeting, missing helper imports, and semantic interaction assertions. No failing test was skipped or gate disabled.

## Merge blockers

- Review fresh Node 20 CI results, then complete the full browser suite and isolated test-database checks before marking the PR ready. Lint, legacy unit, type, and build blockers are repaired locally.
- Review the original source's database and OpenAI credential exposure and rotate affected credentials through the administrator workflow before deployment.
- Author and clinically review competency mappings and complete rationale/reference data before enabling any scored CJIS assessment. The TAVR file remains an outline, and no imported item is approved or calibrated by this sprint.

## Blocker repairs

- Isolated loaded student/educator dashboard components from missing-user early returns; added missing/loaded/removed-user regression tests. Student progress loads ignore stale responses after unmount or user changes.
- Corrected internal links and JSX escaping; removed an obsolete lint directive and unnecessary mutable declarations. No lint rules were disabled.
- Updated database tests to thenable query mocks that support repeated filters, ordering, and actual ranking. Added assertions for user/type filters and free-rationale consumption; auth tests mock the client actually used by the store.
- Corrected missing-profile rationale access, displayed existing scenario allergy data, and removed fabricated leaderboard ranks for missing users. These intentional behavior corrections do not change scoring of actual learner attempts.
- Production browser verification exposed pointer capture swallowing answer-button clicks in the legacy swipe handler. Interactive targets now retain native pointer/touch interaction; swipe handling remains on the card surface.
- Awaited the Next.js 15 dynamic route params in `/rr/[code]` to satisfy generated PageProps types.
- Bank validation uses the tsx import loader rather than its CLI IPC socket. Playwright can bind explicitly to localhost and start a production server through `PLAYWRIGHT_SERVER_COMMAND`.

## Reproduce locally

```bash
npm ci --ignore-scripts
npm run validate:sprint4
npm run qbank:validate
npm run test -- --maxWorkers=2 --minWorkers=1
npm run lint
npm run build
PLAYWRIGHT_SERVER_COMMAND="npm run start -- --hostname 127.0.0.1" npx playwright test e2e/sprint4-quiz.spec.ts --project=chromium --project="Mobile Chrome" --workers=1
```

Run migration verification before browser tests, or move generated Playwright reports out of the source tree before repeating it; the import verifier rejects excluded source artifacts present under their original paths.

Use a separate local/staging database for application integration; supply its environment values explicitly. The production database is outside this sprint. In local development, `CJIS_PREVIEW_ENABLED=true npm run dev` enables the staging API. Production mode always blocks it.

## Rollback

Close the draft PR to leave `feature/cjis-foundation` at its current foundation commit. If this review branch is later merged into the development branch, revert the migration commit after review. There are no database changes to roll back.


## Next verification phase — 2026-10-12

- GitHub push and pull-request runs at commit `47de3f3f54343dd2a8b629a8096c986c15d630a3` both passed the existing Node 20 workflow (including production build).
- Running every Chromium test revealed 8 failures / 36 passes. Several passing legacy tests conditionally check a feature only when it is present, so the pass count alone does not establish feature coverage.
- Corrected ambiguous leaderboard selectors, removed a duplicate Testing Categories h1, added a working skip link, and labeled the scenario region and bookmark control. The progressbar now labels the actual bar instead of the whole interactive deck.
- The inherited screenshot test claimed to measure layout shifts but used missing platform-dependent reference images. It now measures actual browser layout-shift entries against a 0.1 threshold, without creating an unreviewed visual baseline.
- Added a blocking disposable PostgreSQL 16 CI audit. It replays the unchanged legacy SQL in a fresh database and independently tests the initial learner profile RLS with synthetic auth claims. No hosted connection, Supabase login/link, real user data, or production secret is involved. This is SQL/RLS verification, not full Supabase Auth/PostgREST application integration.
- Static inspection identifies duplicate policy/trigger creation across `002_enhanced_schema.sql` and `003_complete_schema.sql`, plus a profile SELECT policy that queries the same RLS-protected profiles table. The new audit will determine the actual runtime errors. No legacy SQL was changed to conceal them.
- The protected profile/bookmark test lacks an authenticated fixture and profile bookmark implementation; it remains a review gap. Auth/trial tests also use obsolete storage fixtures and weak conditional assertions. Full signed-in coverage requires a reconciled disposable Supabase schema and actual test users.

The PR remains draft until the new gates and remaining application/database gaps are resolved.

The repaired Chromium run improved to 42 passes / 2 failures; one remaining navigation failure was another ambiguous text selector and is now replaced with explicit button/state assertions. The protected profile/bookmark check still requires an actual signed-in fixture and implemented bookmark presentation. Both the complete browser suite and database audit now run as blocking CI jobs.


## Historical database blockers — repaired in the development candidate

The [disposable PostgreSQL audit](https://github.com/cliffobm/RapidRounds-2.0/actions/runs/38251697440) ran on PostgreSQL 16.15 and produced these failures:

1. `001_initial_schema.sql`, `002_enhanced_schema.sql`, and `002_profile_options.sql` apply successfully. `003_complete_schema.sql` aborts with `trigger "update_categories_updated_at" for relation "categories" already exists`. Migration 003 duplicates schema objects from migration 002. Later migrations are intentionally not treated as verified after this failure.
2. On a separate fresh initial-schema database, a learner with synthetic authenticated claims cannot read their own profile: `infinite recursion detected in policy for relation "profiles"`. The educator SELECT policy queries the same table it protects.

The audit fails its CI gate and preserves a JSON artifact. No hosted database is involved and no RLS policy was bypassed to make the check pass. The synthetic auth fixture models claim lookup only; it does not verify Supabase Auth or the REST API.

Required follow-up: reconcile the canonical legacy schema and migration order, repair profile authorization without relying on user-editable claims, test own-user and other-user reads/writes under RLS, then create actual disposable Supabase users for signed-in browser tests. Bookmark persistence and its profile presentation also need real assertions; existing conditional browser passes do not prove those features.

Current verification at commit `b85b6c6b308dec9e5cde8248b75aa5184605702a`: GitHub `sprint4` and `legacy-regression` jobs pass; the new database gate fails for the two confirmed defects. All 14 desktop scenario-flow tests pass locally after the navigation repair. The PR remains draft.


## Database repair candidate — development only

- Migration 003 and the design-revamp script replace conflicting timestamp triggers before recreating them. The revamp extends existing tables explicitly, preserves their original required content fields, and uses deterministic UUIDs for previously invalid demo IDs. Question bank identifiers remain unchanged.
- Initial profile authorization now reads a protected `private.profile_roles` registry instead of recursively querying profiles. Administrative profile inserts/role changes synchronize it using an invoker trigger. Authenticated users can read only their own registry row and cannot modify it. Existing educator/admin access follows the same database-owned role and revocation takes effect immediately.
- Profile column grants permit ordinary profile edits and deny learner updates to identity, role, tenant and billing/trial fields. Learner/educator reads, own/cross-user edits, escalation attempts, untrusted metadata and role revocation are exercised against both the initial and full replay schemas.
- Legacy leaderboard views use invoker security; revamp functions retain the caller's privileges rather than bypassing RLS.
- These changes repair the unmerged development bootstrap. They are not a deployment migration for an already-populated hosted project, and none has been run against production. Full Supabase Auth/API/browser verification remains a separate requirement.

The disposable PostgreSQL audit will validate this candidate; no passing database result is claimed until the CI queries complete.


## Database repair verification — passed

The [GitHub audit run](https://github.com/cliffobm/RapidRounds-2.0/actions/runs/38253356986) at `76676cb3a6611b12a99d15c967d364334c8d0e97` passes all five migration applications, both initial/full profile isolation suites, and billing/trial escalation-denial checks. These queries execute as ordinary `authenticated` and `anon` PostgreSQL roles; superuser privileges are used only to create fixtures and exercise administrative role revocation. RLS remains enabled.

The fixes include the additionally discovered reserved `full` rationale-column identifier, duplicate revamp profile policies/triggers, missing columns on preexisting tables, invalid demo UUID literals, and omitted legacy-required JSON content in demo inserts. SQL sample IDs now use stable UUID v5 values; source question bank identities are preserved.

Client profile updates no longer write the server-owned `updated_at` column. The added unit regression verifies the store sends only the actual edited field and retains the returned profile. All 95 unit tests and local type checking pass; GitHub Sprint 4 checks also pass on the repair commit.

The blocking SQL/RLS audit is resolved. Remaining readiness work concerns actual Supabase Auth/API integration, meaningful signed-in bookmark/trial tests, and mobile browser failures. The PR stays draft; no deployment or hosted database operation has been performed.
