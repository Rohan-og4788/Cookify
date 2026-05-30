"use client";

import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light" as const, icon: Sun, label: "Light mode" },
    { value: "dark" as const, icon: Moon, label: "Dark mode" },
    { value: "system" as const, icon: Monitor, label: "System preference" },
  ];

  return (
    <div
      className={cn("flex rounded-lg border border-border bg-surface p-1", className)}
      role="group"
      aria-label="Theme selection"
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            "rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            theme === value
              ? "bg-primary text-primary-foreground"
              : "text-muted hover:text-foreground"
          )}
          aria-label={label}
          aria-pressed={theme === value}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
