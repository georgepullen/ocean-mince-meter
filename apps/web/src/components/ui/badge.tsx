"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant = "safe" | "caution" | "danger" | "unknown";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  safe: "border-accent/40 bg-accent/10 text-accent",
  caution: "border-warning/45 bg-warning/10 text-warning",
  danger: "border-danger/45 bg-danger/10 text-danger",
  unknown: "border-border/60 bg-surface-2/50 text-muted",
};

export function Badge({ className, variant = "unknown", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium tracking-tight",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

