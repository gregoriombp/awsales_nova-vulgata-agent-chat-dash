"use client"

import * as React from "react"
import { Icon, SparkleStar } from "./icons"

type ButtonVariant =
  | "primary"
  | "primary-on-dark"
  | "secondary"
  | "ghost"
type ButtonSize = "sm" | "md" | "lg"

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconRight,
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: string
  iconRight?: string
}) {
  const cls = [
    "as2-btn",
    `as2-btn--${variant}`,
    size !== "md" ? `as2-btn--${size}` : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ")
  return (
    <button className={cls} {...rest}>
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={16} /> : null}
    </button>
  )
}

export function Chip({
  icon,
  children,
}: {
  icon?: string
  children: React.ReactNode
}) {
  return (
    <span className="as2-chip">
      {icon ? <Icon name={icon} size={12} /> : null}
      {children}
    </span>
  )
}

export type AgentStatus =
  | "ativo"
  | "rascunho"
  | "revisao"
  | "pausado"
  | "publicado"

const STATUS_LABELS: Record<AgentStatus, string> = {
  ativo: "Ativo",
  rascunho: "Rascunho",
  revisao: "Em revisão",
  pausado: "Pausado",
  publicado: "Publicado",
}

const STATUS_COLORS: Record<AgentStatus, string> = {
  ativo: "#34C759",
  rascunho: "var(--aw-gray-500)",
  revisao: "var(--accent-alert, #E6762F)",
  pausado: "var(--aw-red-600)",
  publicado: "var(--aw-blue-600)",
}

export function StatusPill({ status }: { status: AgentStatus }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        color: "var(--aw-gray-800)",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: STATUS_COLORS[status],
          flexShrink: 0,
        }}
      />
      {STATUS_LABELS[status]}
    </span>
  )
}

export function GradientMesh({
  style,
  scale = 1,
}: {
  style?: React.CSSProperties
  scale?: number
}) {
  return (
    <div className="as2-mesh" style={style}>
      <div className="as2-mesh-blob b1" style={{ transform: `scale(${scale})` }} />
      <div className="as2-mesh-blob b2" style={{ transform: `scale(${scale})` }} />
      <div className="as2-mesh-blob b3" style={{ transform: `scale(${scale})` }} />
      <div className="as2-mesh-blob b4" style={{ transform: `scale(${scale})` }} />
    </div>
  )
}

export function NeuralPattern({ size = 340 }: { size?: number }) {
  const rings = [
    { r: 56, count: 24, dot: 3.5 },
    { r: 86, count: 36, dot: 3.2 },
    { r: 120, count: 52, dot: 2.8 },
    { r: 160, count: 68, dot: 2.4 },
  ]
  const center = size / 2
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id="as2-np-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,1)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
        </radialGradient>
      </defs>
      <circle cx={center} cy={center} r={26} fill="url(#as2-np-core)" />
      <circle cx={center} cy={center} r={14} fill="#FFFFFF" />
      {rings.map((ring, ri) => {
        const dots: React.ReactNode[] = []
        for (let i = 0; i < ring.count; i++) {
          const a = (i / ring.count) * Math.PI * 2
          const x = center + Math.cos(a) * ring.r
          const y = center + Math.sin(a) * ring.r
          const r = i % 3 === 0 ? ring.dot * 1.15 : ring.dot
          dots.push(
            <circle
              key={`${ri}-${i}`}
              cx={x}
              cy={y}
              r={r}
              fill="#FFFFFF"
              opacity={0.42 + (3 - ri) * 0.14}
            />
          )
        }
        return <g key={ri}>{dots}</g>
      })}
    </svg>
  )
}

export function SparkleGroup() {
  return (
    <div style={{ position: "relative", width: 60, height: 60 }}>
      <SparkleStar
        size={28}
        style={{
          position: "absolute",
          left: 16,
          top: 6,
          animation: "as2StarPulse 2.2s ease-in-out infinite",
        }}
      />
      <SparkleStar
        size={14}
        style={{
          position: "absolute",
          left: 0,
          top: 26,
          animation: "as2StarPulse 2.2s ease-in-out 0.4s infinite",
        }}
      />
      <SparkleStar
        size={12}
        style={{
          position: "absolute",
          left: 40,
          top: 36,
          animation: "as2StarPulse 2.2s ease-in-out 0.8s infinite",
        }}
      />
    </div>
  )
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      style={{
        fontFamily: "var(--font-mono, ui-monospace, monospace)",
        fontSize: 11,
        padding: "2px 5px",
        borderRadius: 4,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "var(--aw-gray-400)",
        lineHeight: 1,
      }}
    >
      {children}
    </kbd>
  )
}

export type AvatarTone =
  | "blue"
  | "emerald"
  | "amber"
  | "purple"
  | "slate"
  | "rose"

const AVATAR_TONES: Record<AvatarTone, [string, string]> = {
  blue: ["#1A5EC8", "#478AFF"],
  emerald: ["#17825A", "#5BDF9E"],
  amber: ["#B05315", "#F2A95B"],
  purple: ["#5A1782", "#C499EB"],
  slate: ["#465267", "#9FA9BA"],
  rose: ["#A82A5C", "#F490B5"],
}

export function Avatar({
  name,
  size = 28,
  tone = "blue",
}: {
  name?: string
  size?: number
  tone?: AvatarTone
}) {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  const [a, b] = AVATAR_TONES[tone]
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${a}, ${b})`,
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: size * 0.42,
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  )
}

export function StepHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string
  title: string
  desc?: string
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.08,
          textTransform: "uppercase",
          color: "var(--aw-gray-700)",
        }}
      >
        {eyebrow}
      </span>
      <h1
        style={{
          fontSize: 34,
          fontWeight: 500,
          letterSpacing: "-0.015em",
          margin: 0,
          lineHeight: 1.1,
          color: "var(--aw-gray-1200)",
        }}
      >
        {title}
      </h1>
      {desc ? (
        <p
          style={{
            fontSize: 14,
            color: "var(--aw-gray-700)",
            margin: 0,
            lineHeight: 1.55,
            maxWidth: 640,
          }}
        >
          {desc}
        </p>
      ) : null}
    </div>
  )
}

export function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--aw-gray-1200)",
        }}
      >
        {label}
      </label>
      {hint ? (
        <span
          style={{
            fontSize: 12,
            color: "var(--aw-gray-700)",
            lineHeight: 1.4,
          }}
        >
          {hint}
        </span>
      ) : null}
      <div style={{ marginTop: 4 }}>{children}</div>
    </div>
  )
}
