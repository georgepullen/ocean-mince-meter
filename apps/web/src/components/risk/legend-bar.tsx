"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export type LegendBarProps = {
  title: string;
  units?: string;
  minLabel: string;
  maxLabel: string;
  gradient?: string;
  className?: string;
};

export function LegendBar({
  title,
  units,
  minLabel,
  maxLabel,
  gradient = "linear-gradient(90deg, var(--data-current-low), var(--data-current-high))",
  className,
}: LegendBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <div className="text-sm font-medium text-foreground">{title}</div>
        {units ? <div className="text-xs text-muted">{units}</div> : null}
      </div>
      <div className="space-y-1.5">
        <div
          className="h-2.5 w-full rounded-full border border-border/70"
          style={{ backgroundImage: gradient }}
        />
        <div className="flex justify-between text-xs text-muted">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    </div>
  );
}

