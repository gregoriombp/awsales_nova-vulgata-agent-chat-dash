import * as React from "react"

export type AwAvatarSize = "sm" | "md" | "lg"

export type AwAvatarProps = React.HTMLAttributes<HTMLSpanElement> & {
  size?: AwAvatarSize
  ai?: boolean
  initials?: string
  src?: string
  alt?: string
}

export function AwAvatar({
  size = "md",
  ai,
  initials,
  src,
  alt,
  className,
  children,
  ...rest
}: AwAvatarProps) {
  const classes = [
    "aw-avatar",
    size !== "md" && `aw-avatar--${size}`,
    ai && "aw-avatar--ai",
    className,
  ]
    .filter(Boolean)
    .join(" ")
  return (
    <span className={classes} {...rest}>
      {src ? (
        <img
          src={src}
          alt={alt ?? ""}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        children ?? initials
      )}
    </span>
  )
}

export function AwAvatarGroup({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={["aw-avatar-group", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </span>
  )
}
