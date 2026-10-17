# Content operations and pilot plan

## Intended first release

Provisional audience: nurses developing adult acute-care deterioration reasoning. The review edition is formative learning, outside patient care. It is not an NCLEX-equivalent examination, diagnostic aid, clinical decision support tool, or institutional competency signoff. Confirm the intended audience with the product owner before expanding the curriculum.

The initial connected pathway uses six foundational units, the guided sepsis case and an independent fictional application exercise. The post-TAVR case is a second guided application. Legacy banks retain their original keys and remain unmapped draft practice; sparse collections are explicitly labeled limited previews.

## Publication workflow

Draft → clinical review → editorial/accessibility review → supervised pilot → approval of an exact revision → publication → periodic review or retirement.

No current learning content is clinically approved. Owners, reviewers and next-review dates must be assigned by qualified humans; an editorial date is not approval. The public `/content-review` inventory displays the current limitations. The existing CJIS registry's eligibility checks are necessary structural gates, not a substitute for review or psychometric evidence. Guided teaching content is not promoted into eligible assessment evidence.

For each item record: objective, learner level, topic, primary judgment operation, case family, complete stem/options, key, rationale for every option, common misconception, source section/page, publication date, local-policy boundary, author, independent reviewer, decision log, exact revision, review/next-review date and media permission. Use the templates in `public/content-intake/`.

For cases additionally record: baseline and trend, timeline, observable versus reported findings, missing data, alternative explanations, scope and escalation, scripted updates, reassessment and debrief. Scripted progression must not be presented as a physiologic response engine. No identifiable patient records should be supplied.

Clinical review must check both clinical accuracy and educational ambiguity: whether more than one option could reasonably be best in the stated setting; whether distractors represent realistic errors; whether the explanation distinguishes them; and whether the action is within the intended learner's role. Resolve disagreements before approval. Pharmacology, devices or other specialist content needs appropriate specialist review.

References and calculators from the inherited application are withheld at their existing URLs. Restoring them requires formula/unit/range verification, edge-case tests, source licensing and clinical approval. Git history retains the original source.

## Source and rights review

- Sepsis source context: NICE NG253, managing suspected sepsis and evaluating risk. The direct managing page returned 403 to the research client on October 17, 2026; official NICE indexed excerpts were accessible. This is not a completed source audit or local-policy review.
- TAVR source context: ACC 2020 conduction-disturbance consensus and AHA 2025 adult advanced life support. Publisher pages were inspected October 17, 2026. No treatment doses are added by this change.
- Original teaching narratives and worked examples are authored drafts, not reproduced guideline algorithms. Linking to a source is not a license to reproduce it or evidence of endorsement.
- NCSBN's official model page restricts the model and skills-card materials to personal/educational noncommercial use. Resolve the permission scope for commercial use of third-party materials before release. Do not reproduce model graphics or claim endorsement by default.
- Require documented rights for supplied ECGs, audio, diagrams, institutional protocols and other media.

## Pilot protocol

1. Assign the clinical owner and review a complete pathway before target learners participate.
2. Recruit learners matching the intended audience and relevant preceptors. Start with a small usability cohort; this is discovery work, not a psychometric validation sample.
3. Observe independent use on physical iPhone/Safari and Android/Chrome, including an interrupted session, screen reader, keyboard and enlarged text. Record where learners hesitate, misunderstand an option or cannot find the next action.
4. Collect feedback on realism, ambiguity, explanation usefulness and confidence. Self-reported confidence is a different outcome from knowledge or clinical performance.
5. Examine first-attempt performance on unfamiliar application cases and later parallel cases. Do not equate speed, completion, repeated exposure or an immediate post-check with clinical competence.
6. Resolve safety/content issues before expansion. Determine outcome measures and a validation plan with an assessment specialist before using passing scores, adaptive claims or institutional signoff.

The new application exercise records first submitted choices and the elapsed interval from a saved guided-case completion. Less than 48 hours is labeled immediate practice; at least 48 hours is only a small delayed application signal. This interval is a product scheduling choice, not a validated threshold for retention. Browser-local records and the device clock are not tamper-resistant assessment evidence. Later visits show the first snapshot; an outcome study needs new parallel forms, consent, a defined protocol and a suitable data system.

## Remaining release gates

- Human clinical review, source/rights clearance and broader reviewed coverage.
- Physical-device accessibility and usability review beyond automated axe scans.
- Stable public-domain and access/support decisions; current previews retain deployment protection.
- Decide whether anonymous device-local learning is sufficient or authenticated cross-device records are needed. Never silently treat browser records as an account record.
- Production authorization/privacy review, recovery and retention policy if a backend is introduced. No production database changes are authorized by this work.
- Monitoring, correction/support ownership, deployment rollback and incident procedures.
- Audit remaining inherited routes before advertising them; a passing test suite does not certify every legacy feature as complete.
- The browser-ready page wrapper still requires JavaScript. Revisit server rendering and landing-page performance before a public marketing launch.
