-- Phase 7 - Feedbacks persisted per authenticated user.
-- Run this in Supabase SQL Editor after migrations 001-007.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id text default 'default',
  title text not null,
  content text,
  type text,
  source text,
  status text,
  impact text,
  frequency text,
  sentiment text,
  priority text,
  tags text[] default '{}',
  related_lead_id uuid references public.leads(id) on delete set null,
  related_note_id uuid references public.notes(id) on delete set null,
  related_task_id uuid references public.tasks(id) on delete set null,
  related_calendar_event_id uuid references public.calendar_events(id) on delete set null,
  related_project_id text,
  is_archived boolean default false,
  is_pinned boolean default false,
  captured_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists feedbacks_user_id_idx on public.feedbacks(user_id);
create index if not exists feedbacks_workspace_id_idx on public.feedbacks(workspace_id);
create index if not exists feedbacks_status_idx on public.feedbacks(status);
create index if not exists feedbacks_type_idx on public.feedbacks(type);
create index if not exists feedbacks_impact_idx on public.feedbacks(impact);
create index if not exists feedbacks_priority_idx on public.feedbacks(priority);
create index if not exists feedbacks_related_lead_id_idx on public.feedbacks(related_lead_id);
create index if not exists feedbacks_related_note_id_idx on public.feedbacks(related_note_id);
create index if not exists feedbacks_related_task_id_idx on public.feedbacks(related_task_id);
create index if not exists feedbacks_created_at_idx on public.feedbacks(created_at);

drop trigger if exists set_feedbacks_updated_at on public.feedbacks;
create trigger set_feedbacks_updated_at
before update on public.feedbacks
for each row
execute function public.set_updated_at();

alter table public.feedbacks enable row level security;

drop policy if exists "feedbacks_select_own" on public.feedbacks;
create policy "feedbacks_select_own"
on public.feedbacks
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "feedbacks_insert_own" on public.feedbacks;
create policy "feedbacks_insert_own"
on public.feedbacks
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "feedbacks_update_own" on public.feedbacks;
create policy "feedbacks_update_own"
on public.feedbacks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "feedbacks_delete_own" on public.feedbacks;
create policy "feedbacks_delete_own"
on public.feedbacks
for delete
to authenticated
using (auth.uid() = user_id);
