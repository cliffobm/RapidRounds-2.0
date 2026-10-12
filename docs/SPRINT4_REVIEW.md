# Sprint 4: application migration and CJIS integration

## Review target

Review branch: `sprint4/cjis-source-migration`.
Pull request base: `feature/cjis-foundation`.
The PR is a draft. Main and the production database have not been modified. No deployment, database migration, seed, or remote setup script has been run.

## What changed

1. Imported the canonical root application from `cliffobm/RapidRounds`, pinned to commit `9094ae6ddc97ec2c99e4d26fe88d11f661ad20fe` (source commit dated 2025-10-02). This is the verified GitHub source, not an assertion that it contains later work from other environments.
2. Imported 273 source/config/content/test files. Retained the two committed Playwright reference images. Excluded 296 files: OneDrive copies, machine-specific `-EliteBook` copies, generated reports, archives, duplicate enhancement bundles, and stray command output. All source blobs were hash-verified before editing. The manifest records 244 unchanged imports and 29 intentional changes.
3. Removed embedded database JWTs, including privileged setup-script credentials, OpenAI API keys, and remote database fallbacks. Development defaults use localhost and a placeholder key. Environment examples use UTF-8. Credentials from the original private repository are not published in this migration; rotation of existing credentials remains an administrator task.
4. Added a lossless draft adapter for wrapped letter-key banks and respiratory arrays with explicit zero-based numeric answers. Invalid or ambiguous keys fail validation. Original payloads, item identities, answer meaning, rationales, tags, assets, and bank metadata remain available.
5. Added a bridge to the original 10-bank registry, validated versioned competency sidecars, and a development-only read endpoint. The endpoint and CLI do not write to any database. The quiz catalog, game scoring, scheduler, local storage keys, and progress models are preserved.
6. Added Draft 2020-12 JSON Schema validation with pinned Ajv 8.17.1, registry consistency checks, answer membership, unique options, nonblank rationale fields, and complete distractor explanations. Competency evidence eligibility requires approved/referenced/calibrated authored records. Migration never grants those statuses.
7. Separated native Node, Vitest, and Playwright discovery; made unit runs deterministic; fixed one inherited exact-optional-property TypeScript error. Restored blocking build type/lint gates. CI targets the development workflow, uses localhost placeholders, and retains failing legacy gates.

## Verification on 2026-10-12

Local runtime: Node 24.19.0 / npm 11.9.0. Repository CI uses Node 20.x; CI status must be reviewed separately.

| Check | Result |
| --- | --- |
| `npm ci --ignore-scripts` | Passed with the locked source dependencies |
| `npm run migration:verify` | Passed: 244 unchanged imports, 29 documented changes, 296 excluded files absent |
| `npm run typecheck` | Passed |
| `npm run test:cjis` | Passed: 12 native Node tests and 16 Vitest integration/regression tests |
| `npm run cjis:validate` | Passed: 17 datasets / 168 draft items |
| `npm run qbank:validate` | Passed: 11 wrapped legacy banks |
| Local Next development API smoke | Passed: catalog has 10 banks; acute MI response preserves item/bank identity |
| Local `/quiz` HTTP smoke | Passed: HTTP 200 and route compilation; component regression also selects a bank and submits an answer |
| `npm run test -- --maxWorkers=2 --minWorkers=1` | Failed: 8 failing files / 2 passing files; 14 failed tests / 55 passed tests; includes 3 Jest collection failures |
| `npm run lint` baseline | Failed: 33 inherited errors, including conditional hooks, JSX/navigation issues, and an obsolete rule |
| `npm run build` after restoring gates | Application compiled; build failed at inherited lint errors |
| Browser E2E / database integration | Not verified: browser binaries and a separate populated test database were not configured |

Focused regression checks cover every source question's answer meaning and original payload, shuffled-answer grading for the registered banks, quiz bank selection/submission, existing speed/incorrect/unanswered scoring, scheduler outcomes, persistent learner progress, registry sidecars, malformed data, and preview gating. They do not establish full production equivalence.

The baseline mixed Playwright/native tests into Vitest and reported 13 failing files. Correct discovery leaves the same 14 executed legacy test failures plus 3 collection failures; those failures are not hidden or converted into passing assertions.

## Merge blockers

- Repair inherited conditional hooks in both dashboard components and the remaining lint errors.
- Repair legacy Jest/Vitest mocks, auth-client targeting, undefined test helpers, and stale rationale/interaction fixtures. Keep real assertions for the intended behavior.
- Run the full lint, unit, build, browser E2E, and isolated test-database checks on Node 20.x before marking the PR ready.
- Review the original source's database and OpenAI credential exposure and rotate affected credentials through the administrator workflow before deployment.
- Author and clinically review competency mappings and complete rationale/reference data before enabling any scored CJIS assessment. The TAVR file remains an outline, and no imported item is approved or calibrated by this sprint.

## Reproduce locally

```bash
npm ci --ignore-scripts
npm run validate:sprint4
npm run qbank:validate
npm run test -- --maxWorkers=2 --minWorkers=1
npm run lint
npm run build
```

Use a separate local/staging database for application integration; supply its environment values explicitly. The production database is outside this sprint. In local development, `CJIS_PREVIEW_ENABLED=true npm run dev` enables the staging API. Production mode always blocks it.

## Rollback

Close the draft PR to leave `feature/cjis-foundation` at its current foundation commit. If this review branch is later merged into the development branch, revert the migration commit after review. There are no database changes to roll back.
