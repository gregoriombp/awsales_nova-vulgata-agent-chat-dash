import * as React from "react"

export type GradientMeshBackdropProps = {
  opacity?: number
  blurPx?: number
  className?: string
  style?: React.CSSProperties
}

/** Animated 4-blob gradient mesh used behind AI "thinking" overlays (Wizard, Publish hero). */
export function GradientMeshBackdrop({
  opacity = 0.55,
  blurPx = 64,
  className,
  style,
}: GradientMeshBackdropProps) {
  return (
    <>
      <style>{`
        @keyframes gradientMeshDrift {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(40px, 30px) scale(1.1); }
          100% { transform: translate(-30px, 20px) scale(0.95); }
        }
      `}</style>
      <div
        className={className}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          filter: `blur(${blurPx}px)`,
          opacity,
          ...style,
        }}
      >
        {[
          { bg: "#89BCFF", left: "30%", top: "20%", delay: "-2s" },
          { bg: "#86E1FF", left: "15%", top: "35%", delay: "-6s" },
          { bg: "#FC41FF", left: "55%", top: "8%", delay: "-4s" },
          { bg: "#FFD54A", left: "45%", top: "25%", delay: "-9s" },
        ].map((blob, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              width: 360,
              height: 220,
              borderRadius: "50%",
              background: blob.bg,
              left: blob.left,
              top: blob.top,
              animation: "gradientMeshDrift 14s ease-in-out infinite alternate",
              animationDelay: blob.delay,
              willChange: "transform",
            }}
          />
        ))}
      </div>
    </>
  )
}
