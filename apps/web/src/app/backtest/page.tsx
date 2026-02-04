export default function BacktestPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Backtest</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Overlay predicted drift corridors with recorded swim tracks.
        </p>
        <div className="mt-6 min-h-[420px] rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-sm text-zinc-400">Backtest map placeholder.</p>
        </div>
      </div>
    </div>
  );
}
