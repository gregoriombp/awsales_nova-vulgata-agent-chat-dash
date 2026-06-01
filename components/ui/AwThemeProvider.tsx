"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

/** Chave de persistência — mantida em sync com o script no-flash do layout. */
export const THEME_STORAGE_KEY = "aw-theme";
/** Evento interno pra avisar os assinantes quando a preferência muda. */
const THEME_EVENT = "aw-theme-change";

function prefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function readPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    /* localStorage indisponível */
  }
  return "light";
}

function resolve(theme: ThemePreference): ResolvedTheme {
  if (theme === "system") return prefersDark() ? "dark" : "light";
  return theme;
}

/** Reflete o tema resolvido no <html> (classe `.dark` + color-scheme nativo). */
function applyTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

// ── Store externo (localStorage + matchMedia) lido via useSyncExternalStore ──
// Hidratação-safe (getServerSnapshot = "light") e sem setState dentro de effect.
function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange); // sync entre abas
  mq.addEventListener("change", onChange); // acompanha o SO no modo "system"
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
    mq.removeEventListener("change", onChange);
  };
}

const getSnapshot = (): ThemePreference => readPreference();
const getServerSnapshot = (): ThemePreference => "light";

interface AwThemeContextValue {
  /** Preferência do usuário (o que ele escolheu). */
  theme: ThemePreference;
  /** Tema realmente aplicado agora (resolve "system"). */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

const AwThemeContext = createContext<AwThemeContextValue | null>(null);

export function AwThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const resolvedTheme = resolve(theme);

  // Mantém o <html> em sync com o tema resolvido (inclusive quando muda por
  // outra aba ou pela preferência do SO). É só escrita no DOM — sem setState.
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: ThemePreference) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    applyTheme(resolve(next));
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return (
    <AwThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </AwThemeContext.Provider>
  );
}

export function useAwTheme(): AwThemeContextValue {
  const ctx = useContext(AwThemeContext);
  if (!ctx) {
    throw new Error("useAwTheme precisa estar dentro de <AwThemeProvider>");
  }
  return ctx;
}
