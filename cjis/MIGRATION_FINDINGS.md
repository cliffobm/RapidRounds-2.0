# Original RapidRounds source inspection — 2026-10-10

## Verified
- Original application is in `cliffobm/RapidRounds` (private); its root contains `app/`, `components/`, `lib/`, `qbank/`, `supabase/`, `package.json` and tests.
- It uses Next.js scripts (`next dev`, `next build`) and Vitest.
- `packages/qbank-tools/src/types.ts` defines `QBankItem` with `id`, `topic`, `difficulty`, `question`, `options: string[]`, `correct_answer: string`, and optional rationale/tags.
- `qbank/banks/acute_mi.testbank.json` uses answer letters (example: `B`).
- The selected `RapidRounds-2.0` repo main branch only had `foundation.md` at inspection.

## Decision
Do not blindly copy the full legacy repository or overwrite 2.0 main. Introduce a lossless draft adapter for known answer-letter items, then migrate the app source after auditing source ownership, build behavior, credentials, and actual question variants.

## Gaps and cautions
- This adapter supports single-answer letter-key items only; additional answer formats need discovery.
- It intentionally leaves competency, complexity and learning objective unset rather than inventing metadata.
- Adapted records are staging records, NOT valid scored CJIS items until enriched and validated against `question.schema.json`.
- A local Node test is provided; CI execution and production integration are not yet verified.
- Do not copy environment secrets, generated build output, test reports or archives.

## Sprint 4 follow-up — 2026-10-12
- Imported 273 canonical files from source commit `9094ae6ddc97ec2c99e4d26fe88d11f661ad20fe`; excluded 296 duplicate/generated/archive files.
- `docs/source-migration-manifest.json` records every imported original blob SHA, exclusion, and intentional change. File bytes were verified before editing.
- Source setup scripts contained embedded privileged database credentials and API keys. Embedded JWTs, OpenAI keys, and remote database defaults were removed from the migration. No database migration or key rotation was executed. Existing credentials should be rotated through the administrator's normal process before deployment.
- Discovery found 11 wrapped letter-key banks and 6 zero-based-answer respiratory arrays. The adapter now supports both explicit formats, rejects ambiguous keys, and retains the complete original item payload.
- The original 10-bank quiz registry remains unchanged. `qbank/cjis.ts` stages its items against the competency registry; CLI checks additionally cover the seven unregistered datasets.
- Local type checking, 28 focused contract/integration/regression tests, the 168-item staging audit, original bank validation, and localhost route smoke checks pass.
- Follow-up repairs pass 94 legacy tests, lint, type checking, and the production build on Node 20.20.2. Full browser/test-database verification and CI review remain required. See `docs/SPRINT4_REVIEW.md`; the PR remains draft.
