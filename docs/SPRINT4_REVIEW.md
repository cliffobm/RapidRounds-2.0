# Sprint 4: application migration and CJIS integration

## Review target

Review branch: `sprint4/cjis-source-migration`.
Pull request base: `feature/cjis-foundation`.
The PR is a draft. Main and the production database have not been modified. No deployment, database migration, seed, or remote setup script has been run.

## What changed

1. Imported the canonical root application from `cliffobm/RapidRounds`, pinned to commit `9094ae6ddc97ec2c99e4d26fe88d11f661ad20fe` (source commit dated 2025-10-02). This is the verified GitHub source, not an assertion that it contains later work from other environments.
2. Imported 273 source/config/content/test files. Retained the two committed Playwright reference images. Excluded 296 files: OneDrive copies, machine-specific `-EliteBook` copies, generated reports, archives, duplicate enhancement bundles, and stray command output. All source blobs were hash-verified before editing. The updated manifest records 214 unchanged imports and 59 intentional changes, including subsequent blocker repairs.
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
| `npm run migration:verify` | Passed: 214 unchanged imports, 59 documented changes, 296 excluded files absent |
| `npm run typecheck` | Passed |
| `npm run test:cjis` | Passed: 12 native Node tests and 16 Vitest integration/regression tests |
| `npm run cjis:validate` | Passed: 17 datasets / 168 draft items |
| `npm run qbank:validate` | Passed: 11 wrapped legacy banks |
| Local Next development API smoke | Passed: catalog has 10 banks; acute MI response preserves item/bank identity |
| Local `/quiz` HTTP smoke | Passed: HTTP 200 and route compilation; component regression also selects a bank and submits an answer |
| `npm run test -- --maxWorkers=2 --minWorkers=1` | Passed: 10 test files / 94 tests |
| `npm run lint` | Passed: no blocking errors; inherited warnings remain |
| `npm run build` | Passed: complete production build on Node 20.20.2, with lint and type gates enabled |
| Focused production browser checks | Passed: 4 checks across desktop Chromium and mobile Chrome; bank selection, shuffled correct-answer submission, and production preview gating |
| Full legacy browser suite / database integration | Not verified: isolated populated test database not configured |

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
