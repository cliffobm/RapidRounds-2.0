-- Run in a disposable PostgreSQL fixture after the source migrations and the
-- signup migration. No emails or real users. Every mutation is rolled back.
BEGIN;
SELECT set_config('rapidrounds.test_user_id', gen_random_uuid()::text, true);
SELECT set_config('rapidrounds.second_user_id', gen_random_uuid()::text, true);
SET LOCAL ROLE supabase_auth_admin;
INSERT INTO auth.users(id, email, raw_user_meta_data) VALUES
  (current_setting('rapidrounds.test_user_id')::uuid, 'new@example.test', '{"full_name":"New Learner","role":"admin","subscription_tier":"premium","trial_active":true}'),
  (current_setting('rapidrounds.second_user_id')::uuid, 'other@example.test', '{}');
RESET ROLE;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p JOIN private.profile_roles r ON r.user_id=p.id
    WHERE p.id=current_setting('rapidrounds.test_user_id')::uuid
      AND p.email='new@example.test' AND p.full_name='New Learner'
      AND p.role='student' AND r.role='student'
      AND p.subscription_tier='free' AND p.trial_active=false
  ) THEN RAISE EXCEPTION 'Auth role failed to provision a student/free profile'; END IF;
  IF has_column_privilege('supabase_auth_admin','public.profiles','role','INSERT')
    OR has_table_privilege('supabase_auth_admin','private.profile_roles','UPDATE')
  THEN RAISE EXCEPTION 'Auth service has excessive role privileges'; END IF;
END $$;

SELECT set_config('request.jwt.claim.sub', current_setting('rapidrounds.test_user_id'), true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE affected integer; BEGIN
  IF (SELECT count(*) FROM public.profiles) <> 1 THEN RAISE EXCEPTION 'Profile read isolation failed'; END IF;
  IF (SELECT count(*) FROM private.profile_roles) <> 1 THEN RAISE EXCEPTION 'Registry read isolation failed'; END IF;
  UPDATE public.profiles SET full_name='Edited Learner' WHERE id=auth.uid();
  GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected<>1 THEN RAISE EXCEPTION 'Own profile edit failed'; END IF;
  UPDATE public.profiles SET full_name='Intruder' WHERE id=current_setting('rapidrounds.second_user_id')::uuid;
  GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected<>0 THEN RAISE EXCEPTION 'Cross-user profile edit allowed'; END IF;
  BEGIN
    UPDATE public.profiles SET role='admin' WHERE id=auth.uid();
    RAISE EXCEPTION 'Self role escalation allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO private.profile_roles(user_id,role) VALUES(auth.uid(),'admin');
    RAISE EXCEPTION 'Browser registry insert allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.profiles(id,email) VALUES(gen_random_uuid(),'forbidden@example.test');
    RAISE EXCEPTION 'Browser profile insert allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

-- A trusted administrator can assign a role; subsequent Auth updates must
-- preserve it and the user's saved display fields.
UPDATE public.profiles SET role='educator' WHERE id=current_setting('rapidrounds.test_user_id')::uuid;
SET LOCAL ROLE supabase_auth_admin;
UPDATE auth.users SET last_sign_in_at=now(), raw_user_meta_data='{"role":"admin","full_name":"Changed Provider Name"}'
WHERE id=current_setting('rapidrounds.test_user_id')::uuid;
RESET ROLE;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p JOIN private.profile_roles r ON r.user_id=p.id
    WHERE p.id=current_setting('rapidrounds.test_user_id')::uuid
      AND p.full_name='Edited Learner' AND p.role='educator' AND r.role='educator'
  ) THEN RAISE EXCEPTION 'Repeated login changed existing profile or role'; END IF;
END $$;
ROLLBACK;
SELECT 'PASS: Auth-role provisioning, metadata ignored, least privileges, account isolation, own edits, protected writes blocked, repeat-login preservation' AS result;
