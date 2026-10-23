# Rapid Response and ECG practice — October 23, 2026

## Delivered behavior

`/rapid-response` is available from Home and Rounds. Six fictional adult cases contain 24 new advanced decisions: unstable atrial fibrillation, ventricular tachycardia/arrest, high-grade conduction block, postoperative hemorrhage, hyperkalemia and infection with respiratory deterioration. These questions are separate from the existing 196-item Practice catalog and eight evolving case families. Their patients change at authored checkpoints; this is not a physiologic simulation.

Each case offers **Untimed practice** with an active stopwatch or **Response challenge** with a countdown. The same decisions appear in both modes. Standard authored allowances are four to six minutes, with 1.5× and 2× options before starting. These are interface settings for practice, not clinical response standards or calibrated difficulty thresholds.

The clock stays visible while scrolling. Explicit pause, hiding the page, navigation and reopening stop timing. Reopening restores selected responses and confirmed decisions in a paused state, without charging elapsed time away. Home and Progress link to unfinished attempts. Timer ticks use a monotonic browser clock, with bounded increments to avoid charging long stalls. The displayed measure has approximately one-second resolution; it includes foreground reading, inspection, selection and idle time, and cannot isolate cognitive reasoning time.

At zero, the case pauses and preserves the current draft. The learner chooses **Continue without a time limit** or **Finish and review**. Expiry does not fail a learner or submit an answer. Early finishing requires confirmation; only submitted decisions enter the accuracy denominator, while unanswered and missed priority decisions remain visible. A priority flag is an editorial designation, not a validated safety score.

Results show correct/answered percentage, active time, the timing condition, priority decisions to revisit and full decision-by-decision rationales. Per-decision active time is shown in review. No speed bonus, time penalty, pass threshold or combined competency score is calculated. Progress stores timing separately and compares like activities/revisions/timing conditions only. Repeating the same script may measure recall or familiarity; faster completion alone does not establish growth or transfer.

## Timing evidence and interpretation

Clinical reasoning time does not provide a definitive comprehension measure. A [117-resident diagnostic experiment](https://pmc.ncbi.nlm.nih.gov/articles/PMC8061054/) found correct diagnoses were faster on average, while also identifying rapidly produced bias-related errors. A [2024 time-constraint experiment](https://www.degruyterbrill.com/de/document/doi/10.1515/dx-2024-0125/html) found lower diagnostic accuracy under constrained time. These medical diagnosis experiments do not validate this nursing app's timing, scores, budgets or clinical judgment inferences.

Use time as formative context alongside accuracy, specific priority errors, case familiarity and the learner's explanation of their choices. Outcome validation would require independent nursing expert review, item calibration, representative learner samples, repeated unseen parallel cases and prospective evaluation. The app does not claim that this work has occurred.

Timing can be turned off before every attempt; longer allowances and pause remain available. The same content is available without a countdown. This follows the intent of [WCAG timing adjustability guidance](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html); automated checks do not constitute accessibility certification.

## Optional sound

Challenge mode is silent by default. A learner must explicitly enable the synthetic monitor-like timing cue. Volume is adjustable with a conservative application gain cap. Cadence and gain increase modestly in the final 30 and 10 seconds; the cue is a time signal, not the patient's heart rate. There is no automatic sound on entry, no persistent sound preference and no alarm at expiry. Pause, backgrounding, navigation and reopening reset sound to off. Unsupported or failed Web Audio produces a notice while the case remains usable. Actual perceived loudness depends on the device/system volume; testing on physical phones and assistive technology remains necessary.

## Original ECG library

`/ecg` provides 17 searchable entries: sinus rhythm, sinus bradycardia, sinus tachycardia, AF, AF with RVR, atrial flutter, regular narrow-complex SVT, monomorphic VT, pulseless VT, VF, torsades, asystole, PEA, first-degree AV block, Mobitz I, Mobitz II and complete AV block. The component is reusable in other cases. A subset appears in the six new cases.

Every strip is a deterministic original SVG teaching illustration. No supplied image was copied, traced or rehosted. Each six-second plot includes an ECG grid, time/voltage scale and calibration pulse. The whole strip fits first; **Enlarge ECG strip** exposes a full-width scrollable version for interval inspection. The scroll region is keyboard accessible. In assessments, accessible titles and descriptions describe morphology without naming the diagnosis. Reference views reveal rhythm names and teaching features; completed-review strips reveal rhythm names alongside case-specific rationales.

The supplied reference sheets informed the audit but contain simplifications or errors that are not carried forward:

- First-degree AV block uses PR **greater than 0.20 seconds (200 ms)**, not 0.2 ms.
- Mobitz I demonstrates progressive PR prolongation before a dropped QRS; Mobitz II demonstrates unchanged conducted PR intervals with intermittent nonconduction. An isolated 2:1 block does not establish which mechanism is present.
- Complete block shows independent atrial and ventricular activity.
- Pulseless VT uses the same electrical morphology as VT, and PEA may show an organized rhythm. Both require bedside pulse context; a strip alone cannot establish pulselessness.
- Regular narrow-complex SVT and AF with a rapid ventricular response are distinct entries. “SVT with RVR” is not used as a separate rhythm diagnosis.

These illustrations are not patient recordings, 12-lead studies or diagnostic tools. Human clinical review of morphology and clinical actions remains pending. Current clinical references are attached to each case/registry entry, including the [2025 AHA adult advanced life support guidance](https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support).

## Storage and preservation

New detailed attempts use `rapidrounds-rapid-response-v1` and a revision derived from authored content. Validation rejects incompatible/corrupt records. Twenty unfinished and twenty completed detailed attempts are retained; the existing Progress journal retains its 200-summary limit. Confirmed decisions and completed results cannot be overwritten through the application's save function. This browser-local data is editable outside the app and is not suitable for certification. Clearing browser data removes it; account login does not provide cross-device progress.

Existing question definitions, answer keys, saved session hashes and evolving revisions are unchanged. The attempt journal adds a backward-compatible activity kind and optional timing fields. No package dependencies, database tables, authentication settings, production services or main-branch content were changed.

## Verification and release limits

See [the current verification report](VERIFICATION.md) for executed counts and commands. Tests cover case/question integrity, SVG timing/morphology, session validation and immutable answers, pause/restore/expiry, stale writes, optional sound limits/failures, all six case completions, full rationales, Progress links, and light/dark phone/desktop accessibility. A separate editorial content audit found no identified blocking action/rhythm/pulse inconsistency; it is not human clinical approval.

Remaining release work includes human nursing/clinical signoff, independent ECG review, representative learner usability testing, physical-device/audio and screen-reader testing, item calibration and evidence of learning outcomes. Timer targets and results must remain formative until evaluated. No production deployment or database change is included.
