# Rapid Rounds release and phone testing checklist

Complete this for each native build and each over-the-air update. Record **pass**, **fail**, or **not tested**, plus the person and date. A blank box is not a pass. Use fictional study profiles and no real patient information.

Release record:

- Commit:
- App version / native build number:
- EAS build URL / update ID:
- Channel / environment / runtime:
- Tester / date / device / OS:
- Previous installed version, if testing an upgrade:
- Health report artifact:
- Clinical reviewer / content version:
- Rollback target and owner:

## Automated checks

- [ ] `npm ci` installs the lockfile without changes.
- [ ] `npm run health` finishes; code, behavior, package compatibility, platform exports, and security status are known.
- [ ] High/critical dependency issues are resolved; any remaining advisories have a recorded owner and assessment.
- [ ] GitHub's `App health` check passed for this commit after the repository is connected.
- [ ] Public app configuration has the intended project, bundle/package IDs, update channel, and runtime policy.
- [ ] Production excludes `needs_review` content. Beta preview content remains explicitly labeled.

## First opening and navigation

- [ ] Install and launch on a real iPhone with the computer disconnected.
- [ ] Welcome screens, returning-user entry, skip controls, and logo animation work.
- [ ] Reduced-motion preference avoids unnecessary spinning or animated transitions.
- [ ] Every main destination opens and the bottom controls remain reachable around the home indicator.
- [ ] Reopen after force-closing; settings and saved learning history remain.
- [ ] Upgrade over a previous beta preserves the expected saved data.

## Learning correctness and progress

- [ ] Start a five-question Rapid Fire session; verify question count, timer, answer feedback, final result, and navigation.
- [ ] Try larger session counts and difficulty filters; the app handles a smaller available bank honestly.
- [ ] Complete a lesson, a Learn session, and a six-stage case; review explanations and partial scoring where applicable.
- [ ] Check incorrect answers and confidence choices lead to the expected review experience.
- [ ] Complete a due review and verify its next review scheduling.
- [ ] Rewards appear once for eligible actions; reopening or repeating the same completed material does not farm rewards.
- [ ] Interrupt a session with backgrounding, locking, and a phone notification; verify the actual supported resume/exit behavior and record any lost work.
- [ ] A qualified nursing educator checks answer keys, rationales, priorities, distractors, case progression, units, citations, and content review metadata.

## Profile, device features, and accessibility

- [ ] Save a fictional profile, school/program, goal, and difficulty; reopen and verify persistence.
- [ ] Cancel a profile edit and confirm previously saved values remain.
- [ ] Choose a photo, cancel selection, deny or limit photo access, and try an oversized image; each outcome is explained and the old image is preserved on cancellation/failure.
- [ ] Test light, dark, and system appearance, including changing the system while the app is open.
- [ ] Test largest in-app font and larger system text; no clipped questions, hidden answer choices, or unreachable buttons.
- [ ] VoiceOver identifies controls and selected answers in a meaningful order. Color is not the only feedback.
- [ ] Read-aloud starts, stops, changes speed, and stops when leaving/backgrounding. Try both silent and audible phone settings.
- [ ] Confirm destructive actions require the displayed confirmation, and cancellation changes nothing. Use only a disposable profile for an erase test.

## Accounts and network behavior

- [ ] Guest-only mode accurately explains unavailable sign-in and does not collect passwords.
- [ ] If configured: test email signup, email confirmation on the same phone, existing email sign-in, wrong password, password reset, expired/used link, cancelled OAuth, Apple, Google, session restoration, and local sign-out.
- [ ] Confirm the app never treats an unverified recovery URL flag as permission to change a password.
- [ ] Test airplane mode and slow/flaky connectivity; saved local study remains usable and online failures have recoverable messages.
- [ ] Distinguish local data erasure, device sign-out, cloud account deletion, and future cloud sync accurately in user-facing text.

## Help, reports, and optional measurement

- [ ] Open the diagnostics area and read its plain-language health status and recent problems.
- [ ] Prepare a problem report with fictional text; preview it, cancel it, and verify cancellation sends nothing.
- [ ] Test the configured reporting route on a physical phone, including unavailable service/network and unsupported sharing. Confirm whether the route opens a draft or actually submits.
- [ ] Confirm an intentional, non-sensitive test report reaches the owner's intended destination before inviting students.
- [ ] Export or share only reviewed diagnostic details; no names, photos, email addresses, tokens, typed answers, or patient/student records are automatically added.
- [ ] Turn optional analytics off and verify the promised collection/transmission stops. Review what the configured provider actually receives before enabling it for testers.
- [ ] Distinguish local diagnostic logging from remote crash monitoring. Add and verify a native crash service before claiming comprehensive crash coverage.
- [ ] Check support and privacy disclosures match the enabled features, destinations, data retention, and deletion behavior.

## Updates and release decision

- [ ] Classify the change as compatible JavaScript/content or a native change that requires a new binary.
- [ ] Test updates on the beta channel using the preview environment. Confirm a restart applies the expected update without interrupting a study session.
- [ ] Keep the production channel and environment separate; never publish preview content through the production route.
- [ ] Verify a known rollback target and test the recovery process on beta. A rollback must preserve existing local data or have a reviewed migration plan.
- [ ] For native builds, confirm the exact uploaded build appears in TestFlight and is installed by the tester.
- [ ] For external tests, Apple beta review is complete and invitations go to the intended group.
- [ ] No unresolved issue loses saved data, blocks core study, misstates clinical information, exposes private data, or makes critical controls inaccessible.
- [ ] Owner approves the release record and student-visible release notes.

## Turn a failed check into a useful bug report

Write: “On [phone/system], in app [version/build/update], I did [steps]. I expected [result]. Instead [result]. It happens [always/sometimes/once]. It prevents [task].” Attach a redacted screenshot or diagnostic report if it helps. Give clinical concerns a content ID and source issue. Record a fix version and have someone reproduce the original steps after the fix before closing the issue.

Suggested operating rhythm: review new reports and serious errors on working days; run a small beta update when a fix is ready; review retention/completion trends and dependency proposals weekly; recheck content sources and release readiness before broadening access. These are owner practices to adopt, not background jobs already running on this computer.
