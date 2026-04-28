import * as React from "react"

export type AwStatusDotVariant =
  | "live"
  | "attention"
  | "offline"
  | "info"
  | "neutral"

export type AwStatusDotSize = "xs" | "sm" | "md"

export type AwStatusDotProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: AwStatusDotVariant
  size?: AwStatusDotSize
  /** Adds a ring matching the surface color (use when overlaying on logos/avatars). */
  ring?: boolean
  /** Pulses the dot to draw attention. */
  pulse?: boolean
  /** Makes the rendered span absolute-positioned in the top-right of its parent. */
  absolute?: boolean
}

const SIZES: Record<AwStatusDotSize, number> = { xs: 6, sm: 8, md: 10 }

const COLORS: Record<AwStatusDotVariant, string> = {
  live: "var(--aw-emerald-500)",
  attention: "var(--aw-amber-500)",
  offline: "var(--aw-gray-500)",
  info: "var(--aw-blue-500)",
  neutral: "var(--fg-tertiary)",
}

export function AwStatusDot({
  variant = "live",
  size = "sm",
  ring,
  pulse,
  absolute,
  className,
  style,
  ...rest
}: AwStatusDotProps) {
  const px = SIZES[size]
  const ringPx = Math.max(2, Math.round(px * 0.25))
  return (
    <span
      aria-hidden="true"
      className={
        "aw-status-dot" +
        (pulse ? " aw-status-dot--pulse" : "") +
        (className ? " " + className : "")
      }
      style={{
        display: "inline-block",
        width: px,
        height: px,
        borderRadius: "50%",
        background: COLORS[variant],
        boxShadow: ring
          ? `0 0 0 ${ringPx}px var(--bg-raised)`
          : undefined,
        position: absolute ? "absolute" : undefined,
        top: absolute ? -2 : undefined,
        right: absolute ? -2 : undefined,
        flexShrink: 0,
        ...style,
      }}
      {...rest}
    />
  )
}
