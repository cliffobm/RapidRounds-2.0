-- supabase_migration_rapidrounds_qbank.sql
-- Purpose: Create internal question bank schema with hidden difficulty,
-- scenario mapping, adaptive engine telemetry, secure views, RLS, and RPCs.

-- ==== 0) Safety ====
create schema if not exists rr;
create schema if not exists rr_secure;  -- private/internal
create extension if not exists "uuid-ossp";

-- ==== 1) Types ====
do $$ begin
  if not exists (select 1 from pg_type where typname = 'question_mode') then
    create type rr.question_mode as enum ('scenario','adaptive','both');
  end if;
end $$;

-- Difficulty is INTERNAL ONLY (1–5). We keep it as smallint with a check.
-- We will never expose this column via public views.
-- 1 = easiest ... 5 = hardest
-- NOTE: adjust mapping logic in RPC to match your pedagogy.
-- (Kept as column, not a type, for easy numeric ops.)
-- (No enum to enable numeric comparisons.)

-- ==== 2) Core Tables (private) ====
create table if not exists rr_secure.questions (
  id uuid primary key default uuid_generate_v4(),
  stem text not null,
  system text not null,           -- e.g., cardiovascular, respiratory
  category text not null,         -- e.g., chest_pain, copd
  mode rr.question_mode not null default 'both',
  difficulty_internal smallint not null check (difficulty_internal between 1 and 5),
  rationale text,                 -- full rationale (shown only in scenario mode or paid tiers)
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists rr_secure.question_options (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid not null references rr_secure.questions(id) on delete cascade,
  idx smallint not null check (idx between 1 and 10),
  text text not null,
  is_correct boolean not null default false
);

-- Scenarios and their explicit question lineups (8–10 per scenario)
create table if not exists rr.scenarios (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,           -- e.g., 'cvd_001'
  title text not null,
  description text,
  system text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists rr.scenario_questions (
  scenario_id uuid not null references rr.scenarios(id) on delete cascade,
  question_id uuid not null references rr_secure.questions(id) on delete restrict,
  position smallint not null check (position between 1 and 20),
  primary key (scenario_id, question_id)
);

-- Telemetry for adaptive selection logic
create table if not exists rr.user_question_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,  -- references auth.users(id) in Supabase; no FK to avoid cross-schema
  question_id uuid not null references rr_secure.questions(id) on delete set null,
  was_correct boolean not null,
  answered_at timestamptz not null default now(),
  system text not null,     -- cache system for stats
  difficulty_snapshot smallint not null check (difficulty_snapshot between 1 and 5)
);

-- ==== 3) Security (RLS) ====
-- Deny direct table access by default (we will expose a view for safe columns)
alter table rr_secure.questions enable row level security;
alter table rr_secure.question_options enable row level security;
alter table rr.scenarios enable row level security;
alter table rr.scenario_questions enable row level security;
alter table rr.user_question_events enable row level security;

-- Policies
-- Scenarios + mapping: read for all authenticated users (and anon if you allow public browse)
create policy "scenarios_read_auth" on rr.scenarios
  for select using (true);

create policy "scenario_questions_read_auth" on rr.scenario_questions
  for select using (true);

-- Private tables: block direct reads; only allow insert on telemetry from authenticated users
create policy "questions_no_select" on rr_secure.questions
  for select using (false);
create policy "options_no_select" on rr_secure.question_options
  for select using (false);

create policy "uqe_insert_auth" on rr.user_question_events
  for insert with check (auth.role() = 'authenticated');
create policy "uqe_select_self" on rr.user_question_events
  for select using (auth.role() = 'authenticated' and user_id = auth.uid());

-- ==== 4) Public Views (difficulty hidden) ====
create or replace view rr.questions_public as
select
  q.id,
  q.stem,
  q.system,
  q.category,
  q.mode,
  q.is_active,
  q.created_at,
  q.updated_at
from rr_secure.questions q
where q.is_active = true;

create or replace view rr.question_options_public as
select
  o.id,
  o.question_id,
  o.idx,
  o.text
from rr_secure.question_options o
join rr_secure.questions q on q.id = o.question_id
where q.is_active = true;

-- Grant selects on views to anon/auth
grant usage on schema rr to anon, authenticated;
grant select on rr.questions_public to anon, authenticated;
grant select on rr.question_options_public to anon, authenticated;
grant select on rr.scenarios to anon, authenticated;
grant select on rr.scenario_questions to anon, authenticated;

-- ==== 5) RPC: Scenario fetch (ordered 8–10) ====
-- Returns ordered questions + options for a scenario (without difficulty)
create or replace function rr.get_scenario_questions(scenario_code text)
returns table (
  question_id uuid,
  stem text,
  system text,
  category text,
  mode rr.question_mode,
  option_id uuid,
  option_idx smallint,
  option_text text
)
language sql
stable
as $$
  select
    q.id as question_id,
    q.stem,
    q.system,
    q.category,
    q.mode,
    o.id as option_id,
    o.idx as option_idx,
    o.text as option_text
  from rr.scenarios s
  join rr.scenario_questions sq on sq.scenario_id = s.id
  join rr.questions_public q on q.id = sq.question_id
  join rr.question_options_public o on o.question_id = q.id
  where s.code = scenario_code
  order by sq.position, o.idx;
