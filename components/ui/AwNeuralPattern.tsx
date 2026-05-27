import * as React from "react"

export type AwNeuralPatternProps = {
  size?: number
  pulse?: boolean
  className?: string
  style?: React.CSSProperties
}

const RINGS = [
  { r: 56, count: 24, dot: 3.5 },
  { r: 86, count: 36, dot: 3.2 },
  { r: 120, count: 52, dot: 2.8 },
  { r: 160, count: 68, dot: 2.4 },
]

/** Signature "sunburst / neural core" illustration used on the onboarding shell. */
export function AwNeuralPattern({
  size = 320,
  pulse = false,
  className,
  style,
}: AwNeuralPatternProps) {
  const center = size / 2
  const uid = React.useId()
  const coreGradientId = `neural-core-${uid}`

  const wrapperStyle: React.CSSProperties = {
    ...(pulse ? { animation: "neuralPatternPulse 5s ease-in-out infinite" } : {}),
    ...style,
  }

  return (
    <>
      <style>{`
        @keyframes neuralPatternPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
      `}</style>
      <svg
        className={className}
        style={wrapperStyle}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={coreGradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,1)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
          </radialGradient>
        </defs>
        <circle cx={center} cy={center} r={size * 0.0813} fill={`url(#${coreGradientId})`} />
        <circle cx={center} cy={center} r={size * 0.0438} fill="#FFFFFF" />
        {RINGS.map((ring, ri) => {
          const dots: React.ReactNode[] = []
          const scale = size / 320
          const ringR = ring.r * scale
          const dotR = ring.dot * scale
          for (let i = 0; i < ring.count; i++) {
            const angle = (i / ring.count) * Math.PI * 2
            const x = center + Math.cos(angle) * ringR
            const y = center + Math.sin(angle) * ringR
            const r = i % 3 === 0 ? dotR * 1.15 : dotR
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
    </>
  )
}
