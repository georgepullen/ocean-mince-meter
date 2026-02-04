export default function PipelineAdminPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Pipeline Admin</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Track dataset freshness, last run status, and ingest metrics.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              Last Run
            </p>
            <p className="mt-2 text-2xl font-semibold">--</p>
            <p className="mt-1 text-xs text-zinc-500">No runs yet.</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              Data Freshness
            </p>
            <p className="mt-2 text-2xl font-semibold">--</p>
            <p className="mt-1 text-xs text-zinc-500">Awaiting pipeline.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
