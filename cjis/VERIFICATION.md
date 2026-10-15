# CJIS integration verification

Local environment: Windows, Node 22.19.0, npm 10.9.3, Next.js 15.5.3. The inherited package engine requests Node 20; GitHub Actions is configured for Node 20. Local results must not be represented as executed Node 20 or hosted CI results.

## Executed checks

| Check | Result |
| --- | --- |
| Dependency installation, `npm ci --ignore-scripts --no-audit --no-fund` | Passed; engine warning for local Node 22 versus requested Node 20 |
| Adapter, `npm run test:cjis` | 8 tests passed |
| Runtime integration, `npx vitest run lib/cjis components/qbank/LegacyPractice.spec.tsx` | 19 tests passed |
| TypeScript, `npm run typecheck` | Passed |
| Production compilation, `npm run build` | Passed, including final header/asset repair; compiler errors are not bypassed |
| Production browser, `npx playwright test --config playwright.cjis.config.ts` | 1 passed using local Microsoft Edge; no external requests or browser runtime errors |
| Full suite, `npm test` | Failed: 74 passed, 14 failed; 8 failed files including 3 suites that failed to load, 5 passed files |

The adapter/registry tests exercise all 68 questions in the ten active catalog banks, including null stems. They verify original answers/options/source preservation, invalid/multi-letter answer rejection, duplicate/malformed content rejection, registry/schema agreement, release gating and practice-only response classification. Client and server query tests and privileged-write tests verify no network call occurs without explicit configuration.

The production browser test verifies competency display, bank selection, correct-answer feedback, advancing, resetting after a bank change, and skipping without competency credit. It caught an external Google Fonts request and a persisted-auth header hydration mismatch; both were repaired before the passing final run. The missing logo was restored from the original component's embedded SVG.

## Known blockers and limits

- Full suite failures remain in `lib/rationales.spec.ts` (3), `store/useAuth.spec.ts` (5), `components/learning/__tests__/OrderQuestion.test.tsx` (4), `components/scenario/ScenarioCard.spec.tsx` (1), and `components/scenario/AnswerBlock.spec.tsx` (1). Three other suites fail to load: dashboard StudentDashboard, database achievements and leaderboard. Failures include Jest APIs used under Vitest, incomplete database mocks, undefined helper functions, and stale/ambiguous UI assertions. They are not excluded from `npm test` or hidden in CI.
- Database/auth, payment and AI features have not been verified against a development service. No production database was accessed or altered. No deployment was requested or performed.
- Clinical SME review, competency mapping, rationale enrichment, source verification and calibration remain necessary for scored release. The TAVR case is still an outline.
- Noncatalog respiratory array-format banks and the additional pulmonary core bank remain preserved source files but are not added to the active catalog by this change.
- Lint is not verified: the legacy `next lint` script/ESLint 9 configuration needs modernization. Builds skip lint but enforce TypeScript checks. Browser-list data and Vite's CJS API emit inherited warnings.
- Practice response records are ephemeral and deliberately provide no competency score or durable assessment evidence. There are no hint/definition controls in this practice UI, so their recorded usage counts are zero.
- Automatic approval review rejected removal of unused copied content tooling. It remains inert source, and none was executed.

## Preservation

The original repository remains unchanged. The 2.0 main branch was inspected at `fc73715d70427b457fc3dd4258a7d54fee8fbb9f`. All implementation commits target `feature/cjis-foundation`; the migration commit is `740972855554422aa48502977c8f0a79ab405108`.
