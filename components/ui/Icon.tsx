import * as React from "react"

export type IconProps = {
  name: string
  size?: number
  fill?: 0 | 1
  weight?: 300 | 400 | 500 | 600 | 700
  grade?: -25 | 0 | 200
  className?: string
  style?: React.CSSProperties
}

export function Icon({
  name,
  size = 20,
  fill = 0,
  weight = 400,
  grade = 0,
  className,
  style,
}: IconProps) {
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
