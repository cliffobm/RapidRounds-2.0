"""Audit original SQL in disposable CI Postgres; never connect to a hosted database."""
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
require(sql('rapidrounds_schema_audit', bootstrap), 'schema audit auth fixture')
for path in sorted((root / 'supabase/migrations').glob('*.sql')):
    if not require(sql('rapidrounds_schema_audit', 'BEGIN;\n' + path.read_text() + '\nCOMMIT;'), 'apply ' + path.name):
        break

rls_bootstrap = bootstrap.replace('CREATE ROLE authenticated NOLOGIN;', '').replace('CREATE ROLE anon NOLOGIN;', '')
if require(sql('rapidrounds_rls_audit', rls_bootstrap + '\n' + (root / 'supabase/migrations/001_initial_schema.sql').read_text()), 'RLS audit initial schema'):
    fixture = """
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002');
INSERT INTO public.profiles(id,email,role) VALUES
('00000000-0000-0000-0000-000000000001','learner1@example.test','student'),
('00000000-0000-0000-0000-000000000002','learner2@example.test','student');
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
SET ROLE authenticated;
SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
SET request.jwt.claim.role = 'authenticated';
SELECT id FROM public.profiles;
"""
    result = sql('rapidrounds_rls_audit', fixture)
    if require(result, 'learner profile read under RLS'):
        require(sql('rapidrounds_rls_audit', """SET ROLE authenticated;
SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
DO $$ BEGIN IF (SELECT count(*) FROM public.profiles) <> 1 THEN RAISE EXCEPTION 'Learner profile isolation failed'; END IF; END $$;"""), 'learner cannot read another learner profile')

output = root / 'database-audit.json'
output.write_text(json.dumps({'scope': 'Original SQL replay and real PostgreSQL RLS with synthetic auth claims; not full Supabase API/Auth integration', 'checks': report}, indent=2) + '\n')
for item in report:
    print(('PASS ' if item['passed'] else 'FAIL ') + item['check'])
    if not item['passed']:
        print(item['error'])
raise SystemExit(0 if all(item['passed'] for item in report) else 1)
