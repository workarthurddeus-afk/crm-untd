-- Phase 5 - Tasks persisted per authenticated user.
-- Run this in Supabase SQL Editor after migrations 001-005.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id text default 'default',
  title text not null,
  description text,
  status text not null default 'pending',
  importance text,
  category text,
  source text,
  color text,
  tags text[] default '{}',
  due_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  archived_at timestamptz,
  related_lead_id uuid references public.leads(id) on delete set null,
  related_note_id uuid references public.notes(id) on delete set null,
  related_calendar_event_id text,
  related_feedback_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_workspace_id_idx on public.tasks(workspace_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_due_at_idx on public.tasks(due_at);
create index if not exists tasks_related_lead_id_idx on public.tasks(related_lead_id);
create index if not exists tasks_related_note_id_idx on public.tasks(related_note_id);
create index if not exists tasks_created_at_idx on public.tasks(created_at);

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
on public.tasks
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
on public.tasks
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
on public.tasks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
on public.tasks
for delete
to authenticated
using (auth.uid() = user_id);
