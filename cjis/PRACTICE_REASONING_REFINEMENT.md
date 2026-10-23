# Practice topics and reasoning feedback — October 23, 2026

## Learner workflow

Practice now opens with a search field, clinical-area chips, topic cards and an explicit **Mixed topics** choice. Six cards are initially shown; **View all 20 topics** reveals the catalog. Searching or filtering displays every match. A chosen topic is named in the setup, and all questions in that attempt come from it. **Change topic** returns to topic selection before an attempt starts. Existing topic deep links, 5/10-question availability, reasoning-level filtering and saved attempts are preserved. Selecting a topic does not change its questions or silently broaden its pool.

Guided Practice and Foundation/Challenge case decisions show a short explanation after confirmation. Knowledge checks and Advanced cases defer feedback until completion. Final answer review retains the learner's answer, correct answer, alternative-option explanations and reflection prompt. The new detailed rationale content adds clinical reasoning, definitions, relevant worked examples, contextual limits, takeaways and reference links. Older bank-specific `/quiz?bank=...` routes also receive brief updated feedback and a completed-round answer review.

## Content added in this revision

All **13 questions** in **Respiratory assessment** (5) and **Critical care essentials** (8) have an original supplemental explanation. These include all existing imported and authored questions in those two collections. Explanations for the other 183 questions retain their existing content; this revision does not claim a full-catalog rationale rewrite.

The ventilation review explains tidal volume (VT), total minute ventilation (VE/V̇E), alveolar ventilation and dead space, separates ventilation from oxygenation, and explains the relevant alternatives. Its arithmetic example demonstrates equal total minute ventilation with different alveolar ventilation; it is not a ventilator prescription. It includes the limits of the abbreviated stem, total versus set respiratory rate, and air-trapping risk.

The rider/GCS 12 review connects altered consciousness and injury mechanism to urgent airway assessment with spinal protection. It explains why imaging does not substitute for stabilization, why GCS 12 alone does not dictate intubation, and the catastrophic-hemorrhage exception in modern trauma sequencing. Existing sparse stems and answer keys are unchanged; their limitations are disclosed rather than filled with invented clinical facts.

Five glossary entries were added: tidal volume, minute ventilation, alveolar ventilation, dead space and Glasgow Coma Scale. The glossary now has **55 terms** and the same six sourced adult value examples. Equivalent labels can open inline reference cards in supported guided text and post-answer explanations. The ambiguous abbreviation **VT** is linked to tidal volume only when its text supplies respiratory context, and not when ventricular tachycardia/arrhythmia is mentioned. Definition access during a check remains unavailable before completion.

## Reasoning without required writing

Evolving case decisions no longer request a written response or impose an Advanced character minimum. Case-specific answer choices, exact required-selection counts, clinical judgment skills, changes across checkpoints and decision review remain. Confidence is not graded. A response earns credit only through its existing answer key; no new inference of overall clinical competence is made.

Saved notes from earlier sessions remain readable in the debrief as **Your saved reasoning note · not graded**. The saved-session schema still accepts those notes, and previous question revisions, option order, drafts, confirmed answers and scores are retained. New sessions do not require or collect written answers in this flow.

The legacy database scenario viewer still supports text-input fixtures and exact-string grading. It is separate from the current evolving Case room and needs a dedicated review before production release; this change does not claim to remove writing from every legacy route.

## Evidence and preservation

The supplemental explanations are stored separately from versioned question definitions. No bank JSON, clinical question stem, option, answer key, question revision, or practice-library revision hash was changed. Existing saved attempts therefore remain eligible for the same score calculation and resume validation. Glossary/reference use after confirmation does not alter the original answer or assistance record.

References include ATS/AARC ventilation guidance, Hamilton Medical's ventilation mechanics, NICE trauma/spinal recommendations, Resuscitation Council UK guidance, SCCM critical-care guidance, FDA oximetry information and AHRQ communication material. Exact references appear with each rationale. New explanations are educational drafts pending human clinical signoff; automated checks are not clinical validation or item calibration.

An unused item, `ventilation_mechanics-adv-005` in `qbank/banks/resp_advanced_40.json`, needs editorial review before admission: a change in inspiratory flow does not by itself establish a reduction in minute ventilation with preserved alveolar ventilation. This item is absent from the current BANKS manifest and the live 196-question library. Its source file and answer key were not altered.

Only `feature/cjis-foundation` and its separate review preview are changed. Main, the original repository, authentication infrastructure and the production database are unchanged. Execution results and the final commit/deployment are reported in `VERIFICATION.md` and on delivery.
