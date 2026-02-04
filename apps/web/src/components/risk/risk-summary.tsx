"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

export type RiskSummaryProps = {
  state: BadgeVariant;
  headline: string;
  value?: string;
  detail?: string;
  className?: string;
};

export function RiskSummary({
  state,
  headline,
  value,
  detail,
  className,
}: RiskSummaryProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Risk
        </div>
        <Badge variant={state}>
          {state === "unknown" ? "Abstain" : state}
        </Badge>
      </div>
      <div className="space-y-1">
        <div className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {headline}
        </div>
        {value ? (
          <div className="text-sm text-muted">
            <span className="font-mono tabular-nums text-foreground">
              {value}
            </span>{" "}
            <span className="text-muted">ship-risk proxy</span>
          </div>
        ) : null}
        {detail ? <div className="text-sm text-muted">{detail}</div> : null}
      </div>
    </div>
  );
}

