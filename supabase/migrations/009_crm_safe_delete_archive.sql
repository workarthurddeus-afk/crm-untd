-- Safe archive/delete support for user-created operational records.
-- Run this after migrations 001-008.

alter table public.leads
add column if not exists archived_at timestamptz;

create index if not exists leads_archived_at_idx on public.leads (archived_at);
