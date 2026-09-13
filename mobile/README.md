# Rapid Rounds — nursing study preview

Rapid Rounds is an Expo SDK 57 / React Native / TypeScript app built from the cardiac vertical slice in the existing `OneDrive/Desktop/ChatGPT/RapidRounds 2.0` project. The current preview adds learning, review, rewards, lessons, unfolding cases, personal preferences, and a branding gallery. All teaching content still requires independent nurse-educator review. Guest study is functional. Authentication code is integrated but needs an owned Supabase project and provider configuration; no signed mobile app has been produced.

## Run locally

Requires Node 22.13 or newer.

```sh
npm ci
```

Copy `.env.example` to `.env` to enable `EXPO_PUBLIC_CONTENT_PREVIEW=true` for local/internal testing, then:

```sh
npm start
```

Use an Expo Go version supporting SDK 57, or prepare a development/internal build if the device's Expo Go version is incompatible. For the browser preview, use `npm run web`. Browser testing does not establish native-device behavior.

```sh
npm run typecheck
npm test
npx expo export --platform all
```

## Current content and learning experience

The internal preview includes **66 standalone practice questions, four six-stage unfolding cases, and six concept lessons**. The question total consists of 30 inherited cardiac items and 36 new adult-health items; the 24 linked case decisions are separate from that total. Topics include cardiac assessment, breathing/oxygenation, perfusion, glucose, infection/deterioration, fluid/electrolytes, and medication safety. This is a limited adult-health collection, not full nursing-curriculum or NCLEX blueprint coverage.

- **Today and Library:** start a round, browse topics/concepts, open a lesson, or follow a changing patient. Lessons include teaching steps, a worked example, reflection, linked sources, and a route into related practice.
- **Learn:** untimed practice, confidence selection, immediate answer feedback, explanations, and reflection. Default length is five questions; setup also supports 10, 20, 30, or 50. Returning to difficult content carries no learning retry penalty.
- **Rapid Fire:** optional timed challenge across one topic or the mixed bank. Choose 5, 10, 20, 30, or 50 questions; the actual count is capped by the eligible pool, without duplicates within the round. Default challenge length is ten. Explanations wait until completion.
- **Difficulty:** choose all levels, foundation, application, or advanced in setup; the profile saves a preferred starting filter. These are editorial labels, not calibrated exam difficulty. The original cardiac bank is classified as application practice in this interface. Due review and linked cases follow their own selection rules.
- **Review:** up to five due concepts per session, one available question per concept, preferring unseen questions before repeats. The app does not generate new content or guarantee a fresh parallel case when the small pool is exhausted.
- **Four unfolding cases:** heart-failure deterioration, an adult asthma flare, recurrent low glucose, and evolving suspected infection. Each follows six clinical-judgment stages with current and expandable prior chart entries; future information stays hidden. Feedback and case concept evidence are committed after all stages are complete. An abandoned case does not commit its concept evidence.
- **Supported formats:** single choice, select-exactly-N, multiple response, and matrix practice. Multiple response uses +1 per correct selection and −1 per incorrect selection, floored at zero; select-N awards correct selections; matrix awards correct rows. The scoring layer accepts cloze rows, but there is no authored dropdown/cloze experience. Bow-tie and highlighting are not implemented.
- **Explanations:** recorded responses, correct answers, detailed rationales, and reflection prompts. New cases include cues, mechanisms, reasoning notes, references, versions, and review status. The inherited items retain their original rationales and review-pending source notes. Reflection prompts are not graded transfer assessments.

The original 70/15/10/5 challenge-scoring formula and 1.0/0.8/0.6 retry multipliers remain intact. Starting a challenge counts as an attempt even if abandoned. Timeouts count as incorrect; hiding the countdown or backgrounding the app does not pause it. The learner advances manually after a timeout. Challenge scores, practice points, confidence, and XP are different measures; none predicts passing the NCLEX.

## Review scheduling and rewards

Responses record correctness/partial credit, confidence, time, and first versus repeated exposure. First-encounter accuracy is displayed separately from repeated-item practice.

