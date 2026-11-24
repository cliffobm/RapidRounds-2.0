-- Isolated tester project only. Membership is managed by the project owner;
-- browser clients cannot grant themselves reporting or reviewer access.
create table public.rr_feedback_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  can_review boolean not null default false
);
alter table public.rr_feedback_members enable row level security;
revoke all on public.rr_feedback_members from anon, authenticated;
grant select on public.rr_feedback_members to authenticated;
create policy rr_feedback_own_membership on public.rr_feedback_members
  for select to authenticated using (user_id = (select auth.uid()));

create table public.rr_item_feedback (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null check (char_length(item_id) between 1 and 180),
  item_revision text not null check (char_length(item_revision) between 1 and 160),
  activity text not null check (activity in ('rapid-round','practice','evolving','rapid-response','guided','legacy','study')),
  prompt text not null check (char_length(prompt) between 1 and 5000),
  patient_context text not null default '' check (char_length(patient_context) <= 8000),
  selected jsonb not null default '[]' check (jsonb_typeof(selected)='array' and jsonb_array_length(selected)<=20),
  phase text not null check (phase in ('before','after')),
  kind text not null check (kind in ('flag','suggestion')),
  reason text not null check (reason in ('wording','answer','rationale','context','evidence','audience','other')),
  comment text not null default '' check (char_length(comment)<=4000),
  status text not null default 'received' check (status in ('received','reviewing','updated','explained')),
  reviewer_note text not null default '' check (char_length(reviewer_note)<=4000),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  review_history jsonb not null default '[]',
  constraint rr_feedback_suggestion_note check (kind='flag' or char_length(trim(comment))>=3)
);
create index rr_feedback_user_created on public.rr_item_feedback (user_id,created_at desc);
create index rr_feedback_status_created on public.rr_item_feedback (status,created_at desc);
alter table public.rr_item_feedback enable row level security;
revoke all on public.rr_item_feedback from anon, authenticated;
grant select on public.rr_item_feedback to authenticated;
grant insert (id,user_id,item_id,item_revision,activity,prompt,patient_context,selected,phase,kind,reason,comment) on public.rr_item_feedback to authenticated;
grant update (status,reviewer_note) on public.rr_item_feedback to authenticated;
create policy rr_feedback_member_insert on public.rr_item_feedback for insert to authenticated
  with check (user_id=(select auth.uid()) and status='received' and reviewer_note='' and reviewed_at is null
    and exists(select 1 from public.rr_feedback_members m where m.user_id=(select auth.uid()))
    and coalesce((select auth.jwt())->>'is_anonymous','false')='false');
create policy rr_feedback_private_read on public.rr_item_feedback for select to authenticated
  using (exists(select 1 from public.rr_feedback_members m where m.user_id=(select auth.uid())
    and (rr_item_feedback.user_id=(select auth.uid()) or m.can_review)));
create policy rr_feedback_reviewer_update on public.rr_item_feedback for update to authenticated
  using (exists(select 1 from public.rr_feedback_members m where m.user_id=(select auth.uid()) and m.can_review))
  with check (exists(select 1 from public.rr_feedback_members m where m.user_id=(select auth.uid()) and m.can_review));

create function public.rr_feedback_record_review() returns trigger language plpgsql
  security invoker set search_path='' as $$
begin
  new.reviewed_at := clock_timestamp();
  new.review_history := old.review_history || jsonb_build_array(jsonb_build_object(
    'reviewer_id',auth.uid(),'at',new.reviewed_at,'from',old.status,'to',new.status,'note',new.reviewer_note));
  return new;
end;
$$;
revoke all on function public.rr_feedback_record_review() from public,anon,authenticated;
create trigger rr_feedback_review_history before update on public.rr_item_feedback
  for each row execute function public.rr_feedback_record_review();

-- The six existing confirmed tester accounts are eligible to report. This does
-- not invite new accounts or assign reviewer rights to any learner.
insert into public.rr_feedback_members (user_id)
select id from auth.users where email_confirmed_at is not null
  and deleted_at is null and coalesce(is_anonymous,false)=false;
