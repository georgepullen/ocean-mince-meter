"use client";

import * as React from "react";
import Link from "next/link";
import { Anchor, Waves } from "lucide-react";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

export type AppShellProps = {
  map: React.ReactNode;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  bottomOverlay?: React.ReactNode;
  mobileSheet?: React.ReactNode;
  className?: string;
};

export function AppShell({
  map,
  leftPanel,
  rightPanel,
  bottomOverlay,
  mobileSheet,
  className,
}: AppShellProps) {
  return (
    <div className={cn("min-h-dvh", className)}>
      <TopBar />
      <div className="mx-auto max-w-[1400px] px-4 py-4">
        <div className="grid gap-4 md:grid-cols-[360px_minmax(0,1fr)_320px]">
          <aside className="hidden md:block h-[calc(100dvh-7rem)] overflow-auto">
            {leftPanel}
          </aside>
          <main className="relative h-[calc(100dvh-7rem)] min-h-[520px]">
            {map}
            {bottomOverlay ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3">
                <div className="pointer-events-auto">{bottomOverlay}</div>
              </div>
            ) : null}
          </main>
          <aside className="hidden md:block h-[calc(100dvh-7rem)] overflow-auto">
            {rightPanel}
          </aside>
        </div>

        {mobileSheet ? (
          <div className="md:hidden">
            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4">
              <div className="pointer-events-auto w-full max-w-md">
                {mobileSheet}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/60 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface shadow-sm">
            <Waves className="h-4 w-4 opacity-80" strokeWidth={1.75} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-semibold tracking-tight">
              Swim Unminced
            </div>
            <div className="text-xs text-muted">Night Chart Expedition</div>
          </div>
        </Link>

        <nav className="ml-6 hidden items-center gap-2 text-sm text-muted md:flex">
          <NavItem href="/" active>
            Planner
          </NavItem>
          <NavItem href="#" disabled>
            Sessions
          </NavItem>
          <NavItem href="#" disabled>
            Data
          </NavItem>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" className="hidden md:inline-flex">
            <Anchor className="h-4 w-4 opacity-80" strokeWidth={1.75} />
            Sign in
          </Button>
        </div>
      </div>
    </header>
  );
}

function NavItem({
  href,
  active,
  disabled,
  children,
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-disabled={disabled}
      className={cn(
        "rounded-lg px-3 py-2 transition-colors",
        active ? "bg-surface-2/50 text-foreground" : "hover:bg-surface-2/40",
        disabled ? "pointer-events-none opacity-50" : null
      )}
    >
      {children}
    </a>
  );
}
