import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "rhms-theme";
const MOTION_KEY = "rhms-reduce-motion";

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialThemeMode() {
  if (typeof window === "undefined") {
    return "system";
  }
  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
    return storedTheme;
  }
  return "system";
}

function getInitialReduceMotion() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(MOTION_KEY) === "true";
}

function applyTheme(mode) {
  const resolvedTheme = mode === "system" ? getSystemTheme() : mode;
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
  return resolvedTheme;
}

export function initializeTheme() {
  if (typeof document === "undefined") {
    return;
  }
  const mode = getInitialThemeMode();
  applyTheme(mode);
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(getInitialThemeMode);
  const [resolvedTheme, setResolvedTheme] = useState(() => applyTheme(getInitialThemeMode()));
  const [reduceMotion, setReduceMotion] = useState(getInitialReduceMotion);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function syncTheme() {
      const nextResolved = applyTheme(themeMode);
      setResolvedTheme(nextResolved);
      window.localStorage.setItem(STORAGE_KEY, themeMode);
    }

    syncTheme();
    media.addEventListener("change", syncTheme);
    return () => media.removeEventListener("change", syncTheme);
  }, [themeMode]);

  useEffect(() => {
    window.localStorage.setItem(MOTION_KEY, String(reduceMotion));
    document.documentElement.dataset.reduceMotion = reduceMotion ? "true" : "false";
  }, [reduceMotion]);

  const value = useMemo(
    () => ({
      theme: resolvedTheme,
      themeMode,
      setTheme: setThemeMode,
      setThemeMode,
      toggleTheme: () =>
        setThemeMode((current) => {
          if (current === "light") {
            return "dark";
          }
          if (current === "dark") {
            return "system";
          }
          return "light";
        }),
      reduceMotion,
      setReduceMotion,
    }),
    [reduceMotion, resolvedTheme, themeMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
