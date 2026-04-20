import * as React from "react"

export type SparkleStarProps = {
  size?: number
  color?: string
  pulse?: boolean
  className?: string
  style?: React.CSSProperties
}

/** Four-pointed convex-cross "sparkle" glyph — AI thinking / auto-magic state. */
export function SparkleStar({
  size = 16,
  color = "currentColor",
  pulse = false,
  className,
  style,
}: SparkleStarProps) {
  const mergedStyle: React.CSSProperties = {
    ...(pulse ? { animation: "sparkleStarPulse 2.2s ease-in-out infinite" } : {}),
    ...style,
  }
  return (
    <>
      <style>{`
        @keyframes sparkleStarPulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50%      { transform: scale(1.15) rotate(-4deg); opacity: 0.85; }
        }
      `}</style>
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={mergedStyle}
      >
        <path
          d="M12 2 C 12.6 8.2 15.8 11.4 22 12 C 15.8 12.6 12.6 15.8 12 22 C 11.4 15.8 8.2 12.6 2 12 C 8.2 11.4 11.4 8.2 12 2 Z"
          fill={color}
        />
      </svg>
    </>
  )
}
