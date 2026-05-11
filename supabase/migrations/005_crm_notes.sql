-- UNTD OS / CRM - Notes + Note Folders
-- Run manually in Supabase SQL Editor after 004.
-- Stores strategic notes and folders scoped to the authenticated user.

create table if not exists public.note_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id text not null default 'default',
  name text not null,
  description text,
  color text not null default 'default',
  icon text,
  parent_id uuid references public.note_folders(id) on delete set null,
  order_index integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id text not null default 'default',
  folder_id uuid references public.note_folders(id) on delete set null,
  related_lead_id uuid references public.leads(id) on delete set null,
  related_task_id uuid,
  related_feedback_id uuid,
  related_project_id uuid,
  title text not null,
  content text not null default '',
  excerpt text,
  type text not null default 'general',
  status text not null default 'active',
  priority text not null default 'medium',
  impact text not null default 'medium',
  effort text not null default 'medium',
  tags text[] not null default '{}',
  color text not null default 'default',
  source text not null default 'manual',
  is_pinned boolean not null default false,
  is_favorite boolean not null default false,
  is_archived boolean not null default false,
  is_deleted boolean not null default false,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists note_folders_user_id_idx on public.note_folders (user_id);
create index if not exists note_folders_workspace_id_idx on public.note_folders (workspace_id);
create index if not exists note_folders_order_index_idx on public.note_folders (order_index);

create index if not exists notes_user_id_idx on public.notes (user_id);
create index if not exists notes_workspace_id_idx on public.notes (workspace_id);
create index if not exists notes_folder_id_idx on public.notes (folder_id);
create index if not exists notes_related_lead_id_idx on public.notes (related_lead_id);
create index if not exists notes_related_task_id_idx on public.notes (related_task_id);
create index if not exists notes_updated_at_idx on public.notes (updated_at);
create index if not exists notes_tags_idx on public.notes using gin (tags);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists note_folders_set_updated_at on public.note_folders;
create trigger note_folders_set_updated_at
before update on public.note_folders
for each row
execute function public.set_updated_at();

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
before update on public.notes
for each row
execute function public.set_updated_at();

revoke all on table public.note_folders from anon;
revoke all on table public.note_folders from public;
revoke all on table public.notes from anon;
revoke all on table public.notes from public;

grant select, insert, update, delete on table public.note_folders to authenticated;
grant select, insert, update, delete on table public.notes to authenticated;

alter table public.note_folders enable row level security;
alter table public.notes enable row level security;

drop policy if exists note_folders_authenticated_select_own on public.note_folders;
create policy note_folders_authenticated_select_own
on public.note_folders
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists note_folders_authenticated_insert_own on public.note_folders;
create policy note_folders_authenticated_insert_own
on public.note_folders
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists note_folders_authenticated_update_own on public.note_folders;
create policy note_folders_authenticated_update_own
on public.note_folders
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists note_folders_authenticated_delete_own on public.note_folders;
create policy note_folders_authenticated_delete_own
on public.note_folders
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists notes_authenticated_select_own on public.notes;
create policy notes_authenticated_select_own
on public.notes
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists notes_authenticated_insert_own on public.notes;
create policy notes_authenticated_insert_own
on public.notes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists notes_authenticated_update_own on public.notes;
create policy notes_authenticated_update_own
on public.notes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists notes_authenticated_delete_own on public.notes;
create policy notes_authenticated_delete_own
on public.notes
for delete
to authenticated
using (auth.uid() = user_id);
