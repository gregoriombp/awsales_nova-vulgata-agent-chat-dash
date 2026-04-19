import * as React from "react"

export type AwChatBubbleProps = {
  variant: "user" | "agent"
  streaming?: boolean
  avatar?: React.ReactNode
  timestamp?: string
  children: React.ReactNode
  className?: string
}

export function AwChatBubble({
  variant,
  streaming,
  avatar,
  timestamp,
  children,
  className,
}: AwChatBubbleProps) {
  const classes = ["aw-chat", `aw-chat--${variant}`, className]
    .filter(Boolean)
    .join(" ")
  return (
    <div className={classes}>
      {variant === "agent" && (
        <div className="aw-chat__avatar">{avatar ?? "AW"}</div>
      )}
      <div
        className="aw-chat__bubble"
        data-streaming={streaming ? "true" : undefined}
      >
        {children}
        {streaming && (
          <span className="aw-chat__dots" aria-label="pensando">
            <i />
            <i />
            <i />
          </span>
        )}
        {timestamp && <span className="aw-chat__time">{timestamp}</span>}
      </div>
    </div>
  )
}
