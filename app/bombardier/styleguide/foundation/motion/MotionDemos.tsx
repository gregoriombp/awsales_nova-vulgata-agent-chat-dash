"use client"

import * as React from "react"

export function DurationProbe() {
  const [open, setOpen] = React.useState(false)
  const cases = [
    { name: "--dur-fast", value: "120ms" },
    { name: "--dur-base", value: "180ms" },
    { name: "--dur-slow", value: "280ms" },
  ]
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="aw-btn aw-btn--secondary aw-btn--sm self-start"
      >
        {open ? "reset" : "animar"}
      </button>
      <div className="flex flex-col gap-4">
        {cases.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-4 p-4 rounded-md border border-(--border-subtle) bg-(--bg-raised)"
          >
            <div className="min-w-[140px]">
              <div className="mono text-sm text-(--fg-primary)">
                {c.name}
              </div>
              <div className="text-xs text-(--fg-tertiary)">
                {c.value}
              </div>
            </div>
            <div className="flex-1 relative h-6 rounded-full bg-(--bg-muted) overflow-hidden">
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: open ? "100%" : "0%",
                  background: "var(--aw-blue-500)",
                  transition: `width ${c.value} var(--ease-out)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EasingProbe() {
  const [open, setOpen] = React.useState(false)
  const cases = [
    { name: "--ease-out", value: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
    { name: "--ease-in-out", value: "cubic-bezier(0.4, 0, 0.2, 1)" },
    { name: "linear (evitar)", value: "linear" },
  ]
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="aw-btn aw-btn--secondary aw-btn--sm self-start"
      >
        {open ? "reset" : "animar"}
      </button>
      <div className="flex flex-col gap-4">
        {cases.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-4 p-4 rounded-md border border-(--border-subtle) bg-(--bg-raised)"
          >
            <div className="min-w-[150px]">
              <div className="mono text-sm text-(--fg-primary)">
                {c.name}
              </div>
              <div className="mono text-[10px] text-(--fg-tertiary)">
                {c.value}
              </div>
            </div>
            <div className="flex-1 relative h-12 rounded-full bg-(--bg-muted)">
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: open ? "calc(100% - 40px)" : "0px",
                  marginTop: -16,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--fg-primary)",
                  transition: `left 700ms ${c.value.startsWith("cubic") ? c.value : c.value}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ThinkingPulse() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-md border border-(--border-subtle) bg-(--bg-raised) max-w-[320px]">
      <span
        className="aw-pill aw-pill--ai"
      >
        <span className="aw-pill__dot" /> Pensando
      </span>
      <span className="text-sm text-(--fg-secondary)">
        — 2.2 s loop
      </span>
    </div>
  )
}

export function ShimmerDemo() {
  return (
    <div className="flex flex-col gap-3 max-w-[420px]">
      {[80, 60, 90].map((w, i) => (
        <div
          key={i}
          style={{
            height: 14,
            width: `${w}%`,
            borderRadius: 6,
            background:
              "linear-gradient(90deg, var(--bg-muted) 0%, var(--bg-surface) 50%, var(--bg-muted) 100%)",
            backgroundSize: "200% 100%",
            animation: "aw-shimmer 1.4s ease-in-out infinite",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes aw-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
