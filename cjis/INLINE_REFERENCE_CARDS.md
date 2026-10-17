# Contextual glossary cards

Practice question stems/prompts and guided case updates now support underlined reference buttons. Tap, Enter or Space opens a compact definition card with a source link and optional full-glossary link. Escape, Close or outside interaction dismisses it. Merely focusing or hovering over a term does not open a card or record assistance. The selected answer stays in place.

## Editorial boundaries

- A maximum of three distinct references per text block keeps the question readable. Common instructional words such as baseline and reassessment stay plain.
- Inline aliases are curated separately from glossary search aliases: related concepts are not interchangeable definitions. For example, MI does not link to the ACS definition, and respiratory rate does not link to tachypnoea.
- Cards reuse the existing draft definitions and value examples. Before-answer term cards display a definition, not a case-specific reasoning hint. The fuller glossary remains available as an assisted learning resource.
- Named laboratory measurements must include an analyte and a recognized unit to receive an automatic value link. Bare numbers, blood pressure and unsupported tests are not assigned a guessed interval. Guided case heart-rate/respiratory-rate values link explicitly to the existing adult examples. Each value card includes context and explains that the example is not a patient-specific target or critical-value threshold.
- Answer choices do not contain reference buttons, preserving simple radio selection and avoiding nested interactive controls. Existing clinical text and answer keys are unchanged.
- References are opt-in at the question-component level. They are enabled in formative practice and guided cases; the separate independent application exercise has no inline cards. This is not a secure exam mode: global and external references remain accessible.

## Evidence and interaction

Opening an inline card before confirming a practice answer increments the same device-local assistance field used by the reference shelf. Reopening counts as another opening. Opening a card after feedback does not change the recorded response. These counts describe reference openings, not comprehension or the number of definitions read. Neither supported nor unsupported practice becomes competency-eligible evidence.

Cards use the existing Radix Popover dependency for dialog semantics, focus handling, Escape/outside dismissal and viewport collision handling. They render inside the application theme container so dark mode, contrast and text-size settings carry through. No hover-only interaction, extra package, account requirement, backend write or clinical content approval is introduced.

## Verification

Tests cover text preservation, word boundaries, equivalent-alias selection, measurement/unit binding, repeated-link limits, activation versus focus, selected-answer preservation, before/after-answer assistance, keyboard focus return, default-disabled assessment references, dark-theme popup accessibility and narrow-phone bounds. The first browser run caught theme inheritance at the portal boundary; the portal now receives the application container when activated. Final executed totals are recorded in `VERIFICATION.md` and the delivery report.

Human clinical review and physical-device/assistive-technology review remain necessary. The feature supports learning and does not establish improved retention, reasoning outcomes or clinical competence.
