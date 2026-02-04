# Setup Report

This report documents everything done to move from an empty repository to the current working monorepo state.

## Summary
- Monorepo scaffolded with Next.js (App Router), Supabase (local + migrations + seed), and a Python pipeline.
- Supabase local stack runs with PostGIS + core tables + RLS + pipeline tracking.
- API routes exist for risk evaluation and tiles (stub).
- Pipeline can write AIS intensity data into the database.

## Timeline of Work (Chronological)
1. Initialized the repo layout from an empty directory and added root config files.
2. Set up pnpm workspaces and root scripts.
3. Scaffolded `apps/web` with Next.js (App Router, TS, ESLint, Tailwind, `src/`, `@/*`).
4. Created shared package and installed `zod`.
5. Initialized Supabase CLI config and created migrations for PostGIS, core schema, and RLS.
6. Started Supabase locally and applied migrations.
7. Added Supabase client helpers for browser and server use.
8. Added `/api/risk` route and verified it against local data.
9. Built Python pipeline scaffold and ran a placeholder AIS intensity job.
10. Added seed data to make local DB usable without running the pipeline.
11. Added missing guide items: `packages/db`, CI workflow, tiles API route, UI placeholder pages, versioning columns, and `pipeline_runs`.
12. Reapplied migrations and seed data to include new schema changes.

## Current Repo Structure
```
/
  apps/
    web/
  packages/
    shared/
    db/
  services/
    pipeline/
  supabase/
  .github/
    workflows/
  package.json
  pnpm-workspace.yaml
  pnpm-lock.yaml
  README.md
  .env.example
  .gitignore
```

## Files Created / Updated

### Root
- `.env.example`
- `.gitignore`
- `README.md`
- `package.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`

### Next.js app
- `apps/web/` scaffold
- `apps/web/.env.local` (local Supabase keys)
- `apps/web/src/lib/supabase/client.ts`
- `apps/web/src/lib/supabase/server.ts`
- `apps/web/src/app/api/risk/route.ts`
- `apps/web/src/app/api/tiles/route.ts`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/backtest/page.tsx`
- `apps/web/src/app/admin/pipeline/page.tsx`

### Packages
- `packages/shared/package.json` (scoped name `@ocean/shared`)
- `packages/shared/tsconfig.json`
- `packages/shared/src/index.ts`
- `packages/shared/eslint.config.mjs`
- `packages/db/package.json`
- `packages/db/tsconfig.json`
- `packages/db/src/index.ts`
- `packages/db/README.md`

### Supabase
- `supabase/config.toml`
- `supabase/migrations/20260203164335_init_postgis.sql`
- `supabase/migrations/20260203164339_core_schema.sql`
- `supabase/migrations/20260203164354_rls_policies.sql`
- `supabase/migrations/20260203171207_pipeline_runs_and_versions.sql`
- `supabase/seed.sql`

### Pipeline
- `services/pipeline/requirements.txt` (pinned via `pip freeze`)
- `services/pipeline/.env`
- `services/pipeline/.env.example`
- `services/pipeline/src/db.py`
- `services/pipeline/src/jobs/build_ais_intensity.py`
- `services/pipeline/src/__init__.py`
- `services/pipeline/src/jobs/__init__.py`

### CI
- `.github/workflows/ci.yml`

## Supabase Schema Implemented
- Extensions: `postgis`, `pgcrypto`
- Tables: `grid_cells`, `forecast_runs`, `ocean_fields`, `ais_intensity`, `swim_sessions`, `pipeline_runs`
- Indexes:
  - `ocean_fields_t_idx`, `ocean_fields_cell_t_idx`
  - `ais_intensity_hour_idx`, `ais_intensity_cell_hour_idx`
  - `swim_sessions_user_idx`, `swim_sessions_gix`
  - `pipeline_runs_name_started_idx`
- RLS policies:
  - `swim_sessions`: read/insert own
  - `ais_intensity`: public read
  - `ocean_fields`: public read
- Versioning columns:
  - `forecast_runs`: `model_version`, `pipeline_git_sha`, `data_vintage`
  - `ais_intensity`: `pipeline_git_sha`, `data_vintage`

## Seed Data
- `grid_cells`: one entry (`fake_cell`)
- `forecast_runs`: one seeded run
- `ais_intensity`: two rows for `fake_cell`

## API Verification
- `POST /api/risk` returned `{ "ok": true, "shipRiskProxy": 0.25 }` against local data.

## Pipeline Notes
- Python venv created.
- DB URL uses `postgresql+psycopg://` to match psycopg v3 with SQLAlchemy.
- The placeholder job inserts a `grid_cells` row before `ais_intensity` to satisfy FK constraints.

## Deviations from the Original Guide
- Shared package name is `@ocean/shared` instead of `@shared` (npm scoping rules).
- Python version is 3.14.2 (still satisfies 3.11+).
- Pipeline DB URL uses `postgresql+psycopg://`.
- Requirements are pinned via `pip freeze` for reproducibility.

