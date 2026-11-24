# Blueprint Rapid Rounds pilot

This pilot implements the approved formative design for newly graduated and newly licensed nurses. The initial context is adult acute care. The main Home action opens `/rapid-rounds`: ten original, evolving patient encounters with four prompts each. The current metallic logo, mint/navy palette and brand line remain in place.

The newer direction supersedes the original foundation document's strict timeouts, reduced retake scoring and speed multipliers for this pilot. Short encounters retain the rapid format. Reading, reflection and clarification do not incur penalties.

## Coverage and outcomes

The supplied NR723 Week 4 assessment-design paper guides the initial 40-prompt blueprint. Each prompt has one primary content category, a dominant Bloom cognitive demand, a specific learning outcome, an answer key and explanations. The six prerequisite checks have no primary CJMM process label. The 34 decision prompts sample all six processes; Bloom and CJMM labels are separate authoring dimensions.

| Primary content category           | Prompts |
| ---------------------------------- | ------: |
| Respiratory deterioration          |       8 |
| Perfusion and cardiac changes      |       8 |
| Infection and sepsis recognition   |       6 |
| Fluid and electrolyte disturbances |       6 |
| Medication effects and safety      |       6 |
| Communication and escalation       |       4 |
| Reassessment and response to care  |       2 |
| Total                              |      40 |

Reassessment also appears as a reasoning process within other primary content categories. Those prompts are not counted twice.

| Cognitive demand | Prompts |
| ---------------- | ------: |
| Remember         |       2 |
| Understand       |       4 |
| Apply            |      18 |
| Analyze          |      16 |

Application and analysis total 85%. These are authoring classifications, not empirically calibrated difficulty estimates. The bank includes 32 single-best-answer items and eight four-row classification items. Each matrix counts once and is worth one point, with 0.25 for each correctly classified row. Matrix scoring never turns four rows into four blueprint items. Warm-up skips are excluded from response totals.

The learner-facing `/blueprint` page derives actual coverage from the same source used by the encounters. It lists every outcome and links directly to each case. Automated checks protect category totals, cognitive balance, formats, complete explanations and unique item IDs.

## Learner experience

- Guided practice is the default: one decision, brief coaching, optional deeper explanation, then the next patient update. An incorrect response never blocks progression.
- Independent practice holds answer explanations until all four first responses are recorded. It is still formative practice.
- Thinking prompts are optional and recorded separately. Guidance seen earlier in an encounter is acknowledged in the debrief.
- No countdown is the default. Optional five- or eight-minute targets pause at expiry and allow continuation without a limit. Time never changes response credit.
- The clock pauses during explanations, feedback writing, explicit pauses and time away from the page. Restored sessions start paused.
- The debrief gives specific evidence from the learner's responses and one next practice target. First-response details are available without a pass/fail headline or an inferred competency score.
- The optional “Build the next clue” activity asks the learner to select a new detail that challenges or strengthens an explanation. Its first choice and retries remain separate from the four core responses. This is a constrained construction activity, not free-form scenario writing or a scored CJMM measure.
- Browser-local history is scoped to the signed-in account or separate offline scope. Up to 30 recent sessions are retained. Home and Progress expose completion and resume links.
- Content revision `2026-11-24.1` is stored with each session. Unknown revisions are rejected instead of silently rescored. Future content edits must preserve prior revisions or explicitly offer a fresh encounter.

## Tester feedback

Flag and clarification controls sit beneath questions in the new rounds and the principal existing Practice, guided, evolving case, Rapid Response, study and legacy practice screens. They record the item ID, content revision, prompt, relevant context, selected response identifiers and whether answer feedback had been shown. Feedback is explicitly submitted; local drafts are not silently uploaded.

Drafts are scoped to account, activity, item and revision. Failed submissions retain the draft and never display a receipt. A client-generated UUID makes retries idempotent. The API accepts at most 20 new reports per tester in five minutes. Same-origin mutation checks, strict schemas and verified identity reject forged owner or review fields.

`/feedback` shows a tester their own reports and reviewer replies. A designated reviewer sees the shared queue and can mark a report Under review, Updated or Explanation provided with a written response. Reviews append an audit trail; they cannot replace the original tester message. The page refreshes every 30 seconds while visible, and the tester can refresh manually.

The isolated Supabase test project contains `rr_feedback_members` and `rr_item_feedback`. RLS prevents cross-tester reads, owner impersonation and self-promotion. Browser clients have no membership-write or report-delete permission. Reviewer updates are limited to status and reviewer note. The server uses the existing public project key with the authenticated user's SSR session, never a service-role key.

All six currently confirmed test accounts may report. No reviewer has been assigned. The owner must identify the existing tester account to receive reviewer membership. For later invitations, add both the server invitation-list UUID and protected feedback membership. Do not infer reviewer access from editable user metadata or the learner profile role.

## Evidence and clinical review

The [2025 randomized trial of gamified scenario writing](https://link.springer.com/article/10.1186/s12909-025-07079-w) informed active explanation-building and debriefing. Its 82 participants were nursing interns in a ten-week intervention that included teams, writing and feedback. The short app activity adapts those principles; it does not replicate the intervention or establish the same effect. No efficacy statistic is presented as an app result.

The pilot links to primary clinical references: BTS oxygen guidance, NICE NG253 sepsis, CG174 IV fluids, NG148 AKI, CG187 acute heart failure, UK Kidney Association hyperkalemia guidance, APSF opioid monitoring, AHRQ TeamSTEPPS SBAR and Resuscitation Council UK anaphylaxis guidance. Patient-specific targets and available local escalation support are stated in the cases. Drug doses and autonomous prescribing are not assessed.

The authored cases are marked “Clinical review pending.” Before releasing beyond the tester pilot, nurse educator review should check:

1. Audience and nursing scope, the intended outcome, and whether the item actually samples its assigned cognitive demand and judgment process.
2. One defensible best response, plausible competing interpretations, sufficient patient information, accurate explanations and current local applicability of the references.
3. Accessibility, reading burden, feedback usefulness and whether the first encounter feels challenging and encouraging.
4. Tester flags by exact revision and resolution. “Updated” describes a reviewed change; saving that status does not edit a question automatically.

For evaluation, keep guided, hinted, independent and repeated encounters distinct. Examine first-response patterns, matrix row patterns, distractor selection and reported ambiguity after content review. Do not combine all 40 prompts into a validated summative exam, assert six reliable CJMM subscales or infer bedside performance from this pilot. A separate independent assessment and a prospective evaluation design are future work. Aggregate response analytics and cross-device progress are not implemented here.

## Verification

Tests cover coverage calculations; immutable first responses; matrix partial credit; delayed independent feedback; warm-up skips; saved-session revision checks; feedback timer pauses; submission failure and receipt behavior; per-account drafts and reports; review updates; API origin, identity and payload checks; and the exact middleware API exception.

The live isolated database was also checked in a rolled-back transaction: own-report access, cross-user isolation, forged-owner rejection, blocked membership self-promotion, reviewer read/update access and appended review history passed. Temporary reports and temporary reviewer rights were rolled back. Security advisor output contained no findings for the new feedback objects.

Full regression suite: 416 tests passed across 60 files. The eight legacy adapter checks passed, and `cjis:check` reported zero errors in the existing 300-item bank. TypeScript and the local optimized production build passed. The cloud browser could not reach the local server, so no local visual-browser result is claimed. A live positive sign-in/report/reply cycle still requires the tester's private credentials and the chosen reviewer identity; mocked tests and RLS checks do not substitute for that user acceptance step.
