"use client"

import * as React from "react"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

const TUNNEL_CX = 100
const TUNNEL_CY = 100
const TUNNEL_MIN_R = 8
const TUNNEL_MAX_R = 92
const NUM_RAYS = 28
const DOTS_PER_RAY = 14
const MIN_DOT_R = 0.35
const MAX_DOT_R = 2.2

export type AwDotTunnelProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Pixel size of the square container. Default 320. */
  size?: number
}

function useTunnelDots() {
  return useMemo(() => {
    const dots: { cx: number; cy: number; r: number; delay: number }[] = []
    for (let ray = 0; ray < NUM_RAYS; ray++) {
      const angle = (ray / NUM_RAYS) * 2 * Math.PI
      for (let i = 0; i < DOTS_PER_RAY; i++) {
        const t = (i + 0.5) / DOTS_PER_RAY
        const r = TUNNEL_MIN_R + t * (TUNNEL_MAX_R - TUNNEL_MIN_R)
        const dotR = MIN_DOT_R + (r / TUNNEL_MAX_R) * (MAX_DOT_R - MIN_DOT_R)
        const cx = TUNNEL_CX + r * Math.cos(angle)
        const cy = TUNNEL_CY + r * Math.sin(angle)
        const delay = (ray / NUM_RAYS) * 0.8 + (i / DOTS_PER_RAY) * 0.6
        dots.push({ cx, cy, r: dotR, delay })
      }
    }
    return dots
  }, [])
}

export function AwDotTunnel({
  size = 320,
  className,
  style,
  ...rest
}: AwDotTunnelProps) {
  const dots = useTunnelDots()
  return (
    <div
      className={cn("aw-dot-tunnel", className)}
      style={{ width: size, height: size, ...style }}
      {...rest}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {dots.map((dot, i) => (
          <circle
            key={i}
            className="aw-dot-tunnel__dot"
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill="var(--fg-primary)"
            style={{ animationDelay: `${dot.delay}s` }}
          />
        ))}
      </svg>
    </div>
  )
}
