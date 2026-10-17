# Content expansion — 2026-10-17.2

This revision adds original educational drafts to the review application. It does not establish clinical competence, validated competency mappings, or a passing standard. Human clinical review is pending.

## Coverage

- Four fictional guided cases: chest discomfort, sudden neurologic change, increasing work of breathing, and fluid-loss/perfusion concerns. Each has six decisions, option-specific explanations, a reasoning walkthrough and a missing-information prompt. Together with the existing sepsis and TAVR cases, the application has six cases and 36 decisions.
- 32 authored questions, four in each of eight previously thin collections. Original imported items and keys remain intact. Total practice inventory: 100 items (68 imported, 32 authored). Every collection now has at least five items; item quantity does not establish adequate topic coverage.
- A searchable glossary with 32 terms, abbreviations and spelling variants, plus six source-specific adult value examples. Entries connect definitions to reasoning habits. Values include units, context, source links and laboratory/population limitations; they are not universal clinical targets or critical-value cutoffs.

| Collection | Imported | Added | Total |
| --- | ---: | ---: | ---: |
| Acute MI | 1 | 4 | 5 |
| Heart sounds | 1 | 4 | 5 |
| Multisystem shock | 1 | 4 | 5 |
| Neurology | 1 | 4 | 5 |
| Pulmonary | 1 | 4 | 5 |
| Sepsis/septic shock | 2 | 4 | 6 |
| Anaphylaxis/MODS/trauma/sedation | 4 | 4 | 8 |
| Scenario vignettes | 2 | 4 | 6 |
| Hypertensive crises | 25 | 0 | 25 |
| Vascular | 30 | 0 | 30 |

## Reasoning and provenance

Questions use cue clusters, trends, alternative explanations, uncertainty, escalation, communication and reassessment. New authored questions carry editorial skill tags, individual distractor explanations, reflection prompts and source context. Neither imported nor authored practice contributes competency-eligible evidence. Guided cases remain formative, scripted exercises.

Source metadata is centralized in `lib/learning/sources.ts`. Primary context includes NICE deterioration/fluid/sepsis guidance, AHA/ASA resources, FDA oximetry guidance, AHRQ reasoning resources, Merck cardiac auscultation and MedlinePlus value examples. The 2019 AHA quality-program document supports the distinction between last-known-well and symptom-discovery times; it is not presented as current treatment-eligibility guidance. Sources inform original drafts; they do not imply publisher endorsement, clinical signoff or clearance to reproduce third-party material.

## Reference assistance and persistence

The glossary is available from the application header, study page, guided cases and an expandable shelf inside practice. Opening the shelf or an inline reference card before confirming an answer records assistance in the device-local practice response. A selected answer survives the lookup; confirmed answers and assistance survive reload. Opening references after feedback does not retroactively change the response. Assistance counts reference openings, not a verified count of definitions read. References opened in another browser tab or outside the application cannot be detected; these records are formative, not proctored. See `INLINE_REFERENCE_CARDS.md` for contextual card behavior and editorial boundaries.

New case sessions use the expansion revision; existing case revisions are preserved. Practice snapshots validate canonical item identity, responses and assistance fields. Activity validation accepts the four new case routes. No database migration or production data access is required.

## Required clinical review

An educator owner and independent clinical reviewer must verify objectives, keys, explanations, source applicability, terminology, units, local-policy boundaries and content balance against this exact revision before clinical publication. Fictional cases require review for realism and ambiguity. Further content should follow a curriculum blueprint rather than equal item counts alone. No app feature demonstrates learning transfer, clinical outcomes or psychometric validity from this expansion.

Automated verification results and the released commit are recorded in the delivery report; passing software tests does not provide clinical approval.