$$;

-- ==== 6) RPC: Get rationale for a question (for scenario mode only) ====
-- This separates rationale access (so you can gate by tier in the app).
create or replace function rr.get_question_rationale(question_uuid uuid)
returns text
language sql
stable
security definer
as $$
  select rationale from rr_secure.questions where id = question_uuid;
$$;

-- Ensure only authenticated users can call (and you can gate further by subscription in app logic)
revoke all on function rr.get_question_rationale(uuid) from public;
grant execute on function rr.get_question_rationale(uuid) to authenticated;

-- ==== 7) RPC: Adaptive next question ====
-- Very simple staircase logic:
--   - Start at difficulty 3 by default
--   - If last 3 answers in system were all correct, +1 (max 5)
--   - If last 2 were wrong, -1 (min 1)
--   - Otherwise, stay
-- You can replace with IRT later.
create or replace function rr.adaptive_next_question(
  p_user_id uuid,
  p_system text,
  p_exclude_ids uuid[] default '{}'
)
returns table (
  question_id uuid,
  stem text,
  system text,
  category text,
  mode rr.question_mode
)
language plpgsql
security definer
as $$
declare
  cur_diff smallint := 3;
  last3_correct int := 0;
  last2_wrong int := 0;
begin
  -- seed starting difficulty from per-user preference if available
  select ud.difficulty
  into cur_diff
  from rr.user_difficulty ud
  where ud.user_id = p_user_id and ud.system = p_system;

  if cur_diff is null then
    cur_diff := 3;
  end if;

  -- compute recent performance
  select sum(case when was_correct then 1 else 0 end)
  into last3_correct
  from (
    select was_correct
    from rr.user_question_events
    where user_id = p_user_id and system = p_system
    order by answered_at desc
    limit 3
  ) t;

  select sum(case when was_correct then 1 else 0 end)
  into last2_wrong
  from (
    select was_correct
    from rr.user_question_events
    where user_id = p_user_id and system = p_system
    order by answered_at desc
    limit 2
  ) t2 where t2.was_correct = false;

  if last3_correct = 3 then
    cur_diff := least(5, cur_diff + 1);
  elsif coalesce(last2_wrong,0) >= 2 then
    cur_diff := greatest(1, cur_diff - 1);
  end if;

  return query
  select q.id, q.stem, q.system, q.category, q.mode
  from rr_secure.questions q
  where q.is_active = true
    and q.mode in ('adaptive','both')
    and q.system = p_system
    and q.difficulty_internal = cur_diff
    and not (q.id = any(p_exclude_ids))
  order by q.created_at desc
  limit 1;
end;
$$;

revoke all on function rr.adaptive_next_question(uuid, text, uuid[]) from public;
grant execute on function rr.adaptive_next_question(uuid, text, uuid[]) to authenticated;

-- ==== 8) Convenience: insert helpers (optional) ====
-- For ease of bulk import, we allow inserts on private tables only to service role.
revoke all on table rr_secure.questions from public;
revoke all on table rr_secure.question_options from public;
grant insert, update, delete on table rr_secure.questions to service_role;
grant insert, update, delete on table rr_secure.question_options to service_role;
grant insert on table rr.user_question_events to authenticated;

-- ==== 8b) Per-user difficulty preferences ====
-- Store a user's preferred/starting difficulty per system (1–5). Optional, used to seed adaptive.
create table if not exists rr.user_difficulty (
  user_id uuid not null,
  system text not null,
  difficulty smallint not null check (difficulty between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_id, system)
);

alter table rr.user_difficulty enable row level security;

create policy "user_diff_upsert_self" on rr.user_difficulty
  for insert with check (auth.role() = 'authenticated' and user_id = auth.uid());
create policy "user_diff_update_self" on rr.user_difficulty
  for update using (auth.role() = 'authenticated' and user_id = auth.uid());
create policy "user_diff_select_self" on rr.user_difficulty
  for select using (auth.role() = 'authenticated' and user_id = auth.uid());

create or replace function rr.set_user_difficulty(p_system text, p_difficulty smallint)
returns void
language plpgsql
security definer
as $$
begin
  insert into rr.user_difficulty (user_id, system, difficulty)
  values (auth.uid(), p_system, p_difficulty)
  on conflict (user_id, system)
  do update set difficulty = excluded.difficulty, updated_at = now();
end;
$$;

create or replace function rr.get_user_difficulty(p_system text)
returns smallint
language sql
stable
security definer
as $$
  select difficulty from rr.user_difficulty
  where user_id = auth.uid() and system = p_system;
$$;

revoke all on function rr.set_user_difficulty(text, smallint) from public;
revoke all on function rr.get_user_difficulty(text) from public;
grant execute on function rr.set_user_difficulty(text, smallint) to authenticated;
grant execute on function rr.get_user_difficulty(text) to authenticated;

-- ==== 9) Triggers ====
create or replace function rr_secure.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_questions_touch on rr_secure.questions;
create trigger trg_questions_touch
before update on rr_secure.questions
for each row execute function rr_secure.touch_updated_at();

-- ==== 10) Done ====


