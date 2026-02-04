"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/cn";

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    />
  );
});

Slider.displayName = "Slider";

export function SliderTrack({
  className,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Track>) {
  return (
    <SliderPrimitive.Track
      className={cn(
        "relative h-2 w-full grow overflow-hidden rounded-full bg-border/70",
        className
      )}
      {...props}
    />
  );
}

export function SliderRange({
  className,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Range>) {
  return (
    <SliderPrimitive.Range
      className={cn("absolute h-full bg-primary", className)}
      {...props}
    />
  );
}

export function SliderThumb({
  className,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Thumb>) {
  return (
    <SliderPrimitive.Thumb
      className={cn(
        "block h-5 w-5 rounded-full border border-border bg-surface shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
