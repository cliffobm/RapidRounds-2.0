# Account setup and native verification

## Current status

The required libraries are installed and the active app now includes email/password accounts, password recovery, Google/Apple browser OAuth, PKCE callbacks, session restoration, and local sign-out. Native photo selection, speech, and automatic appearance are integrated too. The files in `docs/native/` are historical templates; do not copy them over the active source.

Live sign-in remains unavailable until an owned Supabase project is configured. The connected Supabase account returned no projects on September 13, 2026. No real account, provider login, or signed native binary was created during this work. Guest study remains available without configuration, and the unconfigured account screen does not collect passwords.

## Connect an owned project

Add these values to the local `.env` and intended EAS build environment. Restart the preview or rebuild after changing public environment values.

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_PUBLISHABLE_OR_ANON_KEY
EXPO_PUBLIC_AUTH_GOOGLE_ENABLED=false
EXPO_PUBLIC_AUTH_APPLE_ENABLED=false
```

Prefer a modern `sb_publishable_` key. The existing variable name also accepts a legacy anon key. Every `EXPO_PUBLIC_` value ships in the app: never use a secret/service-role key, OAuth secret, Apple private key, or SMTP password here. The app makes Auth calls only; it creates no application database tables and does not synchronize study data. Any future database or storage API needs appropriate row-level security and account ownership rules.

In Supabase Authentication, configure email/password, email confirmation, a password policy, and rate limits. Configure custom SMTP for delivery to intended testers and students. The default SMTP service is restricted, and new Free projects using default SMTP cannot customize email templates. See the [default email-provider notice](https://supabase.com/changelog/29370-supabase-auth-changes-to-default-email-provider) and [email-template change](https://supabase.com/changelog/46599-changes-to-email-template-customisation-on-free-tier).

Use the owned web origin as Site URL. Add exact redirect targets to Supabase's allowlist:

- Installed native development/internal build: `rapidrounds://auth/callback`
- Local browser on port 8085: `http://localhost:8085/auth/callback`
- Production web: `https://YOUR_OWNED_HOST/auth/callback`

Use the actual value returned by `getAuthRedirectUri()` in the running app. A hosted web app must serve its app shell at `/auth/callback`. Avoid broad production wildcards. Keep the `rapidrounds` scheme in Expo configuration; scheme or native-module changes require a native rebuild. Use a development/internal build for native OAuth testing; Expo Go is not the supported stable callback target.

Email confirmation and reset templates should preserve Supabase's confirmation URL and requested redirect. PKCE exchanges the returned code using the verifier saved where the request began, so open the email link on that same device and browser profile. Cross-device email recovery needs a separately designed token-hash flow and is not supplied here. The new-password form is authorized by the SDK's verified recovery result/event, never just a user-supplied `flow=recovery` query value.

The optional sign-up handle is `user_metadata.username`, not a reserved or unique login identifier. Sign-in uses email/password. The device-local study handle can be edited independently.

## Google and Apple

For Google, create the owner's OAuth web client. Use the exact callback displayed in Supabase's Google provider settings, normally `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`. Configure consent, audience/testers, and any required verification. Store the client ID/secret in Supabase, enable the provider there, then set `EXPO_PUBLIC_AUTH_GOOGLE_ENABLED=true` in the app environment after testing.

