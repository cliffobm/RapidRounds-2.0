# Rapid Rounds 2.0 — CJIS foundation

This development workflow contains the **Clinical Judgment Intelligence System** contracts and the imported Next.js application. Sprint 4 adds a staging bridge; it does not replace the legacy game scoring or release a competency assessment.

## Contents
- `competencies.json`: cognitive operations, clinical domains, and complexity levels
- `question.schema.json`: Draft 2020-12 schema for authored questions
- `assessment-policy.md`: provisional evidence and scoring safeguards
- `cases/tavr-conduction-deterioration.json`: five-stage educational case outline (not complete scored questions)
- `legacy-qbank-adapter.mjs`: preserves letter-key and zero-based-answer datasets as drafts
- `validation.mjs`: JSON Schema, registry, cross-field, and evidence-status checks
- `../qbank/cjis.ts`: bridges the existing bank registry to CJIS without mutating `BANKS`
- `../docs/SPRINT4_REVIEW.md`: verification results and merge blockers

## Known gaps
- The application has been imported into the Sprint 4 review branch. Main remains the original foundation placeholder.
- Semantic validators now enforce unique option IDs, answer membership, complete distractor rationales, and registry membership. They cannot verify clinical accuracy or calibration.
- The TAVR case is a content outline and must not be represented as clinically approved or psychometrically calibrated.
- Drafts need explicit competency mappings, complete pathophysiology-first rationale authoring, references, and clinical review before release. The legacy test/lint failures are recorded as merge blockers.

## Integration sequence
1. Completed: import a pinned canonical source snapshot with a provenance manifest.
2. Completed: audit 17 datasets / 168 items and preserve legacy IDs, answers, and rationales.
3. Completed: implement registry/schema/semantic validation and regression tests.
4. Add assessment-event persistence and assistance tracking.
5. Build the progressive case player behind a feature flag.
6. Complete clinical review and test with novice/experienced ICU nurses.

## Development preview
Set `CJIS_PREVIEW_ENABLED=true` only in local development. `GET /api/cjis/banks` lists the existing 10 registered banks; `GET /api/cjis/banks?bank=acute_mi` returns a staging envelope with the original bank and draft items. Unknown keys return 404. The endpoint is disabled by default and always returns 404 in production.

The seven datasets outside the original bank registry are audited by the CLI and retained on disk; this sprint does not silently expand the legacy quiz selector.

Run `npm run validate:sprint4` and `npm run qbank:validate`. Run `npm run test`, `npm run lint`, and `npm run build` for the separate legacy merge gates.