The provisional review schedule uses 1-, 3-, 7-, and 14-day intervals. Fully correct responses marked somewhat sure or sure can advance the interval once per UTC day. A confidently incorrect answer is due immediately; other incorrect or unsure responses return in one day and mark the concept for support. Confidence changes scheduling, not answer points. Learn, Review, and Rapid Fire responses update concepts when submitted; cases update at completion. These rules have not been validated for retention or readiness.

XP, levels, study-day streaks, and six milestone badges provide local encouragement. A qualifying answer can award item XP only once per exact item/version; replaying the same item does not add more item XP. Learn/Review/case completion bonuses require newly rewarded content in that session. Timeouts and imported old answers do not generate new answer XP. A separate reward ledger preserves awards when old session history is trimmed. Device clocks/storage remain user-controlled, so these rewards are not a secure competition or leaderboard system.

## Onboarding and profile

A first-use introduction explains learning, review, and guest study. Users can skip it, return to its pages, or replay it from Profile. The startup screen has an approximately 950 ms React Native RR/logo reveal after the operating system launches the app. Device and saved reduced-motion preferences skip that motion. This is an in-app reveal, not a custom animated operating-system launch screen.

Profile offers optional display name, study handle, age range, pronouns, country/region, school, program, study stage, and goals. Personal details do not generate a personalized curriculum. Save/cancel feedback distinguishes draft changes from saved preferences. The study handle is local metadata, not a unique username or sign-in credential.

- Appearance offers device, light, or dark settings. `expo-system-ui` is installed and automatic native appearance is configured; rebuild the native app to include it.
- Text-size preferences are standard, 1.15×, or 1.3×, alongside device accessibility scaling.
- Read-aloud uses the Web Speech API in supported browsers and `expo-speech` on iOS/Android, with slower/standard/faster rates and stop controls. Long passages are split into chunks; navigation, backgrounding, and replacing a reading stop the previous passage. Voice availability and audio quality need device testing; iOS silent mode can prevent speech.
- Reduced motion is saved and used by the opening reveal.
- Photo selection uses a browser file chooser on web and the system image picker on iOS/Android. Native selection offers square cropping and compression. JPEG/PNG/WebP checks, image decoding, and a 600 KB saved-image limit apply. Selection edits the profile draft; Save persists the photo locally. It is not uploaded. Camera and microphone access are not requested. Physical-device picker testing remains outstanding.

Typed `RESET` confirmation removes study progress, active sessions, review schedules, rewards, and local concerns. Typed `ERASE` also removes the local profile/photo/preferences and branding selection. Neither deletes a remote account.

## Authentication and native integrations

The previously blocked dependencies are installed. Active source now includes email sign-in/sign-up, password recovery, Google/Apple browser OAuth, PKCE callbacks, session restoration, local sign-out, and native secure-session storage. The Supabase client is pinned to `2.116.0` in the package manifest and lockfile. Old files in `docs/native/` are historical templates and must not overwrite the current implementation.

Without valid public Supabase configuration, the account screen shows setup-required states and collects no passwords. Google and Apple additionally require their provider settings and individual app flags. No live account or identity-provider flow has been verified; the connected Supabase account had no projects when checked on September 13, 2026.

[Authentication setup and verification](docs/AUTH_SETUP.md) covers the remaining configuration and device checks. Study data still stays on the device, including after sign-in. Cross-device sync, per-account study-data isolation, educator report delivery, and remote account deletion remain release work.

## Local data and content identity

AsyncStorage holds the profile, photo, brand preference, study state, content reports, and reward ledger. Study state includes question snapshots, submitted responses, active deadlines, concept schedules, and challenge attempt counts. The latest 100 completed sessions are retained; exposure and reward records are maintained separately. Unsaved answer selections are not submitted responses.

A last-valid local study snapshot supports recovery if the current save is missing or corrupt. The UI exposes load/save failures and retry controls. Recovery may lose the latest action, and deleting app storage can remove both snapshots. There is no cloud backup or user-facing export/import.

