"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    /* ignore */
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

let themeSnapshot: Theme = "light";
let themeInitialized = false;
const themeListeners = new Set<() => void>();

function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

function getClientTheme(): Theme {
  if (!themeInitialized) {
    themeInitialized = true;
    themeSnapshot = readStoredTheme();
  }
  return themeSnapshot;
}

function getServerTheme(): Theme {
  return "light";
}

function setThemeSnapshot(theme: Theme) {
  themeSnapshot = theme;
  for (const listener of themeListeners) {
    listener();
  }
}

const subscribeNoop = () => () => {};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const resolvedTheme = useSyncExternalStore(subscribeTheme, getClientTheme, getServerTheme);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((theme: Theme) => {
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore */
    }
    applyTheme(theme);
    setThemeSnapshot(theme);
  }, []);

  const value = useMemo(
    () => ({
      resolvedTheme: mounted ? resolvedTheme : "light",
      setTheme,
    }),
    [mounted, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
