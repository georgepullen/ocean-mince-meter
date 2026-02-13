create table if not exists public.ais_raw_points (
  id bigserial primary key,
  mmsi bigint not null,
  t timestamptz not null,
  geom geometry(Point, 4326) not null,
  sog real,
  cog real,
  source_message_type text,
  run_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists ais_raw_points_t_idx
  on public.ais_raw_points (t);

create index if not exists ais_raw_points_geom_gix
  on public.ais_raw_points using gist (geom);

create index if not exists ais_raw_points_mmsi_t_idx
  on public.ais_raw_points (mmsi, t desc);

alter table public.ais_raw_points enable row level security;

drop policy if exists ais_raw_points_public_read on public.ais_raw_points;
create policy ais_raw_points_public_read
on public.ais_raw_points
for select
to anon, authenticated
using (true);

create or replace function public.get_risk_tile(
  layer text,
  t_target timestamptz,
  west double precision,
  south double precision,
  east double precision,
  north double precision,
  horizon_minutes_in int default 60,
  bin_minutes_in int default 60,
  run_id_in uuid default null,
  raw_window_minutes_in int default 10
)
returns jsonb
language plpgsql
stable
as $$
declare
  features jsonb;
begin
  if layer <> 'ais_raw' then
    raise exception 'Only layer=ais_raw is supported';
  end if;

  if raw_window_minutes_in <= 0 then
    raise exception 'raw_window_minutes_in must be > 0';
  end if;

  with envelope as (
    select st_makeenvelope(west, south, east, north, 4326) as geom
  ),
  filtered as (
    select
      rp.mmsi,
      rp.t,
      rp.sog,
      rp.cog,
      rp.source_message_type,
      rp.geom
    from public.ais_raw_points rp
    join envelope e on st_intersects(rp.geom, e.geom)
    where rp.t > (t_target - make_interval(mins => raw_window_minutes_in))
      and rp.t <= t_target
      and (run_id_in is null or rp.run_id = run_id_in)
  ),
  latest_per_mmsi as (
    select distinct on (f.mmsi)
      f.mmsi,
      f.t,
      f.sog,
      f.cog,
      f.source_message_type,
      f.geom
    from filtered f
    order by f.mmsi, f.t desc
  ),
  limited as (
    select *
    from latest_per_mmsi
    order by t desc
    limit 5000
  )
  select jsonb_agg(
    jsonb_build_object(
      'type', 'Feature',
      'geometry', st_asgeojson(limited.geom)::jsonb,
      'properties', jsonb_build_object(
        'mmsi', limited.mmsi,
        'sog', limited.sog,
        'cog', limited.cog,
        'source_message_type', limited.source_message_type,
        't', limited.t
      )
    )
  )
  into features
  from limited;

  return jsonb_build_object(
    'type', 'FeatureCollection',
    'features', coalesce(features, '[]'::jsonb)
  );
end;
$$;
