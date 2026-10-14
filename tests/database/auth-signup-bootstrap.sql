-- Disposable PostgreSQL fixture, never run this against a Supabase project.
-- A minimal Auth table permits exercising the real migration as Auth's role.
CREATE SCHEMA auth;
CREATE TABLE auth.users (
  id uuid PRIMARY KEY,
  email text,
  raw_user_meta_data jsonb DEFAULT '{}',
  last_sign_in_at timestamptz
);
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE anon NOLOGIN;
CREATE ROLE supabase_auth_admin NOLOGIN;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.role', true), '');
$$;
GRANT USAGE ON SCHEMA auth TO authenticated, anon, supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT INSERT, UPDATE ON auth.users TO supabase_auth_admin;
GRANT SELECT (id) ON auth.users TO supabase_auth_admin;
