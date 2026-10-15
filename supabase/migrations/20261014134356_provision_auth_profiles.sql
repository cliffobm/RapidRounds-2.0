-- Provision email/OAuth accounts inside the Auth transaction. No browser or
-- service-role client writes profiles, roles, or subscription fields.
-- SECURITY INVOKER keeps the Auth service subject to these explicit grants/RLS.
GRANT USAGE ON SCHEMA public, private TO supabase_auth_admin;
GRANT INSERT (id, email, full_name, avatar_url) ON public.profiles TO supabase_auth_admin;
GRANT INSERT (user_id, role) ON private.profile_roles TO supabase_auth_admin;

CREATE POLICY "Auth service creates student profiles" ON public.profiles
  FOR INSERT TO supabase_auth_admin
  WITH CHECK (
    role = 'student' AND subscription_tier = 'free' AND trial_active = false
    AND trial_expires_at IS NULL AND trial_rationales_used = 0
    AND institution_id IS NULL AND stripe_customer_id IS NULL
  );
CREATE POLICY "Auth service creates student role entries" ON private.profile_roles
  FOR INSERT TO supabase_auth_admin WITH CHECK (role = 'student');

CREATE OR REPLACE FUNCTION private.sync_profile_role() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- A newly inserted profile cannot already have a role entry (FK + PK).
    -- Avoid requiring UPDATE privileges for Auth's initial student insert.
    INSERT INTO private.profile_roles(user_id, role) VALUES (NEW.id, NEW.role);
  ELSE
    INSERT INTO private.profile_roles(user_id, role) VALUES (NEW.id, NEW.role)
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.sync_profile_role() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.sync_profile_role() TO supabase_auth_admin;

CREATE FUNCTION private.create_auth_user_profile() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    -- Metadata is presentation data only. Role/billing use database defaults.
    INSERT INTO public.profiles(id, email, full_name, avatar_url)
    VALUES (
      NEW.id, NEW.email,
      left(coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), 100),
      left(NEW.raw_user_meta_data->>'avatar_url', 2048)
    );
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.create_auth_user_profile() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.create_auth_user_profile() TO supabase_auth_admin;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.create_auth_user_profile();

-- Repair only missing email-account profiles. Never overwrite an existing role,
-- subscription, name, or other owner-edited field during sign-in/backfill.
INSERT INTO public.profiles(id, email, full_name, avatar_url)
SELECT id, email,
  left(coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name'), 100),
  left(raw_user_meta_data->>'avatar_url', 2048)
FROM auth.users WHERE email IS NOT NULL
ON CONFLICT (id) DO NOTHING;
