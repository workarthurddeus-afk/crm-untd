-- UNTD OS / CRM - Lead interactions timeline
-- Run manually in Supabase SQL Editor after 001_crm_leads_pipeline.sql.
-- Auth/RLS is intentionally not enabled yet because the app still uses a
-- temporary single-user owner/workspace model. Before storing sensitive data,
-- replace this with Supabase Auth and workspace/owner scoped RLS policies.

create extension if not exists pgcrypto;

create table if not exists public.lead_interactions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  workspace_id text default 'default',
  owner_id text default 'arthur',
  type text not null,
  title text,
  description text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lead_interactions alter column workspace_id set default 'default';
alter table public.lead_interactions alter column owner_id set default 'arthur';
alter table public.lead_interactions alter column occurred_at set default now();
alter table public.lead_interactions alter column created_at set default now();
alter table public.lead_interactions alter column updated_at set default now();

create index if not exists lead_interactions_lead_id_idx on public.lead_interactions (lead_id);
create index if not exists lead_interactions_occurred_at_idx on public.lead_interactions (occurred_at desc);
create index if not exists lead_interactions_workspace_id_idx on public.lead_interactions (workspace_id);
create index if not exists lead_interactions_owner_id_idx on public.lead_interactions (owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_lead_interactions_updated_at on public.lead_interactions;
create trigger set_lead_interactions_updated_at
before update on public.lead_interactions
for each row execute function public.set_updated_at();

-- Future RLS shape after Auth:
-- alter table public.lead_interactions enable row level security;
-- create policy "lead_interactions_workspace_access"
-- on public.lead_interactions
-- for all
-- using (workspace_id = current_setting('request.jwt.claims', true)::jsonb->>'workspace_id')
-- with check (workspace_id = current_setting('request.jwt.claims', true)::jsonb->>'workspace_id');
