# RapidRounds account setup and testing

Work on `sprint4/cjis-source-migration` and the **RapidRounds-2.0-Sprint4-Test** Supabase project (`ztjudfbsvwqnmqqgkknn`). Production is separate. The app supports Google, email/password signup and sign-in, passwordless email links for existing accounts, and password recovery. Email links do not silently create new users; use **Create account** first.

## 1. Run the new development version

In PowerShell, stop the running server with Ctrl+C, then:

```powershell
cd C:\Users\bmc09\source\RapidRounds-Test
git switch sprint4/cjis-source-migration
git pull --ff-only origin sprint4/cjis-source-migration
npm run dev
```

The existing URL and publishable key in `.env.local` still apply. Add this flag **after** configuring Google, then restart `npm run dev`:

```dotenv
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
```

The flag controls button visibility only. Supabase must enable the provider too. Google client ID/secret go in the Supabase dashboard, never a `NEXT_PUBLIC_` variable, Git commit, or chat. The app does not need `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` environment variables.

## 2. Configure Google Cloud

Open [Google Cloud Console](https://console.cloud.google.com/) and select or create the RapidRounds test project. In **Google Auth Platform**, configure Branding (app name, support email), Audience, and Data Access. Use an External audience if personal Google accounts will sign in; while the app is in Testing, add each tester's Google email as a test user. Request only the basic `openid`, email, and profile scopes.

Under **Clients**, create an OAuth client of type **Web application**:

| Google field | Value for this test setup |
| --- | --- |
| Authorized JavaScript origin | `http://localhost:3000` |
| Authorized redirect URI | `https://ztjudfbsvwqnmqqgkknn.supabase.co/auth/v1/callback` |

The Google redirect URI is the **Supabase** callback. The app's `/auth/callback` belongs in Supabase's redirect settings instead. Add the actual HTTPS colleague-site origin when that URL is known. Do not guess the host or configure production credentials for this test project.

Copy the client ID and client secret directly into [Supabase → Authentication → Sign In / Providers → Google](https://supabase.com/dashboard/project/ztjudfbsvwqnmqqgkknn/auth/providers), enable Google, and save. Keep nonce checking and email verification protections enabled. Then set the app flag in step 1 and restart the app (rebuild/redeploy a hosted preview after changing a `NEXT_PUBLIC_` variable).

## 3. Supabase URLs, email, and signup

In [Authentication → URL Configuration](https://supabase.com/dashboard/project/ztjudfbsvwqnmqqgkknn/auth/url-configuration), use `http://localhost:3000` as the **test** Site URL. Add `http://localhost:3000/**` to Additional Redirect URLs. If you deliberately use `127.0.0.1`, add `http://127.0.0.1:3000/**` too. Keep the same hostname throughout a sign-in attempt so PKCE cookies match.

For the colleague preview, add its fixed HTTPS origin and callback path, including the callback's `next` query parameter (a path-scoped pattern such as `https://ACTUAL-HOST/auth/callback**`). Add `/auth/confirm` only if using the optional templates below. Use only owned hosts; avoid wildcard hostnames in production. A separate production Supabase project needs its own URLs and Google client setup.

In **Sign In / Providers → Email**, enable Email, allow new signups, keep email confirmation enabled, and set the minimum password length to at least 8. The application never asks users to choose an administrative role. New accounts receive a student/free profile in the database.

For real email recipients, configure [custom SMTP](https://supabase.com/dashboard/project/ztjudfbsvwqnmqqgkknn/auth/smtp) using your email provider's verified sender and SMTP credentials. Supabase's default mail service is restricted to project-team email addresses and currently only two messages per hour. SMTP secrets belong in Supabase. Do not disable confirmation to work around delivery failures.

In **Email Templates**, use `{{ .ConfirmationURL }}` for Confirm signup, Magic link, and Reset password. It includes the allowlisted return URL supplied by the app. Open the email in the same browser/device that requested it. The server exchanges the returned `code` and writes session cookies before redirecting to the original page or the password editor.

Optional server-verified token templates are supported at `/auth/confirm`. For a single fixed test/preview Site URL, links can instead use:

```html
<!-- Confirm signup or Magic link -->
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/profile">Continue to RapidRounds</a>

<!-- Reset password -->
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Reset password</a>
```

These optional templates always return to the configured Site URL; use the default ConfirmationURL approach when testing multiple origins. The token endpoint accepts only email/signup/magiclink/recovery tokens and never changes profile roles.

## 4. Database provisioning

`supabase/migrations/20261014134356_provision_auth_profiles.sql` is applied to the named test project. Other environments must apply the reviewed migration through their normal migration process before enabling public signup; do not re-run the old initial SQL files on an existing project.

The Auth service gets only the schema usage and insert columns it needs. Both trigger functions are `SECURITY INVOKER`, have an empty search path, and live in the private schema. RLS permits only student/free inserts from `supabase_auth_admin`. User-supplied role/subscription metadata is ignored. Browser users cannot insert profiles or write the role registry. Existing profiles are never overwritten by the callback or the missing-profile backfill.

## 5. Verify the full flow

Start at [the sign-in page](http://localhost:3000/auth/sign-in). Use test accounts and record the result of each step:

1. **Email/password:** existing learner A signs in; refreshing `/profile` keeps the same email, student role, and saved edits. Sign out and repeat with learner B; A's profile must not appear.
2. **Create account:** use an email you control, enter matching passwords, and submit. With confirmation enabled, the app asks you to check email and does not treat the account as signed in. Follow the confirmation link on the same device. `/profile` shows that email and student/free defaults. Sign out, then sign in with the new password.
3. **Email link:** choose **Email me a sign-in link** for that existing account, follow the link, and refresh `/profile`. An unregistered address receives the same neutral notice without creating an account. Expired/used links return to sign-in with a usable recovery message.
4. **Password recovery:** sign out, choose **Forgot password?**, request a link, open it, and enter a matching new password. Sign out again; the old password must fail and the new password must work. Visiting `/auth/reset-password` without a valid session returns to sign-in.
5. **Google:** choose **Continue with Google**, select an allowed test Google account, accept consent, and verify the return to the app. A new Google account gets a student/free profile. Refresh, sign out/in, and confirm saved profile edits and any administrator-assigned role remain intact. Cancelling Google consent must return to a usable sign-in page.
6. **Return path:** sign out and visit `/profile`; after successful sign-in you return to `/profile`. A forged external `redirectTo` must return to `/` within RapidRounds.
7. **Hosted preview:** repeat steps 2–5 on the actual colleague-site URL after configuring its URLs and environment. Localhost tests alone do not verify the hosted preview.

Optional read-only configuration check:

```powershell
node scripts/test-oauth.js
```

This checks public provider flags, not credential validity, Google consent, mail delivery, or hosted account isolation. Automated evidence and remaining live checks are recorded in `docs/AUTH_SETUP.md`.

Sources: [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google), [password auth/recovery](https://supabase.com/docs/guides/auth/passwords), [email links](https://supabase.com/docs/guides/auth/auth-email-passwordless), [email templates](https://supabase.com/docs/guides/auth/auth-email-templates), [SMTP restrictions](https://supabase.com/docs/guides/auth/auth-smtp), [redirect URL configuration](https://supabase.com/docs/guides/auth/redirect-urls).
