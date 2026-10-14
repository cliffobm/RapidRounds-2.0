# Account authentication update

Development branch: `sprint4/cjis-source-migration`. The signup migration is applied only to **RapidRounds-2.0-Sprint4-Test**, project `ztjudfbsvwqnmqqgkknn`, version `20261014134356`. No production deployment or merge is part of this update.

Google sign-in, email/password account creation and sign-in, email sign-in links for existing accounts, and password recovery share the cookie-backed Supabase session. Google is hidden until `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true`. GitHub/Discord are no longer advertised as configured options. `/test-oauth` redirects to the canonical sign-in page.

OAuth and email callbacks accept only safe local return paths, handle expired/cancelled exchanges, and disable caching/referrers on their redirect responses. The database provisions new student/free profiles. Callbacks never upsert profiles or overwrite existing roles. User metadata supplies presentation fields only. Both private trigger functions use `SECURITY INVOKER`; the Auth service has limited insert grants/RLS, and ordinary clients still cannot create profiles or write protected role/identity/billing fields.

## Verification evidence

- 177 unit tests in 21 files pass under Node 20, including signup confirmation/session state, provider visibility/errors, email/recovery requests, safe destinations, code/token verification and password updates.
- Source migrations plus the new signup migration pass in a disposable PGlite PostgreSQL instance. `tests/database/auth-signup.sql` runs as `supabase_auth_admin` and `authenticated`, checking default student/free provisioning, ignored privilege metadata, own-profile reads/edits, cross-user isolation, blocked protected writes, and repeat-login preservation. All fixture account changes roll back.
- Hosted metadata checks confirm the new trigger, invoker functions, restricted grants, no client insert privilege, and zero missing profiles for existing email accounts. Hosted `SET ROLE supabase_auth_admin` is restricted by Supabase; the role-execution test above is local PostgreSQL, not a claim of a live signup through the Auth service.
- Security advisors before/after the test-project migration show no new finding. Existing findings remain: seven [mutable function search paths](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable), the deny-by-default [institutions table without policies](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), and [leaked-password protection disabled](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
- Production build and desktop/mobile simulated-provider browser validation are being completed for this branch checkpoint. Final results will replace this line after verification.

## Required live setup

Follow [scripts/setup-oauth.md](../scripts/setup-oauth.md). Google Cloud client/consent configuration and the client secret must be entered directly in Supabase. The connector cannot configure those credentials. Email signup/link/recovery delivery requires enabled Email/signup settings, approved redirect URLs, and suitable SMTP. No real account email was sent by automated tests.

Live Google consent, mail delivery/confirmation/recovery, verified identity linking, and the colleague-site origin remain unverified until those settings and an actual hosted URL are available. Simulated browser APIs prove application request/callback/cookie behavior; they do not prove hosted Auth policy, mail delivery, or Google credentials. Existing dependency/clinical/billing limitations from the UI audit still apply.
