# RapidRounds Question Bank — DB-First Setup

This folder includes:
- supabase_migration_rapidrounds_qbank.sql — creates schemas, tables, RLS, views, and RPCs.
- seed_scenario_questions.csv — sample data for Scenario Mode (8–10 items per scenario), includes rationales.
- seed_adaptive_questions.csv — starter pool for Adaptive Mode; internal difficulty is included in CSV but never exposed by public views.

## Why this design?
- Difficulty is internal only. We store it as difficulty_internal (1–5) in a private table rr_secure.questions. The app never sees this column directly.
- Public consumption happens via views (rr.questions_public, rr.question_options_public) and RPCs. This avoids accidental exposure of difficulty.
- Adaptive logic can live in the DB via rr.adaptive_next_question(...), so the client just asks for the next question without knowing difficulty internals.
- Scenario questions are ordered via rr.get_scenario_questions(scenario_code).

## Install
1. Open Supabase SQL Editor and run the SQL migration:
   - supabase_migration_rapidrounds_qbank.sql

2. Seed data (service role or SQL editor):
   - Insert questions into rr_secure.questions (private)
   - Insert options into rr_secure.question_options (private)
   - Insert scenarios into rr.scenarios
   - Map questions in rr.scenario_questions with position

> Because rr_secure.questions is private, use service role or the Supabase SQL editor to run bulk inserts.

## Importing the CSVs (example with psql)
```bash
# scenario seed (example schema for guidance; adjust to your loaders)
\copy rr_secure.questions(stem, system, category, mode, difficulty_internal, rationale) \
FROM 'seed_scenario_questions.csv' WITH CSV HEADER
```

Alternatively, use the Table Editor Import for each table and map the CSV columns accordingly.

## App Integration (Next.js)
- Scenario Mode (8–10 Qs)
```ts
const { data, error } = await supabase.rpc('get_scenario_questions', { scenario_code: 'cvd_001' })
```
- Adaptive Mode
```ts
const { data, error } = await supabase.rpc('adaptive_next_question', {
  p_user_id: user.id,
  p_system: 'cardiovascular',
  p_exclude_ids: []
})
```

### Per-user difficulty (store and read)
```ts
// set user's preferred/starting difficulty for a system
await supabase.rpc('set_user_difficulty', { p_system: 'cardiovascular', p_difficulty: 3 })

// get user's stored difficulty for a system
const { data: diff } = await supabase.rpc('get_user_difficulty', { p_system: 'cardiovascular' })
// diff is a smallint (1–5) or null if not set
```

## Security
- Direct selects on rr_secure.* are blocked via RLS policies.
- Views in rr.* expose only safe columns.
- RPC get_question_rationale is security definer and executable by authenticated role.

## Next Steps
- Build an import script to transform the CSV rows into the normalized tables (rr_secure.questions, rr_secure.question_options, rr.scenarios, rr.scenario_questions).
- Add richer telemetry and better adaptive logic (e.g., IRT) when ready.
