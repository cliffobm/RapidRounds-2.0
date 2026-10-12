-- Run as ordinary authenticated/anon roles, never as the table owner.
INSERT INTO auth.users VALUES
('00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000003');
INSERT INTO public.profiles(id,email,full_name,role) VALUES
('00000000-0000-0000-0000-000000000001','learner1@example.test','Learner One','student'),
('00000000-0000-0000-0000-000000000002','learner2@example.test','Learner Two','student'),
('00000000-0000-0000-0000-000000000003','educator@example.test','Educator','educator');
GRANT USAGE ON SCHEMA public TO authenticated, anon;
SET ROLE authenticated;
SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
SET request.jwt.claim.role = 'authenticated';
DO $$ DECLARE affected integer; BEGIN
  IF (SELECT count(*) FROM profiles) <> 1 THEN RAISE EXCEPTION 'Own profile isolation failed'; END IF;
  IF (SELECT count(*) FROM private.profile_roles) <> 1 THEN RAISE EXCEPTION 'Role registry isolation failed'; END IF;
  UPDATE profiles SET full_name = 'Updated Learner' WHERE id = auth.uid();
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'Own profile edit failed'; END IF;
  UPDATE profiles SET full_name = 'Intruder' WHERE id = '00000000-0000-0000-0000-000000000002';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Cross-user update allowed'; END IF;
  BEGIN
    UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
    RAISE EXCEPTION 'Self role escalation allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    UPDATE profiles SET id = '00000000-0000-0000-0000-000000000002' WHERE id = auth.uid();
    RAISE EXCEPTION 'Profile identity reassignment allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    UPDATE profiles SET institution_id = gen_random_uuid() WHERE id = auth.uid();
    RAISE EXCEPTION 'Tenant reassignment allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    UPDATE private.profile_roles SET role = 'admin' WHERE user_id = auth.uid();
    RAISE EXCEPTION 'Role registry mutation allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
-- Self-authored claims do not change database-owned administrative roles.
SET request.jwt.claims = '{"user_metadata":{"role":"admin"},"app_metadata":{}}';
DO $$ BEGIN
  IF (SELECT count(*) FROM profiles) <> 1 THEN RAISE EXCEPTION 'User metadata granted authority'; END IF;
END $$;
SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
DO $$ BEGIN
  IF (SELECT count(*) FROM profiles) <> 3 THEN RAISE EXCEPTION 'Existing educator access lost'; END IF;
  IF (SELECT full_name FROM profiles WHERE id = '00000000-0000-0000-0000-000000000002') <> 'Learner Two' THEN RAISE EXCEPTION 'Cross-user data mutated'; END IF;
END $$;
RESET ROLE;
-- Administrative role changes take effect immediately, without refreshing a JWT.
UPDATE profiles SET role = 'student' WHERE id = '00000000-0000-0000-0000-000000000003';
SET ROLE authenticated;
DO $$ BEGIN
  IF (SELECT count(*) FROM profiles) <> 1 THEN RAISE EXCEPTION 'Educator revocation did not take effect'; END IF;
END $$;
RESET ROLE;
SET ROLE anon;
RESET request.jwt.claim.sub;
DO $$ BEGIN
  BEGIN
    PERFORM id FROM profiles;
    RAISE EXCEPTION 'Anonymous profile access allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM user_id FROM private.profile_roles;
    RAISE EXCEPTION 'Anonymous role registry access allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
