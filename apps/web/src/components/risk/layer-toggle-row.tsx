"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Switch } from "@/components/ui/switch";
import { Slider, SliderRange, SliderThumb, SliderTrack } from "@/components/ui/slider";

export type LayerToggleRowProps = {
  label: string;
  description?: string;
  color?: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  className?: string;
};

export function LayerToggleRow({
  label,
  description,
  color = "var(--data-current-low)",
  enabled,
  onEnabledChange,
  opacity,
  onOpacityChange,
  className,
}: LayerToggleRowProps) {
  const value = Math.round(Math.min(1, Math.max(0, opacity)) * 100);

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Switch
        checked={enabled}
        onCheckedChange={onEnabledChange}
        aria-label={`${label} layer`}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">
              {label}
            </div>
            {description ? (
              <div className="truncate text-xs text-muted">{description}</div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm border border-border/70"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <div className="w-11 text-right text-xs tabular-nums text-muted">
              {value}%
            </div>
          </div>
        </div>
        <div className="mt-2">
          <Slider
            value={[value]}
            max={100}
            step={1}
            onValueChange={(v) => onOpacityChange((v[0] ?? 0) / 100)}
            disabled={!enabled}
          >
            <SliderTrack>
              <SliderRange />
            </SliderTrack>
            <SliderThumb aria-label={`${label} opacity`} />
          </Slider>
        </div>
      </div>
    </div>
  );
}

