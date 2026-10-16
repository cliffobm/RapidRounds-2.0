# Rapid Rounds 2.0 — CJIS development

Development branch: `feature/cjis-foundation`. The original Next.js application was migrated from `cliffobm/RapidRounds` at `9094ae6ddc97ec2c99e4d26fe88d11f661ad20fe`; see [migration provenance](cjis/APP_MIGRATION.md).

## Local practice

```sh
npm ci --ignore-scripts
npm run dev
```

Open `/quiz`, or choose **Practice** in navigation. No database credentials are required for the bundled question banks. Missing database configuration blocks requests instead of contacting the original production project.

The quiz adapts the ten active legacy banks (68 questions) into mobile topic cards and rounds of up to five questions. Continue this topic opens the next set. Original source metadata and answer keys are preserved. Items remain unmapped drafts, and feedback is practice only. Responses, skipped questions, elapsed time, item version, case identity and first/repeated attempts stay in round memory; leaving a round clears them. No competency estimate or database persistence is implemented by this practice flow.

`/rr` offers two complete fictional six-stage guided case drafts with rationales and debriefs. `/study` provides six reasoning units with distinct before/after knowledge checks; the first completed pair per unit is saved on the device. These checks do not establish clinical competence or lasting improvement. The six pillars of the judgment model are explored on Home and Practice. See [experience design and executed checks](cjis/EXPERIENCE_REDESIGN.md).

`lib/cjis/registry.ts` validates the question JSON schema and option/rationale relationships. Its scoring eligibility gate requires approval, calibration and references. This gate is not a scoring model or proof of clinical validity. The TAVR outline remains a draft and is not presented as a released question bank.

## Checks

```sh
npm run test:cjis
npx vitest run lib/cjis components/qbank/LegacyPractice.spec.tsx components/learning/Experience.spec.tsx
npm run typecheck
npm run build
npx playwright test --config playwright.cjis.config.ts
npm test
```

The focused browser configuration tests the production build on local port 3100 using installed Microsoft Edge. Build first. The broader original browser suite has not been validated. The full unit suite currently has legacy failures; see [verification results](cjis/VERIFICATION.md). CI keeps focused CJIS checks and legacy regression checks in separate jobs, with failures visible.

Use a dedicated development environment before enabling database/auth, payment or AI features. No SQL migrations, deployment settings or production credentials were imported or applied. The inherited content import tooling is reference source and has not been run. Production deployment and production database changes require separate approval.
