import * as React from "react"

export type AwSkeletonShape = "block" | "line" | "title" | "avatar" | "card"

export type AwSkeletonProps = React.HTMLAttributes<HTMLSpanElement> & {
  shape?: AwSkeletonShape
  width?: number | string
  height?: number | string
  /** Radius override (accepts a token name like "--radius-lg" or a raw CSS value). */
  radius?: string
}

export function AwSkeleton({
  shape = "block",
  width,
  height,
  radius,
  className,
  style,
  ...rest
}: AwSkeletonProps) {
  const classes = [
    "aw-skel",
    shape !== "block" && `aw-skel--${shape}`,
    className,
  ]
    .filter(Boolean)
    .join(" ")
  const inlineStyle: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width: typeof width === "number" ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === "number" ? `${height}px` : height } : {}),
    ...(radius ? { borderRadius: radius.startsWith("--") ? `var(${radius})` : radius } : {}),
  }
  return (
    <span
      aria-hidden="true"
      role="presentation"
      className={classes}
      style={inlineStyle}
      {...rest}
    />
  )
}
