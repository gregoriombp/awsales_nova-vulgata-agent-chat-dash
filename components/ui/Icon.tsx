import * as React from "react"

export type IconProps = {
  name: string
  size?: number
  fill?: 0 | 1
  weight?: 200 | 300 | 400 | 500 | 600 | 700
  grade?: -25 | 0 | 200
  className?: string
  style?: React.CSSProperties
}

export function Icon({
  name,
  size = 20,
  fill = 0,
  weight = 200,
  grade = 0,
  className,
  style,
}: IconProps) {
  if (name === "agent_studio") {
    return (
      <AgentStudioGlyph size={size} className={className} style={style} />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={
        "material-symbols-rounded aw-icon" + (className ? " " + className : "")
      }
      style={{
        fontSize: size,
        lineHeight: 1,
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${size}`,
        ...style,
      }}
    >
      {name}
    </span>
  )
}

/** Agent Studio brand glyph. The design is a multi-tone radial dot pattern
 *  with intentionally hand-tuned variants at each canonical size — so we ship
 *  one SVG per size and snap to the nearest master, rather than scaling one
 *  vector. Colors are baked into the asset and don't follow currentColor. */
const AGENT_STUDIO_SIZES = [12, 16, 20, 24, 28, 32] as const

function AgentStudioGlyph({
  size,
  className,
  style,
}: {
  size: number
  className?: string
  style?: React.CSSProperties
}) {
  const snap = AGENT_STUDIO_SIZES.reduce((best, candidate) =>
    Math.abs(candidate - size) < Math.abs(best - size) ? candidate : best,
  )
  return (
    <span
      aria-hidden="true"
      className={"aw-icon" + (className ? " " + className : "")}
      style={{
        display: "inline-flex",
        width: size,
        height: size,
        lineHeight: 0,
        ...style,
      }}
    >
      <img
        src={`/assets/icons/agent-studio/${snap}.svg`}
        alt=""
        width={size}
        height={size}
        style={{ display: "block" }}
      />
    </span>
  )
}
