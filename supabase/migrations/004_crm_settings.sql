-- UNTD OS / CRM - User workspace settings
-- Run manually in Supabase SQL Editor after 003.
-- Stores Settings as JSONB scoped to the authenticated user.

create table if not exists public.workspace_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id text not null default 'default',
  settings jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_settings_user_workspace_unique unique (user_id, workspace_id)
);

create index if not exists workspace_settings_user_id_idx on public.workspace_settings (user_id);
create index if not exists workspace_settings_workspace_id_idx on public.workspace_settings (workspace_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workspace_settings_set_updated_at on public.workspace_settings;
create trigger workspace_settings_set_updated_at
before update on public.workspace_settings
for each row
execute function public.set_updated_at();

revoke all on table public.workspace_settings from anon;
revoke all on table public.workspace_settings from public;
grant select, insert, update, delete on table public.workspace_settings to authenticated;

alter table public.workspace_settings enable row level security;

drop policy if exists workspace_settings_authenticated_select_own on public.workspace_settings;
create policy workspace_settings_authenticated_select_own
on public.workspace_settings
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists workspace_settings_authenticated_insert_own on public.workspace_settings;
create policy workspace_settings_authenticated_insert_own
on public.workspace_settings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists workspace_settings_authenticated_update_own on public.workspace_settings;
create policy workspace_settings_authenticated_update_own
on public.workspace_settings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists workspace_settings_authenticated_delete_own on public.workspace_settings;
create policy workspace_settings_authenticated_delete_own
on public.workspace_settings
for delete
to authenticated
using (auth.uid() = user_id);
