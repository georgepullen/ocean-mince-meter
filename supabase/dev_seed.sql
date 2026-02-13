-- Minimal seed for local map smoke tests: live-like raw AIS points.

insert into public.ais_raw_points (mmsi, t, geom, sog, cog, source_message_type)
values
  (111000111, now() - interval '1 minute', st_setsrid(st_makepoint(-29.80, 25.40), 4326), 8.4, 210, 'PositionReport'),
  (222000222, now() - interval '2 minutes', st_setsrid(st_makepoint(-30.40, 24.90), 4326), 11.1, 175, 'PositionReport'),
  (333000333, now() - interval '3 minutes', st_setsrid(st_makepoint(-31.10, 25.20), 4326), 6.3, 95, 'StandardClassBPositionReport'),
  (444000444, now() - interval '2 minutes', st_setsrid(st_makepoint(-28.70, 24.80), 4326), 14.2, 35, 'PositionReport')
on conflict do nothing;
