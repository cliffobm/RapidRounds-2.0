"""Audit development SQL in disposable CI Postgres; never connect to a hosted database."""
import json
import os
from pathlib import Path
import subprocess

if os.environ.get('RAPIDROUNDS_DISPOSABLE_DB') != 'true':
    raise SystemExit('Requires RAPIDROUNDS_DISPOSABLE_DB=true and the disposable localhost:55432 CI service')

root = Path(__file__).resolve().parent.parent
report = []

def sql(database, text):
    return subprocess.run(['psql', '-X', '-h', '127.0.0.1', '-p', '55432', '-U', 'postgres',
                           '-d', database, '-v', 'ON_ERROR_STOP=1'], input=text, text=True,
                          capture_output=True, check=False)

def require(result, label):
    if result.returncode:
        report.append({'check': label, 'passed': False, 'error': result.stderr.strip()})
        return False
    report.append({'check': label, 'passed': True})
    return True

# Use uniquely named databases on the ephemeral runner-owned service.
require(sql('postgres', 'CREATE DATABASE rapidrounds_schema_audit; CREATE DATABASE rapidrounds_rls_audit;'), 'create disposable databases')
bootstrap = (root / 'tests/database/auth-bootstrap.sql').read_text()
# Roles are cluster-scoped: create once, then reuse in the second database.
schema_bootstrap = (root / 'tests/database/auth-signup-bootstrap.sql').read_text()
require(sql('rapidrounds_schema_audit', schema_bootstrap), 'schema audit auth fixture')
for path in sorted((root / 'supabase/migrations').glob('*.sql')):
    if not require(sql('rapidrounds_schema_audit', 'BEGIN;\n' + path.read_text() + '\nCOMMIT;'), 'apply ' + path.name):
        break

rls_bootstrap = bootstrap.replace('CREATE ROLE authenticated NOLOGIN;', '').replace('CREATE ROLE anon NOLOGIN;', '')
if require(sql('rapidrounds_rls_audit', rls_bootstrap + '\n' + (root / 'supabase/migrations/001_initial_schema.sql').read_text()), 'RLS audit initial schema'):
    require(sql('rapidrounds_rls_audit', (root / 'tests/database/profile-isolation.sql').read_text()), 'initial schema learner/educator isolation, edits and escalation denial')

# Check the final schema independently, only after every migration succeeded.
if all(item['passed'] for item in report):
    require(sql('rapidrounds_schema_audit', (root / 'tests/database/auth-signup.sql').read_text()), 'Auth-role provisioning, metadata ignored and repeat-login preservation')
    require(sql('rapidrounds_schema_audit', (root / 'tests/database/profile-isolation.sql').read_text()), 'complete schema learner/educator isolation, edits and escalation denial')
    billing_check = """SET ROLE authenticated;
SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
DO $$ BEGIN
  BEGIN
    UPDATE profiles SET subscription_tier = 'premium' WHERE id = auth.uid();
    RAISE EXCEPTION 'Self premium escalation allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    UPDATE profiles SET trial_active = true WHERE id = auth.uid();
    RAISE EXCEPTION 'Self trial escalation allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;"""
    require(sql('rapidrounds_schema_audit', billing_check), 'billing and trial fields remain administrative')

output = root / 'database-audit.json'
output.write_text(json.dumps({'scope': 'Development migration replay and real PostgreSQL RLS with synthetic auth claims; not full Supabase API/Auth integration', 'checks': report}, indent=2) + '\n')
for item in report:
    print(('PASS ' if item['passed'] else 'FAIL ') + item['check'])
    if not item['passed']:
        print(item['error'])
raise SystemExit(0 if all(item['passed'] for item in report) else 1)
