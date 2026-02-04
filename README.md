# Ocean Risk Monorepo

Monorepo layout:

- `apps/web`: Next.js app (frontend + API routes)
- `packages/db`: database helpers and schema utilities (`@ocean/db`)
- `packages/shared`: shared TS types and zod schemas (`@ocean/shared`)
- `services/pipeline`: Python ingestion + model jobs
- `supabase`: Supabase CLI config + migrations

This repo is bootstrapped to follow the setup guide in the conversation. Next steps are to scaffold the Next.js app and install dependencies.
