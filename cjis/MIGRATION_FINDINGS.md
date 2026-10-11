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
