-- Minimal seed data for local dev
insert into public.grid_cells (cell_id, geom, resolution)
values (
  'fake_cell',
  st_geomfromtext('POLYGON((-4 50, -4 50.01, -3.99 50.01, -3.99 50, -4 50))', 4326),
  9
)
on conflict (cell_id) do nothing;

insert into public.forecast_runs (
  run_id,
  source,
  run_time,
  valid_from,
  valid_to,
  model_version,
  pipeline_git_sha,
  data_vintage
)
values (
  '00000000-0000-0000-0000-000000000001',
  'seed',
  now() - interval '6 hours',
  now() - interval '6 hours',
  now() + interval '6 hours',
  'v0',
  'seed',
  now()
)
on conflict (run_id) do nothing;

insert into public.ais_intensity (cell_id, hour, lambda, mean_speed, mean_heading, pipeline_git_sha, data_vintage)
values
  ('fake_cell', '2026-02-03T10:00:00Z', 0.25, 12.0, 90.0, 'seed', now()),
  ('fake_cell', '2026-02-03T11:00:00Z', 0.35, 11.5, 95.0, 'seed', now())
on conflict (cell_id, hour) do update
set lambda = excluded.lambda,
    mean_speed = excluded.mean_speed,
    mean_heading = excluded.mean_heading,
    pipeline_git_sha = excluded.pipeline_git_sha,
    data_vintage = excluded.data_vintage;
