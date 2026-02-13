# Ocean Mince Meter

Minimal monorepo for a single experience: a map with live ship dots.

## Layout

- `apps/web`: Next.js app (map UI + API routes)
- `packages/db`: shared Supabase config helpers (`@ocean/db`)
- `services/pipeline`: AIS capture + raw-point ingest scripts
- `supabase`: Supabase config + migrations

## Local dev

Start Supabase:

```bash
supabase start
supabase db reset
```

Run the app:

```bash
pnpm dev
```

Core endpoints:

- `GET /api/ais-latest`
- `GET /api/tiles?z&x&y&time&rawWindowMinutes`