For Apple, follow the current [Supabase Apple guide](https://supabase.com/docs/guides/auth/social-login/auth-apple) to configure the owner's App ID, Services ID, domain/return URL, Sign in with Apple key, and client secret. Store secrets in Supabase and manage their renewal through the owner's Apple Developer account. Set `EXPO_PUBLIC_AUTH_APPLE_ENABLED=true` only after the provider is configured and verified.

These integrations use browser OAuth. Native apps open the system authentication browser and return through the app scheme; web uses same-tab navigation. They are not native Google Sign-In or AppleAuthentication SDK integrations. Provider flags alone do not configure a provider or establish store compliance.

## Sessions and local data

The Supabase client is pinned to `2.116.0`, uses PKCE, and disables automatic implicit URL session detection. The controller validates callback protocol, host, and path; exchanges only a returned authorization code; rejects implicit token callbacks; and handles the SDK's optional `sb_flow_id`. Native secure randomness and SHA-256 are provided through Expo Crypto when required. Unsupported crypto fails with an error rather than falling back to weak PKCE.

Native tokens and verifier data use Expo SecureStore with chunked values and a manifest committed after all chunks. Storage failures are surfaced, with no fallback to plaintext token storage. Browser auth uses localStorage and depends on the origin's security and available storage. Native refresh follows foreground/background state.

The app subscribes to account state at its root. Recovery and callback errors open the account screen, and a restored session can proceed past first-use onboarding. Sign-out uses local scope and keeps study data. Erasing local data signs out this device but does not delete a remote account.

Profile, avatar, preferences, responses, rewards, and reports remain device-local and are not partitioned by remote account. Signing into another account on a shared device does not isolate that device's study history. Per-account ownership, migration/consent, cloud synchronization, and authenticated server-side account deletion remain release work. Never embed privileged admin deletion credentials in the app.

## Native photo, speech, and appearance

The system image picker opens when the user chooses a profile photo. It supports square cropping and compression; accepted JPEG/PNG/WebP data is decoded and limited to 600 KB. Selection changes the profile draft; Save persists it locally. Android interrupted-picker recovery also returns a draft. The feature does not upload photos or request camera/microphone access. Web selection retains its browser file chooser and does not crop or compress.

Read-aloud uses `expo-speech` natively and the Web Speech API in supported browsers. One controller serializes stop/start, splits long text, ignores stale completion callbacks, and stops on navigation/backgrounding. Available voices, audio routes, and iOS silent mode require physical-device checks.

`expo-system-ui` is installed and `userInterfaceStyle` is automatic. Explicit Light/Dark preferences still override the device setting. Rebuild to include these native modules and configuration.

## Verification before enabling real accounts

Local tests cover controller behavior with mocked Auth APIs and secure-storage adapters. They do not prove live identity-provider authentication. Type checking and platform exports likewise do not replace installed-app testing.

1. Confirmed email sign-up: no session before verification, same-device link return, and correct signed-in identity. Check incorrect passwords, rate limits, email-delivery errors, and offline requests.
2. Password recovery: link request/return, verified recovery screen, password update, subsequent login, expired/used links, and wrong-device PKCE failure.
3. Google and Apple on physical iOS/Android: success, cancellation, provider errors, cold start, resumed return, and duplicate callbacks.
4. Browser callback route, page reload, same-tab provider navigation, and same-browser email confirmation/recovery.
5. Session persistence/refresh, sign-out during delayed callbacks, denied or full storage, and local erase. Keep tokens and credentials out of logs/profile storage.
6. Photo selection/cancellation, crop, oversized images, save/reload/remove, and Android interrupted-picker return.
7. Long speech passages, quick stop/restart, navigation/backgrounding, audio routes, iOS silent mode, system theme changes, large text, VoiceOver, and TalkBack.

Signed builds require the owner's Expo/EAS project and, for physical iOS distribution, Apple Developer setup. See the main README's build instructions. No APK/IPA has been generated yet.

## Official references

- [Expo SDK 57 AuthSession](https://docs.expo.dev/versions/v57.0.0/sdk/auth-session/)
- [Expo SDK 57 WebBrowser](https://docs.expo.dev/versions/v57.0.0/sdk/webbrowser/)
- [Expo SDK 57 SecureStore](https://docs.expo.dev/versions/v57.0.0/sdk/securestore/)
- [Expo SDK 57 ImagePicker](https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/)
- [Expo SDK 57 Speech](https://docs.expo.dev/versions/v57.0.0/sdk/speech/)
- [Supabase React Native Auth](https://supabase.com/docs/guides/auth/quickstarts/react-native)
- [Supabase PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow)
- [Supabase code exchange](https://supabase.com/docs/reference/javascript/auth-exchangecodeforsession)
- [Supabase password Auth](https://supabase.com/docs/guides/auth/passwords)
- [Supabase Google Auth](https://supabase.com/docs/guides/auth/social-login/auth-google)
