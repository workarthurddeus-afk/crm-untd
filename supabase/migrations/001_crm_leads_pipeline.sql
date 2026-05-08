-- UNTD OS / CRM - Canonical Leads + Pipeline schema
-- Run manually in Supabase SQL Editor.
-- This migration is intentionally idempotent and preserves columns from the
-- manually-created test table such as company_name, commercial_email, fit_score.

create extension if not exists pgcrypto;

create table if not exists public.pipeline_stages (
  id text primary key,
  name text not null,
  description text,
  order_index integer not null,
  color text,
  is_default boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.pipeline_stages (id, name, description, order_index, color, is_default)
values
  ('prospecting', 'Prospeccao', 'Lead ainda em pesquisa ou mapeamento.', 0, '#a78bfa', true),
  ('contacted', 'Primeiro contato', 'Lead abordado e aguardando resposta.', 1, '#60a5fa', true),
  ('replied', 'Respondeu', 'Lead respondeu e abriu conversa.', 2, '#34d399', true),
  ('meeting', 'Reuniao marcada', 'Conversa, diagnostico ou call marcada.', 3, '#60a5fa', true),
  ('proposal', 'Proposta enviada', 'Proposta comercial enviada.', 4, '#fb923c', true),
  ('won', 'Cliente ganho', 'Lead convertido em cliente.', 5, '#10b981', true),
  ('lost', 'Perdido / Sem fit', 'Lead encerrado sem conversao.', 6, '#4b5563', true)
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  order_index = excluded.order_index,
  color = excluded.color,
  is_default = excluded.is_default,
  updated_at = now();

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.leads add column if not exists workspace_id text default 'default';
alter table public.leads add column if not exists owner_id text default 'arthur';
alter table public.leads add column if not exists name text;
alter table public.leads add column if not exists company text;
alter table public.leads add column if not exists role text;
alter table public.leads add column if not exists niche text;
alter table public.leads add column if not exists website text;
alter table public.leads add column if not exists instagram text;
alter table public.leads add column if not exists linkedin text;
alter table public.leads add column if not exists email text;
alter table public.leads add column if not exists phone text;
alter table public.leads add column if not exists city text;
alter table public.leads add column if not exists state text;
alter table public.leads add column if not exists country text default 'BR';
alter table public.leads add column if not exists origin text default 'manual';
alter table public.leads add column if not exists pipeline_stage_id text default 'prospecting';
alter table public.leads add column if not exists temperature text default 'cold';
alter table public.leads add column if not exists icp_score integer default 0;
alter table public.leads add column if not exists pain text;
alter table public.leads add column if not exists revenue_potential numeric;
alter table public.leads add column if not exists objections text[] default '{}';
alter table public.leads add column if not exists first_contact_at timestamptz;
alter table public.leads add column if not exists last_contact_at timestamptz;
alter table public.leads add column if not exists next_follow_up_at timestamptz;
alter table public.leads add column if not exists tag_ids text[] default '{}';
alter table public.leads add column if not exists internal_notes text;
alter table public.leads add column if not exists result text default 'open';
alter table public.leads add column if not exists status text;
alter table public.leads add column if not exists visual_quality_score integer;
alter table public.leads add column if not exists visual_problems text;
alter table public.leads add column if not exists why_good_lead text;
alter table public.leads add column if not exists suggested_approach text;
alter table public.leads add column if not exists updated_at timestamptz default now();

-- Legacy/test columns kept so the previous manual table and /teste-supabase
-- continue to work during the migration window.
alter table public.leads add column if not exists company_name text;
alter table public.leads add column if not exists commercial_email text;
alter table public.leads add column if not exists commercial_phone text;
alter table public.leads add column if not exists whatsapp text;
alter table public.leads add column if not exists owner_name text;
alter table public.leads add column if not exists owner_role text;
alter table public.leads add column if not exists owner_instagram text;
alter table public.leads add column if not exists owner_linkedin text;
alter table public.leads add column if not exists fit_score integer;

-- Preserve/backfill data from the previous manual Supabase test schema.
update public.leads
set
  company = coalesce(company, company_name),
  name = coalesce(name, owner_name, company_name, company),
  role = coalesce(role, owner_role),
  email = coalesce(email, commercial_email),
  phone = coalesce(phone, commercial_phone, whatsapp),
  linkedin = coalesce(linkedin, owner_linkedin),
  icp_score = least(100, greatest(0, coalesce(icp_score, fit_score, 0))),
  pain = coalesce(pain, visual_problems),
  workspace_id = coalesce(workspace_id, 'default'),
  owner_id = coalesce(owner_id, 'arthur'),
  origin = coalesce(origin, 'manual'),
  pipeline_stage_id = coalesce(pipeline_stage_id, 'prospecting'),
  temperature = coalesce(temperature, 'cold'),
  result = coalesce(result, 'open'),
  country = coalesce(country, 'BR'),
  objections = coalesce(objections, '{}'),
  tag_ids = coalesce(tag_ids, '{}'),
  updated_at = coalesce(updated_at, created_at, now())
where true;

update public.leads
set company = 'Lead sem empresa'
where company is null;

alter table public.leads alter column company set not null;
alter table public.leads alter column workspace_id set default 'default';
alter table public.leads alter column owner_id set default 'arthur';
alter table public.leads alter column country set default 'BR';
alter table public.leads alter column origin set default 'manual';
alter table public.leads alter column pipeline_stage_id set default 'prospecting';
alter table public.leads alter column temperature set default 'cold';
alter table public.leads alter column icp_score set default 0;
alter table public.leads alter column objections set default '{}';
alter table public.leads alter column tag_ids set default '{}';
alter table public.leads alter column result set default 'open';
alter table public.leads alter column updated_at set default now();

alter table public.leads drop constraint if exists leads_pipeline_stage_id_fkey;
alter table public.leads
  add constraint leads_pipeline_stage_id_fkey
  foreign key (pipeline_stage_id)
  references public.pipeline_stages(id);

alter table public.leads drop constraint if exists leads_icp_score_range;
alter table public.leads
  add constraint leads_icp_score_range
  check (icp_score >= 0 and icp_score <= 100);

create index if not exists leads_pipeline_stage_id_idx on public.leads (pipeline_stage_id);
create index if not exists leads_owner_id_idx on public.leads (owner_id);
create index if not exists leads_workspace_id_idx on public.leads (workspace_id);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_next_follow_up_at_idx on public.leads (next_follow_up_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_pipeline_stages_updated_at on public.pipeline_stages;
create trigger set_pipeline_stages_updated_at
before update on public.pipeline_stages
for each row execute function public.set_updated_at();

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- Auth/RLS note for the next phase:
-- Enable RLS only after the app has an authenticated user/workspace strategy.
-- Recommended future policy shape:
--   workspace_id = current_setting('request.jwt.claims', true)::jsonb->>'workspace_id'
-- or owner_id = auth.uid()::text once Arthur is represented by Supabase Auth.
