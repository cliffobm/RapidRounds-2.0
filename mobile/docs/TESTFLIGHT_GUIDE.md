# Rapid Rounds: from this Windows computer to a real iPhone

Prepared September 13, 2026. This guide describes the configured project and the remaining owner setup. A successful code export is not an installed iPhone app. Apple signing, a cloud build, upload, and phone testing still have to succeed.

The recommended first target is a small TestFlight beta. It gives testers an app icon they can open without your computer running. Use the `beta` build profile for this project's unreviewed demonstration content; use `production` only after the clinical release gate is satisfied. A beta label does not establish clinical accuracy.

## 1. Gather the accounts and choose the permanent identity

1. Sign in to an Expo account that you or your business controls. EAS is Expo's cloud build and update service. It can compile the iOS app on its Mac builders while you work on Windows. Review your Expo account's available build credits and limits before starting a cloud build. [Expo build process](https://docs.expo.dev/build-reference/ios-builds/)
2. Enroll the owner in the Apple Developer Program, or use an existing active membership. Apple lists **US$99 per membership year**, with regional pricing and some eligible waivers. Use the correct individual or legal organization enrollment; this affects the seller identity. Complete identity verification and agreements. [Apple enrollment](https://developer.apple.com/programs/enroll/)
3. Sign in to App Store Connect with that membership. Have an iPhone using iOS 16.4 or later for this SDK57 project. For local checks, use Node 24 LTS; Expo SDK57 requires at least Node 22.13. [SDK57 requirements](https://docs.expo.dev/versions/v57.0.0/)
4. Choose the app's permanent, unique bundle identifier before registering it. The current `com.rapidrounds.preview` in `app.json` is provisional and has not been verified as owned or available. Ask your developer to replace it with the identifier your Apple team controls. The matching Android package is provisional too. Once a store app exists, changing its identifier creates a different app identity.
5. Keep a private owner record of the Expo project URL, Apple team, bundle identifier, App Store Connect app number, support address, and who can approve releases. Signing credentials and private keys belong in the provider's secure credential storage, never in the repository or an `EXPO_PUBLIC_` variable.

## 2. Open the correct project and run the checks

Open PowerShell and enter:

```powershell
Set-Location 'C:\path\to\RapidRounds-2.0\mobile'
node --version
npm.cmd ci
npm.cmd run health
```

Let each command finish before starting the next. `npm ci` reinstalls the exact saved dependency versions. `npm run health` checks code consistency, behavior tests, Expo compatibility, code packaging for all platforms, and known dependency issues.

For the selected GitHub integration, this mobile application is intended to live in `mobile/` on a new `codex/rapid-rounds-mobile-quality` branch in `cliffobm/RapidRounds-2.0`. The existing repository files are preserved. After cloning that repository and checking out the mobile branch, open PowerShell in its `mobile` folder before running the commands in this guide. The root `.github/workflows/health.yml` detects `mobile/` automatically; GitHub does not run workflows placed only inside `mobile/.github/`. Check the completion message for the actual pushed branch and CI result.

Open `reports/health/health-report.md`. It gives ordinary-language results and points to technical logs for your developer. A failed result means investigate before releasing; an unavailable security registry is a failed check, not a clean bill of health. Low/moderate advisories remain visible even when the high/critical release threshold passes. A forced dependency fix can break the Expo version, so have the developer choose and test upgrades.

These checks do not create an `.ipa` or validate real Apple/Google sign-in, native permissions, medical content, or accessibility on hardware.

## 3. Connect Expo ownership and updates

This checkout is already linked to [@cliffobm/rapid-rounds](https://expo.dev/accounts/cliffobm/projects/rapid-rounds), project `fb960321-798e-4739-9f14-b2fe76844b87`. The owner and public project ID are saved in `app.json`. The Expo project has `EXPO_PUBLIC_CONTENT_PREVIEW=true` in preview and `false` in production. Do not create a second project for this app. On a fresh computer, sign in and verify the existing link; use `init` only if restoring an unlinked checkout.

Run the commands one at a time from the same folder:

```powershell
npx.cmd eas-cli@latest login
npx.cmd eas-cli@latest whoami
npx.cmd eas-cli@latest init
```

Choose the owner's intended Expo project, or create it under the intended owner. Follow the interactive setup and record the project UUID shown by Expo. The app's dynamic configuration must keep that actual project ID in `extra.eas.projectId`; do not paste a fabricated UUID. If EAS cannot write the dynamic configuration automatically, follow its suggested change with your developer. The update configuration remains inactive until a valid project ID is supplied. [First EAS build](https://docs.expo.dev/build/setup/)

The preferred route is to save the real project ID in `app.json` under `expo.extra.eas.projectId` and preserve the Expo owner. Alternatively, this project accepts `EXPO_PUBLIC_EAS_PROJECT_ID`. For that route, set the actual UUID in local `.env`, the current PowerShell environment before EAS project-discovery commands, and each intended EAS environment. For example: `$env:EXPO_PUBLIC_EAS_PROJECT_ID='YOUR_ACTUAL_PROJECT_UUID'`. The UUID is public configuration, not an authentication credential. Do not define competing project IDs in different places.

Check the resolved configuration after connecting:

```powershell
npx.cmd expo config --type public
```

Confirm the expected app name, iOS bundle identifier, owner/project ID, `https://u.expo.dev/` update URL for that same project, and fingerprint runtime policy. Public configuration may include public service values, so do not post its full output publicly. Preserve the configured profiles in `eas.json` if setup proposes replacing them.

For this repository's `mobile/` layout, EAS reads upload exclusions from the repository-root `.easignore`. Keep that file when cloning or reorganizing the project; it excludes Git history, local environment files, reports, dependencies, and signing files from the upload.

## 4. Set the beta and production environment values

In the Expo project dashboard, open its environment variables. Use **preview** for both the ad-hoc `preview` build and the TestFlight `beta` build. Use **production** for the eventual public release. The channel names differ from the environment names deliberately:

- `preview` build: internal installation; `preview` update channel; `preview` environment.
- `beta` build: Apple store-signed binary for TestFlight; `beta` channel; `preview` environment.
- `production` build: store-signed release candidate; `production` channel; `production` environment.
- `simulator` build: Mac simulator only; it cannot be installed on a real iPhone.

Set `EXPO_PUBLIC_CONTENT_PREVIEW=true` in the EAS **preview** environment and `false` in **production**. The same values already appear in the build profiles, but **EAS Update does not read the build profile's `env` block**. Setting the EAS environment values is therefore essential. SDK55 and later require an explicit `--environment` on update commands; with it, local `.env` files are not the source of update values. [Expo environment behavior](https://docs.expo.dev/eas/environment-variables/usage/)

For a guest-only beta, leave the optional account service unconfigured. For a sign-in beta, complete [AUTH_SETUP.md](AUTH_SETUP.md), add its public service URL/key and provider flags to the intended EAS environment, and test email delivery plus callbacks on the same phone where the flow began. Configure the optional reporting/analytics service separately as described in the app's monitoring guide. Flags alone do not provision a service. Profile and study history remain on the device until cloud synchronization is implemented.

## 5. Optional: install a private preview before TestFlight

This route is useful for your own phone or a few registered phones. It still requires a paid Apple Developer membership. Only devices included in the signing profile can install this iOS build. [Expo internal distribution](https://docs.expo.dev/build/internal-distribution/)

```powershell
npx.cmd eas-cli@latest device:create
npx.cmd eas-cli@latest build --platform ios --profile preview
```

Open the registration link on the iPhone and follow the enrollment instructions. In the build prompts, select the correct Apple team and the registered phone, and let EAS manage signing credentials if appropriate for your team. When EAS finishes, open its installation link on that phone. A newly added phone needs a new profile/build or a re-sign; an existing link does not automatically authorize it. Follow any iOS device prompts. Record the successful build ID.

For students outside your development team, the TestFlight route below is easier to maintain.

## 6. Create the app record in App Store Connect

In Apple Developer, register the chosen explicit app identifier under the correct team if it is not already registered. In **App Store Connect → Apps → + → New App**, choose iOS, app name, primary language, matching bundle ID, and an internal SKU you choose. Set access for your team. The SKU is your private catalog identifier. [Apple app record instructions](https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app/)

Open the app's **App Information** and copy its numeric **Apple ID**. This is the `ascAppId`, not your email address, bundle identifier, Expo UUID, or Apple team ID. Add the actual value to both `submit.beta.ios.ascAppId` and `submit.production.ios.ascAppId` in `eas.json`. Those objects are intentionally empty until you have a real app record. [Finding the submission ID](https://docs.expo.dev/submit/ios/)

## 7. Build the TestFlight version

After the health report and intended settings are reviewed:

```powershell
npx.cmd eas-cli@latest build --platform ios --profile beta
```

Choose the Apple team that owns the bundle ID. Complete the signing prompts and any Apple authentication. Answer export-compliance questions based on the actual libraries and applicable requirements; do not blindly mark encryption as exempt. The build runs in Expo's cloud. Open the build URL to follow progress. If it fails, use the first failing build step and its error text as the bug report, then correct and rebuild.

The `beta` profile creates a store distribution binary, automatically increments its build number, includes preview content, and listens to the beta update channel. It is different from the internal preview and simulator profiles. Record the EAS build ID, commit, app version, and build number. [Build profile reference](https://docs.expo.dev/build-reference/eas-json/)

## 8. Upload the exact build to App Store Connect

Use the successful beta build's ID from the previous step:

```powershell
npx.cmd eas-cli@latest submit --platform ios --profile beta --id YOUR_SUCCESSFUL_BETA_BUILD_ID
```

Replace the placeholder; do not paste it literally. Complete the Apple submission credential prompts under the correct team. Uploading through EAS works from Windows. Wait for Apple to process the binary, then resolve any missing compliance information displayed in App Store Connect. This upload makes a build available for TestFlight; public App Store release requires a separate review and release action. [EAS Submit](https://docs.expo.dev/submit/ios/)

## 9. Put it on your own iPhone through TestFlight

1. In App Store Connect, open **Rapid Rounds → TestFlight** and find the processed build.
2. Create an **Internal Testing** group, such as `Owner testing`. Add the build and enter concise “What to Test” notes.
3. Add yourself as an eligible App Store Connect user with access to this app, then add yourself to that internal group. Internal testing supports up to 100 eligible team users; it is not the right category for ordinary students.
4. On your iPhone, install Apple's **TestFlight** app from the App Store. Open the invitation on that phone, accept it, then tap **Install** and **Open**.
5. Confirm the build number in TestFlight. Turn off your computer or disconnect the development server and open Rapid Rounds again to confirm this is the installed build.

TestFlight builds have a 90-day testing lifetime. Upload a new tested build before one expires. [Apple internal testing](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers/)

## 10. Invite nursing students as external testers

After your internal group is created, add an **External Testing** group, such as `Nursing pilot`. Add the intended beta build, test instructions, feedback email, and review contact information. Provide reviewer access if a feature requires sign-in. Submit for TestFlight App Review when prompted; the first external build requires review, and later builds may also need review.

After approval, invite students by email or share a limited public invitation link. Start with a small cohort you can support. They install TestFlight, accept the invitation, install Rapid Rounds, and follow the phone checklist. Apple supports up to 10,000 external testers, but capacity is not evidence that a study app is ready for broad distribution. [Apple external testing](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers/)

Suggested “What to Test” text, to adapt before sending:

> Test the welcome flow, five Rapid Fire questions, one complete case, a lesson, a profile change, photo selection, read-aloud, and reopening the app. Report any confusing wording, incorrect explanation, lost progress, or unresponsive button with the app/build version. This pilot contains study content still awaiting qualified clinical review; do not use it for clinical care or as your only examination preparation.

## 11. Run a real phone acceptance test

Use [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md). Give each tester a task rather than explaining which buttons to press first: “Start a short study session,” “Find what you missed,” and “Make the text easier to read.” Watch where they hesitate.

Test the first installation and an upgrade over an existing beta. Check a small iPhone and a larger one. Try airplane mode, a slow connection, denied photo access, cancellation, larger text, VoiceOver, dark mode, backgrounding, and reopening. Read-aloud on an iPhone may be silent when the phone's silent setting is enabled; distinguish that from a stopped or stuck control.

Have a qualified nursing educator review the scenarios, answers, distractors, scoring, rationales, source currency, and review metadata. Passing technical tests does not publish clinical content. The production content gate must remain closed until that review is recorded.

## 12. Read health checks and collect bugs in ordinary language

The repository contains a GitHub Actions workflow named **Rapid Rounds health checks**. Once pushed to GitHub and allowed to run, it checks pushes, pull requests, manual runs, and a weekly schedule. It does not deploy or submit builds. Open **Actions → a run → Summary** for the plain-language report; download its health artifact for the JSON report and supporting logs. A failed installation gets its own explanation. The scheduled run checks the default branch; it is not a continuous uptime monitor.

Use **Issues → New issue → Report an app problem** for a structured report. Testers without repository access can use TestFlight feedback or the app's configured support route. A private GitHub repository does not automatically give every student access. Do not ask students to paste credentials, patient information, or school records. Review screenshots and diagnostic exports before sharing.

For each issue, record impact, phone/OS, app/build/update version, reproduction steps, expected result, actual result, and the fix version. Use a simple sequence: `New → Confirmed → Fixing → Ready to retest → Closed`. Keep clinical accuracy concerns visible and remove or correct affected content promptly after review. GitHub's check result is evidence about the tested code, not a promise that no bugs exist. [GitHub workflow summaries](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#adding-a-job-summary)

## 13. Update often, with separate beta and public releases

Make small changes in a branch, review the GitHub checks, and test the affected behavior before merging. The included dependency bot proposes updates for review; it does not merge or release them. Grouping Expo updates helps review related libraries together, but still run Expo compatibility checks and phone tests.

For JavaScript, wording, styling, and compatible bundled-content changes, EAS Update can deliver an over-the-air update to a compatible installed binary. A native dependency, permission, app scheme, native icon, SDK, or other native configuration change requires a fresh native build. The fingerprint runtime policy prevents an update intended for a different native runtime from being applied. It cannot establish clinical or functional correctness. [Runtime compatibility](https://docs.expo.dev/eas-update/runtime-versions/)

After the EAS project and environment values are configured, publish an approved beta update with:

```powershell
npx.cmd eas-cli@latest update --channel beta --environment preview --message "Describe the tested beta fix"
```

Retest on the installed beta, including closing and reopening it so the downloaded update can load. Do not reload a student's app in the middle of a question or case. Confirm the update identifier in diagnostics. Keep a short release note explaining the student-visible change and record which native builds it supports.

Only after clinical release approval and production configuration, publish a tested production update separately:

```powershell
npx.cmd eas-cli@latest update --channel production --environment production --rollout-percentage 10 --message "Describe the approved fix"
```

Check crashes, reports, and completion metrics before expanding. Use the interactive `npx.cmd eas-cli@latest update:edit` to select the correct production update and increase its rollout percentage. Use `npx.cmd eas-cli@latest update:revert-update-rollout` to revert an active rollout. Confirm channel/runtime before every change. [Expo staged updates](https://docs.expo.dev/eas-update/rollouts/)

For a general rollback, `npx.cmd eas-cli@latest update:rollback` guides you to republish an earlier compatible update or restore the update embedded in a native build. Reverting an update does not repair corrupted persisted data or replace native code; those need a specific recovery plan and possibly a new build. Test rollback during beta before relying on it for students. [Expo rollback](https://docs.expo.dev/eas-update/rollbacks/)

Do not redirect the production channel to the beta branch. Preview content and preview service settings must never be promoted to public users through an update shortcut.

## 14. Move from beta to a public product

Before a public submission, complete the clinical review workflow; configure real sign-in and support services; verify account deletion if accounts are offered; decide how cross-device saving works; and publish accurate privacy/support pages. Fill Apple's privacy disclosures to match the diagnostics and analytics actually enabled, including third-party SDK behavior. Avoid collecting patient information in this student study app. Resolve the release checklist and any serious open bugs.

Build with `npx.cmd eas-cli@latest build --platform ios --profile production`, test that exact candidate in TestFlight, and submit its build ID with the production submission profile. The production profile excludes unreviewed content, so verify it contains sufficient approved learning material before presenting it as usable. Select that candidate in App Store Connect, complete screenshots, description, age rating, privacy and review information, and submit it for App Review. Choose the release timing after approval. [Apple submission overview](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/overview-of-submitting-for-review/)

## 15. Android follows the same quality process

For a direct physical Android test, run `npx.cmd eas-cli@latest build --platform android --profile preview`, open the resulting APK link on the phone, and follow its installation prompts. An APK is directly installable; an AAB is uploaded through Google Play. For eventual Play testing, create the owner's Play Console app and follow its current account-specific testing requirements before public release. Keep the same health checks, content review, support process, and device checklist. [Expo Android submission](https://docs.expo.dev/submit/android/)

## Expo Go and localhost: what they are for

The browser at `http://localhost:8085/` is a web preview on this computer. Typing that address on an iPhone refers to the iPhone itself, not this computer. Expo Go, when its available version matches the project's SDK, can help try supported JavaScript behavior over a local development connection. It does not contain arbitrary project-specific native code, is not the release artifact, and is not the supported target for this app's native OAuth callback validation. Use an installed preview or TestFlight build for acceptance testing. [Expo Go limitations](https://docs.expo.dev/develop/development-builds/introduction/)

## What remains owner-dependent

This repository can prepare and check the app. The owner still needs to establish the actual GitHub repository access, Expo project, Apple membership and app record, signing credentials, service accounts, feedback destination, privacy policy, and clinical review responsibility. Do not mark “TestFlight ready” until the uploaded build opens successfully on a real tester's phone.
