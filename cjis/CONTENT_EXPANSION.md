# Content expansion

## Source material expansion on October 22 2026

The supplied materials were inventoried read-only. Original files, archives and the synced project `sources/` directory were not changed or copied into the application. Review distinguished topic coverage from clinical authority; no publisher test-bank stems, answer sets or textbook pages were imported into this expansion.

| Supplied material | Verified scope |
| --- | --- |
| Medical-Surgical Nursing 9e chapter folder | 74 readable test-bank PDFs, 622 pages; all pages text-extracted; 1,773 answer markers |
| Pharmacology 7e archive | 59 readable RTF chapter banks, 954 answer markers; inspected in-memory without bulk extraction |
| Health Assessment 6e archive | 24 readable RTF chapter banks, 634 answer markers |
| Pharmacology 9e 2017 PDF | 299 pages, 55 chapter numbers and 963 answer markers; coverage/structure extracted |
| Fundamentals 9e PDF | 1,046 pages, 50 chapter numbers and 1,569 answer markers; this file is a test bank, not textbook prose |
| Brunner & Suddarth medical-surgical textbook | 6,203 PDF pages; edition/contents and targeted conceptual/clinical pages reviewed, including visual inspection; a complete page-by-page clinical validation is not claimed |
| Benner nursing-practice domains DOC | Legacy Word content read; references Benner 1984 and seven practice domains; pagination not verified |
| Separate Genetics 05 and Emergency/Trauma 08 PDFs | Six pages each; SHA-256 identical to their chapter-folder copies and excluded from additional coverage counts |

Answer-marker counts are extraction counts, not deduplicated or validated questions. PDF conversion dates do not establish publication dates. Older items contained questionable clinical priorities and overly broad genetics claims. They informed the coverage blueprint, with new clinical decisions checked against current primary guidance instead of importing their keys. Benner's domains inform attention to teaching, monitoring, safety and coordination; scores do not establish novice-to-expert progression.

Implemented original drafts:

- **60 standalone single-best-answer questions** in four new 15-item collections: medication decisions; kidney/metabolic changes; assessment/safety; genetics/shared decisions. Each has five Foundation, five Challenge and five Advanced items, option-specific rationales and source context. Unified Practice now has **196 items in 20 collections**. The 136 prior items and keys remain unchanged.
- **Two evolving case families, four patient presentations and 24 new checkpoints:** postoperative opioid-associated ventilatory impairment, recurrent hypoglycaemia, gastrointestinal losses with renal/electrolyte change, and congestion with competing renal/perfusion risks. Each checkpoint has three distinct level-specific questions, adding **72 case questions**. The application now has eight evolving families, 16 paths and 96 scripted checkpoints. These are authored sequences, not random physiological simulation.
- **Four clinical study lessons**, each with three reading sections, worked examples and three checks. Selected drafts, confirmed feedback, completion and restart persist locally. Study results appear as a distinct activity in Progress, and lessons link to related Practice collections and cases. The checks are formative, with no calibrated growth or competence claim.
- **Eight glossary entries** covering AKI, oliguria, hypoglycaemia, hyperkalaemia, pharmacogenetics, polypharmacy, VUS and sedation, bringing the glossary to 50 terms. Inline equivalents include US/UK spellings. Existing six value examples are unchanged.
- **A colleague review guide at `/review-guide`**, linked from Account, with suggested review tasks and a local text-file feedback download. Notes are not submitted, emailed or stored in a backend. The reviewer sends the downloaded file through their chosen channel. No patient identifiers or credentials are requested.

Current source context includes NICE NG5/NG148/NG39/NG232/NG249/CG179/CG174, ADA 2026 hospital standards, APSF ventilatory-impairment monitoring, UK Kidney Association's July 2026 hyperkalaemia update, Lifeblood transfusion-reaction guidance, and FDA/NCI/CDC/MedlinePlus genetics resources. Visible source links identify the relevant context. These sources do not substitute for local pathways or human clinical signoff.

Practice session compatibility explicitly retains `practice-1:c8409c89` only while the original 136 question definitions match that hash. Old sessions cannot contain newly added IDs; their saved order, answers, score and revision remain intact. New sessions use the expanded library hash. Existing six evolving case families and their legacy question revisions remain unchanged.

## Earlier expansion on October 17 2026

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
