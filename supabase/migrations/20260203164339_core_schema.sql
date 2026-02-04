-- Grid cells: store H3 id + geometry + optional metadata
create table if not exists public.grid_cells (
  cell_id text primary key,
  geom geometry(Polygon, 4326) not null,
  resolution int not null,
  created_at timestamptz not null default now()
);

-- Forecast runs: versioned model runs
create table if not exists public.forecast_runs (
  run_id uuid primary key default gen_random_uuid(),
  source text not null,
  run_time timestamptz not null,
  valid_from timestamptz not null,
  valid_to timestamptz not null,
  created_at timestamptz not null default now()
);

-- Ocean fields: per cell, per timestamp vectors + uncertainty
create table if not exists public.ocean_fields (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.forecast_runs(run_id) on delete cascade,
  cell_id text not null references public.grid_cells(cell_id) on delete cascade,
  t timestamptz not null,
  u real not null,
  v real not null,
  sigma_u real,
  sigma_v real,
  created_at timestamptz not null default now(),
  unique (run_id, cell_id, t)
);

create index if not exists ocean_fields_t_idx on public.ocean_fields(t);
create index if not exists ocean_fields_cell_t_idx on public.ocean_fields(cell_id, t);

-- AIS intensity: ship traffic rate by cell/time bucket
create table if not exists public.ais_intensity (
  id uuid primary key default gen_random_uuid(),
  cell_id text not null references public.grid_cells(cell_id) on delete cascade,
  hour timestamptz not null,
  lambda real not null,
  mean_speed real,
  mean_heading real,
  created_at timestamptz not null default now(),
  unique (cell_id, hour)
);

create index if not exists ais_intensity_hour_idx on public.ais_intensity(hour);
create index if not exists ais_intensity_cell_hour_idx on public.ais_intensity(cell_id, hour);

-- Swim sessions: private user tracks
create table if not exists public.swim_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  track geometry(LineString, 4326) not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists swim_sessions_user_idx on public.swim_sessions(user_id);
create index if not exists swim_sessions_gix on public.swim_sessions using gist(track);
