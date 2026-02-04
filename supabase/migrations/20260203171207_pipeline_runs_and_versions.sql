alter table public.forecast_runs
  add column if not exists model_version text,
  add column if not exists pipeline_git_sha text,
  add column if not exists data_vintage timestamptz;

alter table public.ais_intensity
  add column if not exists pipeline_git_sha text,
  add column if not exists data_vintage timestamptz;

create table if not exists public.pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  pipeline_name text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  status text not null,
  records_written int,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists pipeline_runs_name_started_idx
  on public.pipeline_runs (pipeline_name, started_at desc);
