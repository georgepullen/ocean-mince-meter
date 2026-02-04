"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export type ForecastRunStampProps = {
  source: string;
  runTime: string;
  validFrom: string;
  validTo: string;
  className?: string;
};

export function ForecastRunStamp({
  source,
  runTime,
  validFrom,
  validTo,
  className,
}: ForecastRunStampProps) {
  return (
    <div className={cn("space-y-2 text-sm", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Forecast
        </div>
        <div className="rounded-full border border-border/70 bg-surface-2/50 px-2 py-1 text-xs text-muted">
          {source}
        </div>
      </div>
      <div className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1 text-xs">
        <div className="text-muted">Run time</div>
        <div className="font-mono text-foreground">{runTime}</div>
        <div className="text-muted">Valid</div>
        <div className="font-mono text-foreground">
          {validFrom} → {validTo}
        </div>
      </div>
    </div>
  );
}

