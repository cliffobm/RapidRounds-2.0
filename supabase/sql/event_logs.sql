-- Minimal metrics sink
create table if not exists public.event_logs (
  id uuid primary key default gen_random_uuid(),
  ts timestamptz not null default now(),
  user_id uuid,
  event text not null,
  detail jsonb
);

-- RLS: only allow inserts via service role (API route), deny public direct writes by default
alter table public.event_logs enable row level security;
drop policy if exists "allow_insert_public" on public.event_logs;
