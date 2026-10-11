# Rapid Rounds 2.0 — CJIS foundation

This branch contains the initial **Clinical Judgment Intelligence System** contracts. It is **not** a deployed app and contains no scoring implementation.

## Contents
- `competencies.json`: cognitive operations, clinical domains, and complexity levels
- `question.schema.json`: Draft 2020-12 schema for authored questions
- `assessment-policy.md`: provisional evidence and scoring safeguards
- `cases/tavr-conduction-deterioration.json`: five-stage educational case outline (not complete scored questions)

## Known gaps
- Existing app source and question bank are not present on this repository's `main` branch as inspected on 2026-10-10.
- Schema validation cannot by itself enforce unique option IDs, correct-option membership, or clinical accuracy; implement semantic checks and tests before use.
- The TAVR case is a content outline and must not be represented as clinically approved or psychometrically calibrated.
- Need the actual app source, clinical review, and references before UI/database integration.

## Integration sequence
1. Locate or import the canonical application source without overwriting it.
2. Audit current question data and preserve legacy IDs.
3. Implement semantic validators, unit tests, and a versioned migration.
4. Add assessment-event persistence and assistance tracking.
5. Build the progressive case player behind a feature flag.
6. Complete clinical review and test with novice/experienced ICU nurses.