The inherited catalog uses fixed editorial IDs `rr-cardiac-001` through `rr-cardiac-030`, explicit legacy aliases, and versioned metadata. Option IDs use the stable item ID and original option order. New questions, lessons, and case stages also have authored IDs and versions. Stem corrections must preserve editorial identity and update the source join/version deliberately. Migration retains earlier mobile-preview sessions, attempts, and reports; answered snapshots preserve the original wording.

Reports include the question ID, version, prompt, concern, and timestamp. They remain on the device and can be viewed in Progress; no report is sent to an educator and there is no reviewer inbox. Do not put patient or personal information in a concern.

## Clinical publication gate

All questions, cases, case stages, and lessons remain `needs_review`. Preview mode intentionally admits them for internal testing. Without the preview flag, only `published` content is playable; there is currently none. A case is withheld if any linked stage is unavailable.

Restored sessions must match currently publishable IDs/versions in production. Unavailable snapshots are retained as withheld sessions for preservation rather than silently discarded; the UI explains when they are hidden. References and technical QA do not establish clinical approval, educational efficacy, or exam validity.

## Branding choices

The original RR mark remains the default. The gallery offers three generated concepts: **Orbit RR, Ribbon RR, and Spark RR**, including small-size previews. A selection is saved locally and previews the app header/opening reveal. It does **not** replace the installed launcher icon or commit a final brand decision. Users can return to the original mark.

[Logo concepts and generation prompts](docs/LOGO_CONCEPTS.md) records the three concepts and their provenance. Final launcher artwork needs a deliberate selection, asset preparation, and a new native build.

## Path to installable mobile builds

Sign into the owner's Expo account and link this directory to an owned EAS project:

```sh
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --platform android --profile preview
```

The preview profile targets an Android APK. Follow the EAS result link after a successful build. `com.rapidrounds.preview` is a provisional identifier; choose an identifier the owner controls before publishing. EAS may require account setup/build credits.

Physical-iPhone internal distribution requires Apple Developer membership and registered tester devices:

```sh
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile preview
```

For an iOS simulator on a Mac:

```sh
npx eas-cli@latest build --platform ios --profile simulator
```

Windows can initiate cloud builds but cannot run Apple's simulator locally. EAS credentials/project ownership have not been configured here. **No signed APK or IPA has been produced.** JavaScript/Hermes exports are not installable native binaries.

Before public beta: independently review/publish the content; implement editorial review and correction delivery; configure and verify accounts; test real Android/iOS devices, large text, screen readers, recovery, and offline behavior; establish privacy/account-deletion handling; finalize identifiers, artwork, signing, and store records; then validate through TestFlight and Google Play internal testing. Expand curriculum coverage and evaluate learning outcomes with students/faculty before readiness or efficacy claims.

## Source provenance

`lib/domain/types.ts`, `lib/rapidRound/scoring.ts`, `content/cardiac-pack.ts`, and `tests/scoring.test.ts` originate in the local RapidRounds 2.0 project. Its original stack is Next.js 15, React 19, TypeScript, and Supabase. The mobile copy initially replaced per-launch random IDs with stem-derived IDs; the editorial catalog now adds permanent IDs and preserves migration aliases. The inherited clinical wording and original challenge-scoring formula are unchanged.

`content/learning-cases.ts` and `content/expanded-content.ts` contain new fictional teaching material with source links and pending-review status. Original source projects were not modified and no environment secrets were copied. The older RapidRounds project contains features that were not migrated; confirm the intended source branch before future backend work.

## Branding provenance

Generated with the built-in image-generation tool. Final prompt: “Use case: logo-brand. Create a polished square mobile app icon for Rapid Rounds, a gamified nursing study app. A memorable bold abstract RR monogram suggesting a fast circular round and forward motion, with a subtle pulse cut into the shape. Vibrant electric violet, aqua and warm coral on deep midnight navy. Flat crisp geometric shapes, minimal, professional but playful. Large central mark with generous safe margins, legible at tiny sizes. Full bleed solid midnight background, no rounded outer border. No words, no mockup, no watermark. Return a single square icon.” Asset: `assets/rapid-rounds-icon.png`. Review the icon at small sizes and against store asset requirements before submission.

