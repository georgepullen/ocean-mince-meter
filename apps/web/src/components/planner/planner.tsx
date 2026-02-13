"use client";

import * as React from "react";
import { MapView } from "@/components/map/map-view";

export function Planner() {
  const [timeIso, setTimeIso] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const res = await fetch(
          new URL("/api/ais-latest", window.location.origin).toString()
        );
        const json = (await res.json()) as
          | { ok: true; latest: string | null }
          | { ok: false };

        if (!res.ok || !json.ok) throw new Error("bad_response");
        if (!cancelled) setTimeIso(json.latest ?? new Date().toISOString());
      } catch {
        if (!cancelled) setTimeIso(new Date().toISOString());
      }
    };

    void refresh();
    const id = window.setInterval(() => {
      void refresh();
    }, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <main className="h-dvh w-full p-2 sm:p-3">
      <MapView timeIso={timeIso} className="h-full w-full" />
    </main>
  );
}
