"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "surface" | "surface2";
};

export function Panel({
  className,
  variant = "surface",
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-border shadow-panel",
        variant === "surface" ? "bg-surface" : "bg-surface-2",
        className
      )}
      {...props}
    />
  );
}

export function PanelHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-border/70 px-4 py-3",
        className
      )}
      {...props}
    />
  );
}

export function PanelTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("font-display text-base font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

export function PanelContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-4", className)} {...props} />;
}

