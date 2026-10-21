# Evolving cases and source review — October 21, 2026

## Source review

Six supplied PDF paths resolve to four distinct scanned documents, totaling 32 unique pages. Text was extracted with local Windows OCR and checked against rendered page images. The three photos are small (240 × 320 pixels); their care-planning, clinical-judgment and concept headings are useful, but their fine print is not reliable enough to establish answer keys.

| Local source identity | Pages | SHA-256 prefix | Concepts used |
| --- | ---: | --- | --- |
| PDF A, temporary attachment | 7 | b0fc2845a403 | Person-centred care, nursing process, communication and reflective reasoning |
| PDF B, Downloads attachment | 4 | ea5d0c16d1be | Clinical judgment, changing evidence and reflection |
| PDF C, Downloads attachment (1) | 4 | 839075ec5ced | Circulation, neurologic change, treatment risks and changing priorities |
| PDF D, Downloads attachment (2) | 17 | 17a0b174d445 | Infection/inflammation, meningitis, pancreatitis, abdominal assessment, cellulitis, nutrition and immune context |

Downloads attachments (3) and (4) are exact duplicates of PDF C, not additional source coverage. Original files were not edited. Raw scans, OCR text, workbook questions, illustrations and model pages are not included in the application or Git commit.

The new material is original fiction informed by these concepts. Case-specific textbook orders are not universal protocols. Primary context was checked in NICE NG240, NG104, NG141, NG158, NG20, NG197 and NHS appendicitis information; links and sections are maintained in `lib/learning/sources.ts`. Human clinical review, local-policy review and permissions for any future reproduction remain outstanding. The uploaded medication tables were not converted into prescribing tools.

## Implemented content

- Six additional evolving case families: fever/neurologic change, pancreatic inflammation/fluid balance, local infection/systemic change, circulation/bleeding, changing abdominal symptoms, and nutrition/diagnostic context.
- Two authored clinical paths per family, with different history, observation trends, contextual details and at least one changed decision. There are 72 scripted checkpoints across the 12 paths. They are related versions, not 72 independent cases. The original six guided cases remain available.
- 36 additional case-linked questions in six collections, with explanations for every option and reflection prompts. Together with the existing 100 catalog questions, the application has 136 question items. Shared case families prevent treating case and question exposure as independent transfer evidence.
- Foundation uses single best answers and immediate feedback. Challenge asks learners to combine two relevant elements and gives feedback after each decision. Advanced uses the complex questions, requires a reasoning note and holds feedback until debrief. Notes and confidence are not automatically graded. These are editorial support/demand levels, not calibrated measures of expertise.
- Five- and ten-question knowledge checks have topic and editorial difficulty filters, unique items within a check, saved progress and feedback after the final submission. No speed bonus or validated competency score is introduced.
- Ten related glossary entries expand the reference to 42 terms, with six existing source-specific adult value examples. Foundation/Challenge cases can open definitions in context; Advanced keeps the case text unlinked. Reference use before a case decision is marked as assistance in its debrief.

## Variety and continuity

A new attempt alternates between two authored paths and changes option positions. A saved attempt pins the path, level and option order; reloading does not silently randomize the clinical information or erase a selected answer. Replaying archives the prior attempt locally. This is bounded authored variety, not unlimited generated scenarios.

The default return behavior pauses the saved moment. A learner can opt into a handoff offer after at least 30 real minutes away. The offer allows resuming the saved moment or advancing exactly one authored clinical checkpoint. Advancing records the pending decision as unanswered before handoff, not incorrect. Confirmed answers remain unchanged. An already committed decision is not replaced. Clinical story time is explicit; elapsed wall-clock time does not calculate a patient’s physiology or imply that urgent care should wait.

Observations are authored trends displayed in a table. The system does not model medication effects, calculate treatment-response physiology, punish inactivity, send background patient alerts or claim to be a real-time monitor. More sophisticated action-dependent clinical branches require additional authored outcomes and clinical review; current choice-dependent support is formative explanation.

## Streamlined interface

Settings now separate Guided introductions from Focus interface. Focus removes introductory hero copy and descriptions while retaining headings, clinical information, navigation, sources and review notices. Quick checks and evolving cases are directly accessible. Default reasoning level and return behavior are device preferences. Focus mode does not create or verify a paid subscription; entitlement enforcement, billing integration and account synchronization are outside this preview change.

## Verification and release boundaries

Tests exercise content structure and keys, stable replay/resume, malformed session rejection, opt-in elapsed-time handoffs, preservation of confirmed choices, advanced feedback timing, saved drafts, ten-question checks, display preferences and device-local activity. Software tests do not provide clinical approval or validate difficulty labels. Exact executed totals and deployment commit are reported in `VERIFICATION.md` and the delivery report.

Main, the original production deployment and production database remain outside this work. Clinical review/calibration, physical-device/assistive-technology testing, account/backend integration and a production release decision remain required.
