"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { type ButtonProps, Button } from "@/components/ui/button";

export type IconButtonProps = Omit<ButtonProps, "size"> & {
  size?: "sm" | "md" | "lg";
  shape?: "square" | "circle";
};

const sizes: Record<NonNullable<IconButtonProps["size"]>, string> = {
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-11 w-11",
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = "md", shape = "square", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "p-0",
          sizes[size],
          shape === "circle" ? "rounded-full" : "rounded-xl",
          className
        )}
        {...props}
      />
    );
  }
);

IconButton.displayName = "IconButton";
