# CJIS integration verification — October 22, 2026

This report supersedes the initial migration results retained in Git history. Current implementation: `feature/cjis-foundation`, Node 22, Next.js 15.5.28, React 19.1.10. The original 68 imported questions and answer keys remain intact; the application also includes 32 earlier authored draft questions and 36 new case-linked questions.

## Distinct clinical reasoning levels and tester login

The evolving cases now include 144 newly authored higher-level questions: one Challenge and one Advanced question at each of 72 checkpoints across six families and two patient paths. Foundation, Challenge and Advanced have different prompts and choices. Challenge focuses on case-specific priorities with immediate feedback. Advanced asks learners to weigh competing explanations, reconcile conflicting findings, plan escalation and evaluate response; feedback follows completion. Required selections vary from one to three, and reasoning notes remain ungraded. Supplemental clinical findings are explicitly labeled as simulated in the relevant question.

The skin-infection and abdominal-pain cases incorporate the supplied reference material through original questions about pain/appearance mismatch, deep tissue and thrombosis differentials, changing function and location, nondiagnostic investigations, reassessment after analgesia, diagnostic advocacy and safe follow-up. The other four families now include distinct higher-level questions on headache differentials, fluid intolerance, thromboembolic/bleeding risk, nutrition and test validity. References are visible in the cases. These are editorially reviewed drafts, not clinically signed-off or calibrated items.

Current evolving revision is `2026-10-22.2`. Existing `2026-10-21.1` attempts retain their original questions, answer keys and scores. **Start updated case** archives the earlier attempt and starts the new questions. Practice's separate 136-item catalog and earlier Quick Check content are preserved; the 144 new questions belong to evolving cases.

The review deployment now supports provisioned email/password tester accounts using the isolated Supabase project **RapidRounds-2.0-Sprint4-Test** (`ztjudfbsvwqnmqqgkknn`). Preview configuration is restricted to `feature/cjis-foundation` in the separate Vercel review project. No service-role key is used. Browser and server clients share cookie-based sessions; the Account page verifies identity with Auth, shows the actual account email and provides sign-out. Middleware persists refreshed session cookies. Failed or incomplete callbacks return an explicit error instead of a success page.

Review mode permits application requests to the configured project's Auth endpoints and blocks legacy database/profile/progress synchronization. This application guard does not replace RLS or database authorization. Sign-in identifies the tester; learning content is still accessible without login and progress remains browser-local, shared between accounts in that browser. It does not provide cross-device or per-account progress. Use separate browser profiles on shared devices.

### Manual positive-login verification

1. Open the test project's **Authentication → Users → Add user → Create user**. Enter the tester email/password directly in Supabase and confirm the test email if required. Do not send passwords in chat. Creating the account is a user handoff.
2. Open the review site's `/auth/sign-in`, enter that account and submit. Expect `/account` with the same email.
3. Refresh and reopen the app; verify Account remains authenticated. Also verify persistence after access-token expiry. Practice and Progress should retain browser-local work.
4. Sign out; expect a signed-out notice. Visiting `/account` should require sign-in again. A wrong password should produce a clear error without navigating to Account.
5. Repeat with another provisioned tester in a separate browser profile. Self-service signup, OAuth and email delivery have not been verified or enabled by this change.

A successful live tester login is not claimed until a real account is provisioned and this walkthrough is completed. Mocked session/component tests cannot establish that live result.

Live preview verification confirmed an enabled sign-in form, unauthenticated Account redirects and a clear rejected-login error using a deliberately invalid synthetic identity. No account was created or email sent by that check. A deployed Advanced skin-infection question was also inspected. Positive login, refresh/reopen persistence, expiry refresh and sign-out still require the tester account walkthrough.

## Unified Practice and Progress

Practice now has one searchable 136-question catalog across 16 collections. Learners choose Guided feedback or a 5/10-question Check, with optional area and authored reasoning-level filters. Imported answer keys and clinical wording are preserved; questions without an authored level remain unclassified. Guided questions allow contextual glossary support. Check mode withholds explanations and inline references until submission. Neither mode is timed.

Progress records completed question sets, guided cases, evolving cases and earlier saved results. Scores remain formative correct/answered percentages; unanswered decisions are separate. First recorded and repeat comparisons require the same activity, revision, case variant, reasoning level, mode and decision count. Randomized sets within a collection may contain different questions; changes in these practice percentages are not calibrated growth or transfer estimates. Reasoning notes remain ungraded. Older saved results without a recorded completion date are kept separate from time-ordered comparisons. Existing guided cases do not record reference use and show “Not recorded”.

Home and Progress can resume unfinished question sets, cases, study lessons and the existing application exercise. New study-session storage restores confirmed answers, lesson phase and feedback; completed lessons offer an explicit restart without overwriting the first paired Study result. The bottom navigation now offers Home, Rounds, Practice, Study and Progress. Old Explore links lead to Practice; explicit old question-bank and saved Quick Check links remain compatible.

All history is browser-local. The history journal retains 200 attempt summaries; unified practice retains 20 unfinished and 20 completed detailed sessions. Clearing browser data removes this work. Summary links to older cases open the activity's current saved state, and detailed question sessions that have aged out display an unavailable message. JSON export is available from Progress. Failed browser storage produces a visible notice and leaves practice usable for the current visit.

## Executed checks

