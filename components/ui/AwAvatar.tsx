"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

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
  return (
    <AvatarPrimitive.Root
      className={cn(
        "aw-avatar",
        size !== "md" && `aw-avatar--${size}`,
        ai && "aw-avatar--ai",
        className
      )}
      {...rest}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={alt ?? ""}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      <AvatarPrimitive.Fallback>
        {children ?? initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

export function AwAvatarGroup({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("aw-avatar-group", className)} {...rest}>
      {children}
    </span>
  )
}
