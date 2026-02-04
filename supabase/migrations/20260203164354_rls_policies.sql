alter table public.swim_sessions enable row level security;

create policy "read_own_swims"
on public.swim_sessions
for select
to authenticated
using (auth.uid() = user_id);

create policy "insert_own_swims"
on public.swim_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

alter table public.ais_intensity enable row level security;
create policy "public_read_ais"
on public.ais_intensity
for select
to anon, authenticated
using (true);

alter table public.ocean_fields enable row level security;
create policy "public_read_ocean_fields"
on public.ocean_fields
for select
to anon, authenticated
using (true);
