# RapidRounds development continuity

The continuing application is `cliffobm/RapidRounds-2.0`, branch `sprint4/cjis-source-migration`, draft PR #1 against `feature/cjis-foundation`. Main and production are unchanged.

## Why the preview looked older

The Sprint 4 branch imported the legacy web application from `cliffobm/RapidRounds` at `9094ae6ddc97ec2c99e4d26fe88d11f661ad20fe`. Subsequent commits added ordering fixes, profile security, and Google/email authentication. The old smartphone logo, blue/orange visual system, sample dashboard, and CSV-derived RR list remained in that imported UI.

The separate `rapid_rounds_cjis_v3.zip`, saved October 10, 2026, contained a standalone HTML learning prototype and draft content. Its README explicitly said it was not integrated into the application. It was not a replacement application with authentication or a backend.

The approved Concept 2 RR/signal direction and complete light theme are documented in the September 29 ICU redesign blueprint. The October 10 Brand App Board provides a later visual reference. These assets and the v3 package were recovered for this repair. No editable original orbital intro was found; the new inline SVG mark and brief signal-trace entrance implement that approved direction and are not represented as the original animation file.

## Preserved snapshot

`archive/pre-brand-restoration-2026-10-15` preserves remote development commit `184617c1f544f06add4faa35658a84c3457501ad`, tree `5f18b5efb4f0634baad8471089b213fc75e4ce72`.

This is a code checkpoint, not a database backup. It contains no local environment file or secrets. The repository is not archived or renamed; development continues on the existing branch so the auth/profile/security repairs remain in place.

## Restored experience

- Replace the smartphone treatment with an RR/ECG vector mark, cyan/emerald accents, deep ink surfaces, and matching light surfaces. Home has a short optional inline entrance with replay and reduced-motion support; it never blocks access.
- Use semantic foreground/surface tokens for shared cards. Remove global span/paragraph color overrides and use one `html.dark` state, including initialization, persistence, system updates, and cross-tab changes. Study headings wrap instead of disappearing/truncating beside badges.
- Replace the CSV/code list with six scenario cards. All five prior RR codes remain valid. They now open bundled legacy sample scenarios rather than requiring an unconfigured `rr` schema/RPC. Titles and questions therefore follow the bundled cases; the discarded CSV was not the player data source and included malformed comma-containing rows.
- Connect the five-stage post-TAVR v3 case natively, preserving its IDs, question wording, keys, definitions, and rationale text. Source JSON is retained under `cjis/preview/`. This is an illustrative draft awaiting clinical review; it does not award game XP or validated competency scores. The clinical keys and explanations have not been newly clinically validated.
- Practice responses/definition usage remain in visit memory and clear on exit or restart. No patient data, hosted schema, historical attempt rows, role policies, or auth callbacks are changed.
- Let Next metadata own the document title; remove the duplicate manual title. The layout source supplied by the owner contained no actual error text. A successful build cannot identify an unreported Windows/browser exception.

## Continue improving

1. Review the restored Home, Study, and RR paths on the owner's phone/computer in both themes.
2. Clinically review and source the draft cases, including each distractor explanation; retain unscored learning until that work is complete.
3. Add authenticated, account-isolated attempt/assistance persistence while preserving immutable content versions.
4. Continue cloud bookmarks, reviewed reference content, and the planned ICU learning/debrief experience. Billing and authoritative entitlements remain separate unfinished work.
5. Complete live Google/email delivery tests and release readiness checks before any production merge/deployment.