| Check | Executed result |
| --- | --- |
| Full regression suite, `npm test -- --reporter=json --outputFile=../case-auth-tests.json` | 267 passed, 0 failed |
| Legacy adapter, `npm run test:cjis` | 8 passed |
| TypeScript, `npm run typecheck` | Passed after final production changes |
| Production compilation, `npm run build` | Passed after final production changes |
| Full Windows Edge browser run, `npx playwright test --config playwright.cjis.config.ts` | 36 passed, 1 browser-context creation failure; see below |
| Isolated rerun after final middleware build, `--grep "new learning routes\|unconfigured login"` | 2 passed, including unchanged dark accessibility/no-overflow assertions at 320/390/1440px and account redirect |

The current full Edge run passed all six new checks: both paths and all six decisions for skin-infection/abdominal-pain Challenge and Advanced, preservation/restart of an earlier Advanced attempt, and explicit offline login/account/callback behavior. One existing dark-layout check failed before page creation with `browser.newContext: Target page, context or browser has been closed`; no application assertion ran in that check. Its isolated rerun passed along with the account guard after the final middleware build. The final GitHub Chrome run is reported on delivery. No combined clean local 37-test run is claimed. Earlier initialization/selector corrections remain in place without weakening the accessibility assertions.

## Debrief and interface refinements

Practice results now lead with a whole-number percentage and the correct/answered count. Each submitted decision earns one point when the full required answer set is correct. Handoff skips are shown separately and excluded from the denominator; reference use is disclosed without a point deduction. Reasoning notes and confidence remain ungraded. No pass threshold, letter grade or validated competency estimate is introduced.

The evolving debrief separates next-step study links from decision review. Each decision shows its clinical judgment skill and Correct / Incorrect / Not answered outcome; expanded review includes the original question, the learner's answer, correct answers, rationales and optional notes. An incorrect-only filter opens missed decisions. Skipped rows no longer display incorrect-answer feedback. Quick checks and guided-case summaries use the same percentage convention.

Case names and descriptions are shorter; cards retain “6 guided decisions” and move replay mechanics into the optional source/limits section. Home preserves its branded hero in both Guided and Focus, with a concise nursing purpose, direct actions, and resume links only when unfinished work exists. Buttons use larger labels. Practice starts at explicit topic/mode/count setup. Clinical question keys, earlier content revisions and production services are unchanged.

Browser checks cover full case progression, practice feedback, saved answers and feedback after reload, study-to-application continuity, glossary search, assistance tracking, original-logo video and still fallback, settings/calendar export, unified Practice and Progress, and phone/dark-theme automated accessibility. Local checks use official Microsoft Edge; GitHub Actions uses official Chrome for the original H.264 logo. No assertions are removed or skipped to make the suite pass. Builds enforce TypeScript but skip lint under the inherited configuration; these results do not constitute a lint pass.

CI now checks Playwright's expected official Chrome executable before running the installer. The [GitHub Ubuntu runner image includes Google Chrome](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md#browsers-and-drivers). If the executable is absent, the existing dependency/browser installer still runs. This avoids redundant apt font downloads observed in the first run for this change; the browser channel and all 37 assertions/tests remain unchanged.

See [inline reference cards](INLINE_REFERENCE_CARDS.md) for matching rules and interaction limits. Earlier migration, source-expansion and debrief test runs remain in Git history; the table above describes the current implementation.

## Content and evidence boundaries

- Six existing guided cases plus six evolving case families with two authored paths each (72 new scripted checkpoints); 136 question items; 42 glossary terms; six foundational study units; one three-decision application exercise. Paths, question formats and related items are not independent case samples. See [evolving implementation and source review](EVOLVING_IMPLEMENTATION.md), [content expansion](CONTENT_EXPANSION.md) and [prior readiness work](READINESS_IMPLEMENTATION.md).
- All authored content remains a draft without human clinical signoff. Editorial skill tags do not establish validated mappings. Guided cases are scripted, formative stories, not physiologic simulations.
- The glossary includes 42 terms and six sourced adult value examples. Examples include units and context and are not universal targets or critical-value thresholds. Clinical dosing, emergency protocol summaries and clinical calculators remain withheld.
- Practice/case progress is validated and stored on the device. Supported question and evolving-case activities record inline glossary use before confirmation; older guided cases do not record reference use. External references cannot be detected. No result is tamper-resistant or suitable for competency certification.
- The application pathway's 48-hour comparison is a scheduling convention, not validated evidence of retention or clinical transfer.

## Remaining blockers and limits

Human clinical review, curriculum/coverage review, source and media rights, item calibration, outcome validation, physical-device testing, production account/backend integration, monitoring/support ownership and production release approval remain outstanding. Automated accessibility checks are not a full accessibility certification. Old browser-support dataset and Vite CJS warnings remain; lint modernization is outstanding.

No production database was accessed or changed. Only the isolated test project's Auth configuration, table/RLS metadata and security-advisor results were inspected. Existing test-project findings include mutable function search paths and disabled leaked-password protection; no database or security settings were changed. See [function search-path remediation](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable) and [password protection guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). These findings need review before any production backend integration. Payment, AI, database synchronization and live positive login remain unverified. The separate review project uses only public test Auth configuration; no production promotion is included.

## Preservation

The original repository is unchanged. The 2.0 main branch remains `fc73715d70427b457fc3dd4258a7d54fee8fbb9f`. All implementation work targets `feature/cjis-foundation`; the initial migration commit is `740972855554422aa48502977c8f0a79ab405108`. Exact current commit, CI status and review deployment are reported on delivery.
