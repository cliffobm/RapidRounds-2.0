# CJIS v2 question quality

This contract replaces the earlier authoring formula for new or regenerated single-best-answer items. It does not rewrite imported keys or old attempts. The [JSON Schema](question.v2.schema.json) is a versioned authoring format; the [runtime validator and compiler](../lib/cjis/question-v2.ts) also check relationships that JSON Schema cannot express. The v1 adapter and schema remain intact.

The fresh Practice catalog uses 300 original v2 drafts: five Foundation, five Challenge and five Advanced questions in each of its 20 topics. This replaces the 196-item mixed library for new Practice attempts. Both deployed historical revisions (`practice-1:c8409c89`, 136 items, and `practice-1:12faab85`, 196 items) remain available to saved attempts with their original definitions and keys. The original 100 unclassified bank items remain in the explicit legacy entry and historical reviews; they are excluded from fresh Practice. Guided and evolving cases use separate contracts and are not automatically declared v2-compliant by this migration.

The application consumes generated runtime data, rather than bundling the full authoring evidence and JSON validators. A source-to-output equality test and CI check prevent stale generated questions. Authoring skill tags name the clinical judgment operation targeted by a prompt independently of its reasoning level; these tags are not measured skill or competence estimates.

[Three canonical examples](examples/question-v2.examples.json) show the same coronary topic at each reasoning level, including Riley’s Advanced perfusion reassessment. Their output is checked against the authoring sources. Rapid Response has 24 separately revised decisions with more plausible competing priorities and interpretations; its original `2026-10-23.1:5cd9ead9` cases remain readable for saved attempts. The new Rapid Response revision preserves the existing timing and ECG context and changes fresh-attempt questions, choices and rationales.

## Authoring commands

Run these from the repository root:

```sh
npm run cjis:generate
npm run cjis:check
npm run cjis:export -- ../rapidrounds-questions-v2.json
npm run cjis:audit -- ../rapidrounds-questions-v2.json
```

`generate` rebuilds the checked-in learner data after source changes. `check` validates all 300 drafts with the canonical compiler and JSON Schema, enforces topic/level coverage and compares generated output. The curated-bank generator holds flagged items out until the author resolves them; it does not automatically change a question’s level or reduce its clinical complexity. `export` writes the full canonical JSON contract for editorial review. `audit` accepts one canonical question or an array and exits unsuccessfully on structural or cross-field rejection; flags remain explicit review tasks. None of these commands supplies clinical approval or psychometric calibration. They do not call a model, write to a database or deploy the app.

## Revised editorial rubric

The original weights could not produce the requested level profiles inside their stated ranges. The revised weights preserve increasing demand while giving reasoning and distractor quality more influence than cue load:

| Component | Foundation / sparse / plausible | Challenge / moderate / inference | Advanced / layered / multistep |
| --- | --- | --- | --- |
| Reasoning level | 0.15 | 0.40 | 0.65 |
| Cue load | 0.05 | 0.15 | 0.25 |
| Distractor demand | 0.10 | 0.25 | 0.40 |
| Example combined profile | 0.30 | 0.80 | 1.30 |

Foundation's editorial band is 0.30–less than 0.60; Challenge is 0.60–less than 1.00; Advanced is 1.00–1.30. The bands are continuous, including mixed profiles such as 0.55 or 0.95. Arithmetic uses integer hundredths. These numbers are deliberately labeled **editorial load**, not measured difficulty. Out-of-band profiles receive a review flag; the engine does not automatically simplify a clinically meaningful case or promote a question to another level.

The sum cannot establish reasoning level. Foundation requires recognition/interpretation with 2–3 decision-relevant cue units. Challenge requires integration, a trend/timing element and prioritization with 3–5 cues. Advanced requires 5–7 cues, competing evidence, at least two explicit reasoning operations, an uncertainty limit and an anticipated complication, response endpoint or contingency. More words, terminology or repeated findings cannot establish Advanced difficulty.

## The answer-choice contract

Every item has four options and one best answer. Options should address the same clinical task at the same level of detail. A correct option cannot win because it is the only thoughtful, qualified or comprehensive response. Distractors should represent credible competing interpretations, actions, timing or reassessment plans rather than unrelated tasks or obviously negligent behavior.

Each wrong option must state its intended reasoning error, why a learner could reasonably choose it, the particular cue positions it uses or misweights, and why it is not best **in this situation**. The error tags are misprioritization, cue misinterpretation, premature closure and reliance on outdated data. A selected tag is an authoring hypothesis; it does not diagnose the learner's thinking from one response.

The keyed rationale and one-best-answer justification must agree and name the decisive clinical distinction. The debrief explains the judgment skill and what should transfer to a new case. Key cues remain author/review metadata until feedback; displaying them before a cue-recognition question would provide assistance. Scenario text is clinical narrative. Simulation disclosures belong in case information, not within the patient's situation.

## Validation and review

Structural rejection covers malformed records, duplicate options/cues, invalid cue links, missing distractor evidence, mismatched keys/rationales, incorrect score arithmetic and missing Advanced evidence. Scenario length is 4–6 sentences. Text-length bounds are formatting constraints, not evidence that reasoning is present.

Editorial flags cover option-length imbalance, absolutes, generic rationales, weak coverage of competing errors and an out-of-band score. They prompt review; passing heuristics does not establish clinical accuracy, semantic plausibility or the absence of subtle giveaways. Clinical and item-writing reviewers must verify that each alternative is plausible, one answer is best under the stated scope/resources, cues are clinically coherent, sources support the inference and linguistic clues are absent. Approval must identify a reviewer, date and the exact revision; automated import cannot supply human approval.

Every new item is **uncalibrated**. No point-biserial value is inferred from text, an author score or a small practice set. A future calibration study needs item/revision and form identity, representative learner response data, enough correct and incorrect responses, option-selection analysis, item-excluded rest scores, uncertainty estimates and review of dependence, exposure and repeated attempts. Any reported discrimination would describe that sample and testing condition; it cannot guarantee competence or transfer.

These item-writing principles are informed by the [NBME item-writing guide](https://www.nbme.org/sites/default/files/2021-02/NBME_Item%20Writing%20Guide_R_6.pdf). The six existing clinical judgment skill labels remain editorial tags; the app does not inherit the validation or endorsement of the [NCSBN examination framework](https://www.nclex.com/clinical-judgment-measurement-model.page). No official model graphics or skills cards are reproduced. Source/media rights, human clinical review and outcome validation remain release work.
