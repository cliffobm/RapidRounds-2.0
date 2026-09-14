# Contributing nursing content to Rapid Rounds

The educator controls teaching terminology, clinical review, and approval. The app currently stores content in versioned files; a browser-based educator editor and spreadsheet importer have not been built. You can contribute in a document or message without editing code.

## Review the first LOC pack

In the preview app, open Library and search for LOC. Open **Describe and respond to a change in LOC**, then **Practice Assess a change in LOC**. On Today, open **A change from the neurologic baseline** for the six-stage case. Question explanations and the lesson contain **Teaching & review details**.

The complete review copy is `NEURO_PACK_REVIEW.md`. It contains all 12 standalone questions, six case decisions, lesson material, answer keys, rationales, sources, and review fields. The source is `content/neuro-loc-pack.ts`, version `2026-09-14.1`.

Send changes in this form:

- Item ID and version:
- Original text:
- Preferred revision:
- Does the answer key change? If yes, specify the correct option IDs:
- Reason and supporting reference:
- Decision: revise / approved after listed edits / approved as written:
- Reviewer name and credentials for the review record:
- Review date:

The new pack is not approved yet. A favorable review of an earlier bank does not approve newly generated questions. Reviewer and review-date fields are blank until the educator supplies a decision for the identified version. Clinical accuracy review and student item-performance evaluation are separate steps.

## Initial terminology guidance

These are educator-supplied style preferences, not claims that every alternative is universally prohibited or that a particular textbook mandates the replacement.

1. **Difficult to wake → Difficult to arouse.** Include the stimulus, response, and trend when the objective concerns neurologic assessment. Applied to the existing oxygenation question `rr-ext-oxygenation-01` and its cue list; its version is now `2026-09-14.1`.
2. **Patient denies pain → Patient reports no pain.** Preserve the patient's actual report, pain rating, and context. Do not infer absence of pain when a patient cannot provide a report.
3. **Monitor IV site for leakage → Assess IV site for infiltration or extravasation.** First establish the infusate and findings. These complications are not interchangeable, and external leakage alone does not establish either diagnosis.
4. **Encourage fluids → Promote adequate hydration.** Specify the safe route and the individualized plan when needed. Oral intake may be inappropriate with decreased LOC, dysphagia, or NPO status; fluid restrictions also matter.
5. **Check vitals → Obtain and evaluate vital signs.** Include timing, relevant measurements, trends, and the nursing response. Do not invent results when rewriting a note.

Only the first phrase appeared in the existing question bank at the time of this revision. The remaining preferences guide new authoring; they were not applied as blind substitutions. Deliberately imprecise source notes in documentation exercises remain visible for learners to revise.

## Sources and course alignment

The supplied course package identifies Lewis's Medical-Surgical Nursing, 13th edition, and provides objectives for Weeks 1, 2, and 4. Its reproducible assessment, component GCS, baseline-to-change timeline, and communication objectives informed this pack. The original DOCX and private local paths are not included in the app repository.

The publisher's contents confirm Chapter 60 **Assessment: Nervous System**, Chapter 61 **Acute Intracranial Problems**, and Chapter 62 **Stroke**. This confirms the chapter mapping, not the content of those chapters: the textbook pages were not supplied or independently read. [Elsevier book contents](https://www.us.elsevierhealth.com/lewiss-medical-surgical-nursing-9780443121791.html)

The separate message mentions Fundamentals of Nursing, 10th edition, Chapter 31 and Medical-Surgical Nursing, 3rd edition, Chapter 60. Exact authors, editions, and chapter contents remain unverified. Add the correct bibliographic details or relevant excerpts before attaching those textbook-specific claims to items. The source links in the new pack are verified public clinical resources, not substitutes for the educator's textbook review.

The blueprint uses Reduction of Risk Potential for assessment-focused items and Physiological Adaptation for acute deterioration/airway response items. These are editorial mappings for faculty review against the [2026 NCLEX-RN test plan](https://www.nclex.com/files/2026_RN_Test%20Plan_English-F.pdf). No exam endorsement, calibrated difficulty, or pass prediction is implied.

## Expand the bank

For each new unit, supply objectives, common misconceptions, student level, original patient situations, answer keys, option-specific rationales, and sources. A useful first batch is 10–15 items, one six-stage case, and one short lesson. Change the clinical reasoning demand when making a variation; changing names and numbers alone does not create a useful parallel item.

Use `NEURO_CONTENT_PROMPT.md` as the reusable drafting prompt. Keep new material in preview until review is recorded. Preserve item IDs for revisions, increment the content version, and keep earlier answered snapshots intact. A review label by itself does not publish content: release eligibility is controlled separately by the content status and build environment.

The current case/lesson authoring types intentionally admit review-pending content only. Publishing reviewed content will require an explicit release change to the content types/statuses and accompanying gate tests; it is not performed by filling a name into a review record.

Before release, run `npm run health`, review the exact GitHub commit, and test the pack on a phone. Automated checks validate structure, keys, scoring behavior, storage compatibility, and release gating. They do not establish clinical accuracy.
