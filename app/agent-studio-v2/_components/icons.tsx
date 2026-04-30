"use client"

import * as React from "react"

export type IconProps = {
  name: string
  size?: 12 | 14 | 16 | 18 | 20 | 22 | 24 | 44
  fill?: boolean
  className?: string
  style?: React.CSSProperties
}

export function Icon({ name, size = 20, fill = false, className = "", style }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`as2-mi as2-mi-${size} ${fill ? "as2-mi-fill" : ""} ${className}`.trim()}
      style={style}
    >
      {name}
    </span>
  )
}

export function SparkleStar({
  size = 16,
  color = "#0D0D0D",
  style,
}: {
  size?: number
  color?: string
  style?: React.CSSProperties
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path
        d="M12 2 C 12.6 8.2 15.8 11.4 22 12 C 15.8 12.6 12.6 15.8 12 22 C 11.4 15.8 8.2 12.6 2 12 C 8.2 11.4 11.4 8.2 12 2 Z"
        fill={color}
      />
    </svg>
  )
}

export function ToolbarBall({ size = 20 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        borderRadius: "50%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "conic-gradient(from 200deg, rgba(247,51,152,0.9) 0%, rgba(255,255,255,0.9) 35%, rgba(148,175,255,0.95) 70%, rgba(43,228,255,0.95) 100%)",
          animation: "as2BallSpin 9s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "18%",
          top: "15%",
          width: "64%",
          height: "64%",
          borderRadius: "50%",
          background:
            "radial-gradient(rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
        }}
      />
    </div>
  )
}
