"use client"

import { useEffect, useState } from "react"

type Theme = "light" | "dark"

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    const stored = (typeof window !== "undefined"
      ? (window.localStorage.getItem("aw-theme") as Theme | null)
      : null)
    const initial: Theme =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    setTheme(initial)
    document.documentElement.classList.toggle("dark", initial === "dark")
  }, [])

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.classList.toggle("dark", next === "dark")
    window.localStorage.setItem("aw-theme", next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Ativar modo ${theme === "dark" ? "claro" : "escuro"}`}
      className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-[var(--border-default)] bg-[var(--bg-raised)] text-[var(--fg-primary)] text-sm font-medium hover:bg-[var(--bg-surface)] transition-colors duration-150"
    >
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{
          background:
            theme === "dark" ? "var(--aw-blue-400)" : "var(--aw-gray-1200)",
        }}
      />
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  )
}
