"use client";

import { Moon, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="surface-strong hover-lift inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] transition hover:text-[var(--foreground)]"
        aria-label="Toggle theme"
        disabled
      >
        <span className="h-4 w-4" aria-hidden />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="surface-strong hover-lift inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] transition hover:text-[var(--foreground)]"
      aria-label="Toggle theme"
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
