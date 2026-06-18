"use client"

import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/utils"

export type AwChatBubbleProps = {
  variant: "user" | "agent"
  streaming?: boolean
  avatar?: React.ReactNode
  timestamp?: string
  children: React.ReactNode
  className?: string
  /** Ação de copiar — chamada no clique. Se ausente, `copyText` é usado. */
  onCopy?: () => void
  /** Texto copiado pro clipboard quando `onCopy` não é passado. */
  copyText?: string
  /** Ação de regenerar a resposta. */
  onRetry?: () => void
  /** Feedback de qualidade (loop de aprendizado). */
  onFeedback?: (value: "up" | "down") => void
  /** Estado inicial do feedback. */
  feedback?: "up" | "down" | null
}

function ActionButton({
  icon,
  label,
  fill = 1,
  active,
  onClick,
}: {
  icon: string
  label: string
  fill?: 0 | 1
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors duration-aw-fast hover:bg-(--bg-hover)",
        active ? "text-(--accent-brand)" : "text-(--fg-tertiary) hover:text-(--fg-secondary)",
      )}
    >
      <Icon name={icon} size={16} fill={active ? 1 : fill} />
    </button>
  )
}

export function AwChatBubble({
  variant,
  streaming,
  avatar,
  timestamp,
  children,
  className,
  onCopy,
  copyText,
  onRetry,
  onFeedback,
  feedback = null,
}: AwChatBubbleProps) {
  const [copied, setCopied] = React.useState(false)
  const [fb, setFb] = React.useState<"up" | "down" | null>(feedback)
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    },
    [],
  )

  const canCopy = !!onCopy || !!copyText
  const showActions =
    variant === "agent" && (canCopy || !!onRetry || !!onFeedback)

  const handleCopy = () => {
    if (onCopy) {
      onCopy()
    } else if (copyText) {
      void navigator.clipboard?.writeText(copyText)
    }
    setCopied(true)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 1500)
  }

  const handleFeedback = (value: "up" | "down") => {
    setFb(value)
    onFeedback?.(value)
  }

  const classes = cn(
    "aw-chat",
    `aw-chat--${variant}`,
    showActions && "group",
    className,
  )

  const bubble = (
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
  )

  return (
    <div className={classes}>
      {variant === "agent" && (
        <div className="aw-chat__avatar">{avatar ?? "AW"}</div>
      )}
      {showActions ? (
        <div className="flex min-w-0 flex-col gap-1">
          {bubble}
          <div
            className={cn(
              "flex items-center gap-0.5 transition-opacity duration-aw-fast focus-within:opacity-100",
              fb ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
          >
            {canCopy && (
              <ActionButton
                icon={copied ? "check" : "content_copy"}
                label={copied ? "Copiado" : "Copiar"}
                onClick={handleCopy}
              />
            )}
            {onRetry && (
              <ActionButton icon="refresh" label="Regenerar" onClick={onRetry} />
            )}
            {onFeedback && (
              <>
                <ActionButton
                  icon="thumb_up"
                  label="Boa resposta"
                  fill={0}
                  active={fb === "up"}
                  onClick={() => handleFeedback("up")}
                />
                <ActionButton
                  icon="thumb_down"
                  label="Resposta ruim"
                  fill={0}
                  active={fb === "down"}
                  onClick={() => handleFeedback("down")}
                />
              </>
            )}
          </div>
        </div>
      ) : (
        bubble
      )}
    </div>
  )
}
