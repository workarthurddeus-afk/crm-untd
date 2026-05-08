-- UNTD OS / CRM - Auth + RLS core
-- Run manually in Supabase SQL Editor after 001 and 002.
-- This removes anonymous table access and scopes operational data to auth.uid().

alter table public.leads add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.lead_interactions add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.leads alter column user_id set default auth.uid();
alter table public.lead_interactions alter column user_id set default auth.uid();

create index if not exists leads_user_id_idx on public.leads (user_id);
create index if not exists lead_interactions_user_id_idx on public.lead_interactions (user_id);

revoke all on table public.pipeline_stages from anon;
revoke all on table public.pipeline_stages from public;
revoke all on table public.leads from anon;
revoke all on table public.leads from public;
revoke all on table public.lead_interactions from anon;
revoke all on table public.lead_interactions from public;

grant select on table public.pipeline_stages to authenticated;
grant select, insert, update, delete on table public.leads to authenticated;
grant select, insert, update, delete on table public.lead_interactions to authenticated;

alter table public.pipeline_stages enable row level security;
alter table public.leads enable row level security;
alter table public.lead_interactions enable row level security;

drop policy if exists pipeline_stages_authenticated_select on public.pipeline_stages;
create policy pipeline_stages_authenticated_select
on public.pipeline_stages
for select
to authenticated
using (true);

drop policy if exists leads_authenticated_select_own on public.leads;
create policy leads_authenticated_select_own
on public.leads
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists leads_authenticated_insert_own on public.leads;
create policy leads_authenticated_insert_own
on public.leads
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists leads_authenticated_update_own on public.leads;
create policy leads_authenticated_update_own
on public.leads
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists leads_authenticated_delete_own on public.leads;
create policy leads_authenticated_delete_own
on public.leads
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists lead_interactions_authenticated_select_own on public.lead_interactions;
create policy lead_interactions_authenticated_select_own
on public.lead_interactions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists lead_interactions_authenticated_insert_own on public.lead_interactions;
create policy lead_interactions_authenticated_insert_own
on public.lead_interactions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists lead_interactions_authenticated_update_own on public.lead_interactions;
create policy lead_interactions_authenticated_update_own
on public.lead_interactions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists lead_interactions_authenticated_delete_own on public.lead_interactions;
create policy lead_interactions_authenticated_delete_own
on public.lead_interactions
for delete
to authenticated
using (auth.uid() = user_id);

-- Existing rows with user_id null will be hidden after RLS.
-- After creating Arthur's Supabase Auth user, run this manually if you need
-- to attach existing test/real rows to that account:
--
-- update public.leads
-- set user_id = '<AUTH_USER_UUID>'
-- where user_id is null;
--
-- update public.lead_interactions
-- set user_id = '<AUTH_USER_UUID>'
-- where user_id is null;