## Official build references

The opaque native app icon is `assets/app-icon.png` (verified RGB with no alpha); the default in-app mark and Android adaptive foreground use `assets/rapid-rounds-icon.png`. The built-in image tool produced the opaque variant with this edit prompt: “Edit this exact Rapid Rounds RR logo for a production mobile app icon. Preserve the colorful RR monogram, pulse, circular arrows and proportions. Replace ALL transparency with a completely opaque solid midnight navy background #0C1122 filling the entire square canvas edge to edge. No transparent pixels. Single flat square icon, no rounded corners, no mockup, no text. Center the existing mark at about 70 percent of the canvas width for safe margins. Output 1024 by 1024 pixels.” The returned source image is square at 1254px; Expo generates platform icon sizes during native builds.

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [EAS build setup](https://docs.expo.dev/build/setup/)
- [Internal distribution](https://docs.expo.dev/build/internal-distribution/)
- [Android APK builds](https://docs.expo.dev/build-reference/apk/)


## Verification and remaining checks

Validation on September 13, 2026: TypeScript passed; **211 tests in 14 files passed**; and preview-mode JavaScript/Hermes exports completed for web, iOS, and Android with the installed native integrations. Expo's dependency compatibility check passed, and configuration introspection confirmed the callback scheme, automatic appearance, photo-library message, and camera/microphone exclusion. These exports are not signed installable apps.

Browser walkthroughs covered first-use/returning-user flows, saved profile preferences and clearing optional fields, light/dark and enlarged text at a phone-sized viewport, photo selection/removal, read-aloud start/stop, setup-required sign-in states, guarded reset cancellation, lesson-to-practice navigation, search recovery, question-count caps, a five-question learning round, the full six-stage asthma case, result explanations/XP, logo selection/reopening/replay, and reduced motion. Reset execution and storage-failure recovery were verified with isolated unit tests rather than erasing the preview's existing study history. Browser testing does not establish native accessibility or audio quality.

The September 13 browser check confirmed the restarted preview, guest account fallback, retained study history, preference saving, and lesson read-aloud start/stop. Temporary reading preferences were restored afterward. Added unit tests cover speech cancellation/chunking, native photo-result validation, auth callback/session races, public-key guards, and secure-storage commit/failure behavior. Auth APIs and native storage are mocked in these tests; no successful live provider login is claimed.

Independent clinical review, provider authentication, native installation, VoiceOver/TalkBack, and physical-device testing remain outstanding. A fresh September 13 `npm audit --omit=dev` reported **10 moderate, zero high, and zero critical findings**, involving Expo build tools through `xcode` → `uuid` ([GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq)). The suggested incompatible Expo downgrade was not applied. Resolve or reassess this dependency chain before release.

## Help, monitoring, and release operations

Profile now includes **Help & app health**: device checks, plain-language explanations of known failures, report drafts and previews, copy/share, optional online delivery, and opt-in usage/error sharing. The optional Sentry/PostHog services still require owner setup; no live delivery or analytics dashboard is claimed. These are ordinary code-based tools and do not call an AI service.

Run `npm run health` for type checks, tests, Expo compatibility, platform exports, and a dependency audit. It writes `reports/health/health-report.md` and supporting logs. GitHub automation runs the same checks on pushes/PRs, with a weekly schedule once merged to the default branch. It never automatically publishes a mobile build.

- [Detailed iPhone and TestFlight instructions](docs/TESTFLIGHT_GUIDE.md)
- [Monitoring and reporting setup](docs/MONITORING_SETUP.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)

The new `beta` EAS profile is store-signed for TestFlight and includes teaching drafts. Production continues to withhold unreviewed content. `expo-updates` is installed, but updates stay disabled until the owner supplies a real Expo project ID. The dynamic config then uses a fingerprint runtime and separate preview/beta/production channels. Native changes still require a new binary.
