# Rapid Rounds experience redesign — 2026-10-16

## Delivered for colleague review

- Rebuilt Home, Rounds, Practice, Study and Explore around a shared mobile-first visual language: warm neutral surfaces, dark clinical panels, mint/coral accents, clear touch targets and five-item navigation with an active state.
- Reconstructed a chrome **RR** monogram from the user's description, with a short reveal and one ECG trace. The exact original metallic animation was not found in the available repositories. The older flat R and phone-logo implementations remain reference history, not evidence of the requested animation. Motion is disabled when reduced motion is requested.
- Made all six clinical judgment pillars interactive and linked each to its study unit. Registry identifiers remain aligned with the existing competency JSON; visual emphasis does not imply validated item mapping or clinical endorsement.
- Replaced the Practice dropdown with searchable/filterable topic cards. Standard radio answer cards require a deliberate Check answer action. Feedback precedes progression, skips remain nonresponses, and a round summary reports actual responses. Rounds contain up to five items; Continue this topic reaches the next items, preserving access to all 68 questions.
- Replaced the broken database-dependent Rounds list with two complete, fictional guided drafts: sepsis deterioration and post-TAVR conduction change. Each includes six ordered judgment decisions, evolving patient context, vitals, rationales, a debrief and source links. These are guided teaching paths; incorrect responses are debriefed before the common narrative advances. They are not branching treatment simulators or approved scored cases.
- Replaced Study's fabricated completion/rank/activity statistics with six substantive reasoning units, each containing an objective, three reading sections, a reflection and two distinct knowledge checks. First completed pre/post responses are retained locally per unit; reviewing a unit cannot overwrite that baseline. No change in clinical competency or durable educational benefit is claimed from two checks.
- Reworked testing-category discovery into four clinical areas with actual available bank counts and working deep links, rather than invented scenario counts.

## Clinical review boundary

All new cases are authored educational drafts. No SME approval or calibration has been applied. The existing clinical assessment policy remains in force. Study records are browser-local educational activity, not production assessment evidence. No authentication, production database, payments or AI service was enabled by this redesign.

Clinical references used for the new teaching drafts:

- [NICE NG253: managing suspected sepsis](https://www.nice.org.uk/guidance/ng253/chapter/Managing-suspected-sepsis)
- [AHA 2025 algorithms: adult bradycardia with a pulse](https://cpr.heart.org/en/resuscitation-science/cpr-and%20ecc-guidelines/algorithms)
- [ACC pathway: conduction disturbances after TAVR](https://www.acc.org/latest-in-cardiology/ten-points-to-remember/2020/10/20/20/59/2020-acc-expert-consensus-conduction-disturbances)
- [NCSBN Clinical Judgment Measurement Model](https://www.ncsbn.org/public-files/NGN_Winter19.pdf) for framework terminology; no affiliation or endorsement is claimed.

## Executed verification

| Check | Executed result |
| --- | --- |
| Node adapter suite | 8 passed |
| Focused registry/isolation/practice/learning suites | 24 passed |
| TypeScript | Passed |
| Production build, Next.js 15.5.28 / local Node 22.19.0 | Passed |
| Complete browser flow at 390px | Passed: navigation, bank cards, confirmed answers, summary, deep links, six case decisions/debrief, paired study checks/persistence, reduced motion; no external requests or page errors |
| Complete browser flow at 1440px | Passed with the same boundaries |
| Narrow/dark browser check | Passed: six routes fit at 320px; four dark-mode routes had no axe WCAG 2 A/AA violations. This automated scan is not a complete accessibility certification. |
| Full Vitest regression suite | 79 passed, 14 failed; 8 failed files including 3 suites that could not load, 6 passed files. The previously reported legacy failures remain visible. |

Screenshots were rendered and visually inspected. Browser testing caught a return-navigation hydration mismatch, repaired by keeping the first active-navigation render independent of the server pathname. A failed test assertion against split count markup was corrected without weakening the persistence test. A content-access check caught the need to continue beyond the first five legacy questions.

The deploy target remains the separate `rapidrounds-cjis-review` project, Preview (`staging` in the deployment API). Main and the existing Rapid Rounds production project are preserved. No production database changes are part of this work.
