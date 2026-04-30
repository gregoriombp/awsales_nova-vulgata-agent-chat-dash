import * as React from "react"

export type AIConicBallProps = {
  size?: number
  spinDurationSec?: number
  className?: string
  style?: React.CSSProperties
}

/** Conic + radial gradient AI orb for toolbars (Agent Studio V2). */
export function AIConicBall({
  size = 22,
  spinDurationSec = 9,
  className,
  style,
}: AIConicBallProps) {
  return (
    <>
      <style>{`
        @keyframes aiConicBallSpin { to { transform: rotate(360deg); } }
      `}</style>
      <div
        className={className}
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          position: "relative",
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          ...style,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "conic-gradient(from 200deg, rgba(247,51,152,0.9) 0%, rgba(255,255,255,0.9) 35%, rgba(148,175,255,0.95) 70%, rgba(43,228,255,0.95) 100%)",
            animation: `aiConicBallSpin ${spinDurationSec}s linear infinite`,
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
    </>
  )
}
