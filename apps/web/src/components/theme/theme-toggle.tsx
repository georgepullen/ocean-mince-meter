"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Laptop, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/icon-button";

type Theme = "night" | "day" | "system";

function getStoredTheme(): Theme | null {
  const v = localStorage.getItem("theme");
  return v === "night" || v === "day" || v === "system" ? v : null;
}

function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
}

const THEME_ICON: Record<
  Theme,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  night: Moon,
  day: Sun,
  system: Laptop,
};

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setThemeState] = React.useState<Theme>("night");

  React.useEffect(() => {
    const rootTheme = document.documentElement.dataset.theme;
    if (rootTheme === "night" || rootTheme === "day" || rootTheme === "system") {
      setThemeState(rootTheme);
      return;
    }
    const stored = getStoredTheme();
    if (stored) setThemeState(stored);
  }, []);

  const CurrentIcon = THEME_ICON[theme];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <IconButton
          variant="ghost"
          shape="circle"
          aria-label="Theme"
          className={cn(className)}
        >
          <CurrentIcon className="h-4 w-4 opacity-80" strokeWidth={1.75} />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="z-50 w-52 rounded-[var(--radius)] border border-border bg-surface shadow-panel p-1 outline-none"
        >
          <DropdownMenu.Label className="px-2 py-2 text-xs font-medium text-muted">
            Appearance
          </DropdownMenu.Label>
          <DropdownMenu.Separator className="my-1 h-px bg-border/70" />
          <DropdownMenu.RadioGroup
            value={theme}
            onValueChange={(v) => {
              const next = v as Theme;
              setTheme(next);
              setThemeState(next);
            }}
          >
            <ThemeItem value="night" label="Night chart" icon={Moon} />
            <ThemeItem value="day" label="Day surface" icon={Sun} />
            <ThemeItem value="system" label="System" icon={Laptop} />
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function ThemeItem({
  value,
  label,
  icon: Icon,
}: {
  value: Theme;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <DropdownMenu.RadioItem
      value={value}
      className="relative flex cursor-default select-none items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground outline-none data-[highlighted]:bg-surface-2/70 data-[state=checked]:bg-surface-2/50"
    >
      <Icon className="h-4 w-4 opacity-80" strokeWidth={1.75} />
      <span className="flex-1">{label}</span>
      <DropdownMenu.ItemIndicator className="text-xs text-muted">
        ✓
      </DropdownMenu.ItemIndicator>
    </DropdownMenu.RadioItem>
  );
}
