-- Phase 6 - Calendar events persisted per authenticated user.
-- Run this in Supabase SQL Editor after migrations 001-006.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id text default 'default',
  title text not null,
  description text,
  type text not null default 'internal',
  status text not null default 'scheduled',
  priority text default 'medium',
  importance text default 'medium',
  color text default 'default',
  location text,
  meeting_url text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean default false,
  attendees jsonb default '[]'::jsonb,
  tags text[] default '{}',
  related_lead_id uuid references public.leads(id) on delete set null,
  related_task_id uuid references public.tasks(id) on delete set null,
  related_note_id uuid references public.notes(id) on delete set null,
  related_feedback_id uuid,
  related_project_id text,
  source text default 'manual',
  is_reminder boolean default false,
  reminder_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists calendar_events_user_id_idx on public.calendar_events(user_id);
create index if not exists calendar_events_workspace_id_idx on public.calendar_events(workspace_id);
create index if not exists calendar_events_start_at_idx on public.calendar_events(start_at);
create index if not exists calendar_events_end_at_idx on public.calendar_events(end_at);
create index if not exists calendar_events_status_idx on public.calendar_events(status);
create index if not exists calendar_events_type_idx on public.calendar_events(type);
create index if not exists calendar_events_related_lead_id_idx on public.calendar_events(related_lead_id);
create index if not exists calendar_events_related_task_id_idx on public.calendar_events(related_task_id);
create index if not exists calendar_events_created_at_idx on public.calendar_events(created_at);

drop trigger if exists set_calendar_events_updated_at on public.calendar_events;
create trigger set_calendar_events_updated_at
before update on public.calendar_events
for each row
execute function public.set_updated_at();

alter table public.calendar_events enable row level security;

drop policy if exists "calendar_events_select_own" on public.calendar_events;
create policy "calendar_events_select_own"
on public.calendar_events
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "calendar_events_insert_own" on public.calendar_events;
create policy "calendar_events_insert_own"
on public.calendar_events
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "calendar_events_update_own" on public.calendar_events;
create policy "calendar_events_update_own"
on public.calendar_events
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "calendar_events_delete_own" on public.calendar_events;
create policy "calendar_events_delete_own"
on public.calendar_events
for delete
to authenticated
using (auth.uid() = user_id);
